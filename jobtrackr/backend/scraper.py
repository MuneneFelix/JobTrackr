"""
JobTrackr Scraper
-----------------
Fetches job board pages and uses Claude AI to extract structured job listings.
Works on any job board without custom parsers — AI handles the variation.
"""

import re
import json
import asyncio
import logging
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from groq import Groq

logger = logging.getLogger(__name__)

# Groq client (uses GROQ_API_KEY env var automatically)
_groq = Groq()

# ---------------------------------------------------------------------------
# Fetch
# ---------------------------------------------------------------------------

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


async def fetch_html(url: str) -> str:
    """Fetch raw HTML from a URL with a realistic browser header."""
    async with httpx.AsyncClient(
        timeout=30,
        follow_redirects=True,
        headers=HEADERS,
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text


# ---------------------------------------------------------------------------
# Parse / clean
# ---------------------------------------------------------------------------

# Tags that add noise but no content
_NOISE_TAGS = [
    "script", "style", "noscript", "nav", "footer",
    "header", "aside", "meta", "link", "svg", "img",
]


def _clean_html(html: str, base_url: str) -> tuple[str, list[str]]:
    """
    Returns:
        page_text  – cleaned plain text, truncated to ~8 000 chars
        job_links  – list of "Link text: absolute_url" strings for links that
                     look like they could be job postings
    """
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(_NOISE_TAGS):
        tag.decompose()

    # Collect links that look job-related
    job_keywords = re.compile(
        r"job|career|position|role|opening|vacancy|hire|recruit|apply",
        re.I,
    )
    job_links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = str(a["href"]).strip()
        text = a.get_text(strip=True)
        if not href or not text or len(text) < 4:
            continue
        absolute = urljoin(base_url, href)
        if job_keywords.search(href) or job_keywords.search(text):
            job_links.append(f"{text}: {absolute}")

    # Fall back to all links if none matched
    if not job_links:
        for a in soup.find_all("a", href=True):
            href = str(a["href"]).strip()
            text = a.get_text(strip=True)
            if text and len(text) > 3 and href.startswith("http"):
                job_links.append(f"{text}: {urljoin(base_url, href)}")

    # Plain text
    text = soup.get_text(separator="\n", strip=True)
    text = re.sub(r"\n{3,}", "\n\n", text)   # collapse blank lines

    return text[:8_000], job_links[:80]


# ---------------------------------------------------------------------------
# AI extraction
# ---------------------------------------------------------------------------

_SYSTEM = (
    "You are a precise JSON extractor. "
    "You output ONLY valid JSON — no markdown, no prose, no code fences."
)

_PROMPT = """\
Analyse the web page content below from {url} and extract every job listing present.
{keywords_hint}
PAGE TEXT:
{text}

LINKS ON THE PAGE (label: url):
{links}

For each job listing output a JSON object with these exact keys:
  title        – job title (string, required)
  company      – company name; infer from context / domain if not explicit (string)
  location     – city/country or "Remote"; null if unknown (string|null)
  salary       – salary range as a string if mentioned; null otherwise (string|null)
  description  – 1-3 sentence summary of the role if available; null otherwise (string|null)
  url          – direct link to the job; pick the best match from LINKS or construct from base URL (string|null)
  posted_date  – posting date as a string if present; null otherwise (string|null)

Return a JSON ARRAY of those objects. List jobs matching the preferred keywords first if any.
If no jobs are found, return an empty array: []
"""


def _extract_jobs_with_ai(
    page_text: str,
    job_links: list[str],
    source_url: str,
    preferred_keywords: list[str] = None,
) -> list[dict]:
    """Ask Groq to pull structured job data out of raw page content."""
    links_block = "\n".join(job_links) if job_links else "(none)"

    keywords_hint = ""
    if preferred_keywords:
        keywords_hint = (
            f"\nPREFERRED KEYWORDS (list matching jobs first): "
            f"{', '.join(preferred_keywords)}\n"
        )

    prompt = _PROMPT.format(
        url=source_url,
        text=page_text,
        links=links_block,
        keywords_hint=keywords_hint,
    )

    response = _groq.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=4_096,
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": prompt},
        ],
    )

    raw = response.choices[0].message.content.strip()

    # Defensively strip markdown code fences if the model added them anyway
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    return json.loads(raw)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class ScraperError(Exception):
    """Raised when scraping fails for a known reason."""


async def scrape_source(url: str, preferred_keywords: list[str] = None) -> list[dict]:
    """
    Scrape a job source URL and return a list of job dicts.

    Each dict has keys: title, company, location, salary,
                        description, url, posted_date
    Raises ScraperError on network / parse failures.
    """
    logger.info("Scraping: %s", url)

    try:
        html = await fetch_html(url)
    except httpx.HTTPStatusError as exc:
        raise ScraperError(
            f"HTTP {exc.response.status_code} fetching {url}"
        ) from exc
    except httpx.RequestError as exc:
        raise ScraperError(f"Network error fetching {url}: {exc}") from exc

    page_text, job_links = _clean_html(html, url)
    logger.debug(
        "Cleaned HTML: %d chars, %d candidate links", len(page_text), len(job_links)
    )

    try:
        jobs = _extract_jobs_with_ai(page_text, job_links, url, preferred_keywords)
    except json.JSONDecodeError as exc:
        raise ScraperError(f"AI returned invalid JSON for {url}: {exc}") from exc
    except Exception as exc:
        raise ScraperError(f"AI extraction failed for {url}: {exc}") from exc

    logger.info("Found %d jobs at %s", len(jobs), url)
    return jobs


# ---------------------------------------------------------------------------
# DB integration helper (called from main.py)
# ---------------------------------------------------------------------------

def save_new_jobs(db, source_id: int, jobs: list[dict], blacklisted_companies: list[str] = None):
    """
    Persist scraped jobs to the database, skipping duplicates by URL.
    Returns count of newly inserted jobs.
    """
    import models          # local import to avoid circular deps
    import datetime

    _blacklisted_lower = [c.lower() for c in (blacklisted_companies or [])]

    inserted = 0
    for job in jobs:
        job_url = job.get("url")
        company = (job.get("company") or "").strip()

        # Skip blacklisted companies
        if _blacklisted_lower and company.lower() in _blacklisted_lower:
            continue

        # Deduplicate by URL within this source
        if job_url:
            exists = (
                db.query(models.JobListing)
                .filter(
                    models.JobListing.source_id == source_id,
                    models.JobListing.url == job_url,
                )
                .first()
            )
            if exists:
                continue

        listing = models.JobListing(
            title=job.get("title") or "Untitled",
            company=company,
            url=job_url or "",
            location=job.get("location"),
            salary=job.get("salary"),
            description=job.get("description"),
            posted_date=job.get("posted_date"),
            is_new=True,
            found_at=datetime.datetime.utcnow(),
            source_id=source_id,
        )
        db.add(listing)
        inserted += 1

    db.commit()
    return inserted
