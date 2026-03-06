"""
AI helpers for resume parsing, email generation, and resume tailoring.
Uses Groq (llama-3.1-8b-instant) — same API key as the scraper.
"""

import json
import logging
from groq import Groq

logger = logging.getLogger(__name__)

# Groq picks up GROQ_API_KEY from the environment automatically
_groq = Groq()

_MODEL = "llama-3.1-8b-instant"


def _call(prompt: str, max_tokens: int = 1500, temperature: float = 0.2) -> str:
    """Make a Groq chat completion and return the raw text."""
    response = _groq.chat.completions.create(
        model=_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


def _parse_json(text: str) -> dict:
    """Strip markdown fences and parse JSON."""
    if "```" in text:
        # grab content between first pair of fences
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else parts[0]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


def parse_resume(resume_text: str) -> dict:
    """Extract structured profile data from raw resume text."""
    prompt = f"""Extract structured data from this resume text. Return ONLY valid JSON — no markdown, no explanation.

Required JSON shape:
{{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "github": "string",
  "skills": ["string"],
  "education": [{{"school": "string", "degree": "string", "field": "string", "start_year": "string", "end_year": "string"}}],
  "experience": [{{"company": "string", "title": "string", "start_date": "string", "end_date": "string", "description": "string"}}]
}}

Use empty strings / empty arrays for missing fields. Do NOT include any text outside the JSON object.

Resume text:
{resume_text[:8000]}"""

    try:
        text = _call(prompt, max_tokens=2000, temperature=0.1)
        return _parse_json(text)
    except Exception as exc:
        logger.error("parse_resume failed: %s", exc)
        return {}


def generate_application_email(job: dict, profile: dict) -> dict:
    """Generate a tailored job application email for one job listing."""
    experience_lines = "\n".join(
        f"  - {e.get('title','?')} at {e.get('company','?')} ({e.get('start_date','')}–{e.get('end_date','')})"
        for e in (profile.get("experience") or [])[:3]
    )
    education_lines = "\n".join(
        f"  - {e.get('degree','?')} in {e.get('field','?')} from {e.get('school','?')}"
        for e in (profile.get("education") or [])[:2]
    )
    skills_str = ", ".join((profile.get("skills") or [])[:15])

    prompt = f"""Write a professional job application email. Return ONLY valid JSON — no markdown, no explanation.

Applicant:
  Name: {profile.get("full_name") or "Applicant"}
  Skills: {skills_str}
  Experience:
{experience_lines or "  (none listed)"}
  Education:
{education_lines or "  (none listed)"}

Job:
  Title: {job.get("title", "N/A")}
  Company: {job.get("company", "N/A")}
  Description: {(job.get("description") or "")[:1000]}

Required JSON shape:
{{
  "subject": "concise professional email subject",
  "body": "full email body — 3-4 paragraphs, plain text, professional yet personable, mention the specific role and company"
}}"""

    try:
        text = _call(prompt, max_tokens=1200, temperature=0.7)
        return _parse_json(text)
    except Exception as exc:
        logger.error("generate_application_email failed for job %s: %s", job.get("id"), exc)
        return {
            "subject": f"Application for {job.get('title','the position')} at {job.get('company','')}",
            "body": "Please find my application attached.",
        }


def tailor_resume(job: dict, profile: dict) -> dict:
    """Generate a tailored resume summary + highlight relevant skills for one job."""
    skills_str = ", ".join((profile.get("skills") or [])[:20])
    experience_json = json.dumps((profile.get("experience") or [])[:3], ensure_ascii=False)

    prompt = f"""Given the applicant's profile and a job listing, create a tailored resume summary.
Return ONLY valid JSON — no markdown, no explanation.

Applicant skills: {skills_str}
Applicant experience (JSON): {experience_json}

Job: {job.get("title","N/A")} at {job.get("company","N/A")}
Job description: {(job.get("description") or "")[:800]}

Required JSON shape:
{{
  "summary": "2-3 sentence tailored professional summary emphasising fit for this specific role",
  "highlighted_skills": ["up to 8 most relevant skills from the applicant's list"]
}}"""

    try:
        text = _call(prompt, max_tokens=500, temperature=0.5)
        return _parse_json(text)
    except Exception as exc:
        logger.error("tailor_resume failed for job %s: %s", job.get("id"), exc)
        return {"summary": "", "highlighted_skills": []}
