import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";

// ── Layout ────────────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin: 0;
`;

const NewBadge = styled.span`
  padding: 0.2rem 0.65rem;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
`;

// ── Toolbar ───────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--white);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const Select = styled.select`
  padding: 0.45rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-dark);
  background: var(--bg-light);
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: var(--primary-teal);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--text-dark);
  cursor: pointer;

  input { cursor: pointer; accent-color: var(--primary-teal); }
`;

const Divider = styled.div`
  width: 1px;
  height: 1.25rem;
  background: #e2e8f0;
`;

const ScrapeButton = styled.button`
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1.5px solid var(--primary-teal);
  border-radius: 6px;
  background: ${p => p.loading ? 'var(--bg-light)' : 'transparent'};
  color: var(--primary-teal);
  cursor: ${p => p.loading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${p => p.loading ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: var(--primary-teal);
    color: var(--white);
  }
`;

// ── States ────────────────────────────────────────────────────────────────────

const ErrorBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const StatusText = styled.p`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  font-size: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);

  h2 { color: var(--text-dark); margin-bottom: 0.5rem; }
  p  { font-size: 0.9rem; }
`;

// ── Job list ──────────────────────────────────────────────────────────────────

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const JobCard = styled.div`
  background: var(--white);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border-left: 4px solid ${p => p.isNew ? 'var(--primary-teal)' : 'transparent'};
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const JobTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.3rem;
`;

const Company = styled.div`
  font-size: 0.875rem;
  color: var(--primary-teal);
  font-weight: 500;
`;

const NewDot = styled.span`
  flex-shrink: 0;
  padding: 0.2rem 0.6rem;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.6rem 0;
`;

const Pill = styled.span`
  padding: 0.2rem 0.65rem;
  background: var(--bg-light);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--text-light);
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: var(--text-light);
  margin: 0.5rem 0 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f4f8;
`;

const DateText = styled.span`
  font-size: 0.8rem;
  color: var(--text-light);
`;

const MarkReadBtn = styled.button`
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--primary-teal);
    color: var(--primary-teal);
  }
`;

const ApplyLink = styled.a`
  padding: 0.3rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 5px;
  background: var(--primary-teal);
  color: var(--white);
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: #235f60; }
`;

const ActionBtn = styled.button`
  padding: 0.3rem 0.55rem;
  font-size: 0.8rem;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;

  &:hover { border-color: ${p => p.danger ? '#fc8181' : p.warn ? '#f6ad55' : '#9ae6b4'};
            background: ${p => p.danger ? '#fff5f5' : p.warn ? '#fffaf0' : '#f0fff4'}; }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmBox = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 1.75rem 2rem;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);

  h3 { margin: 0 0 0.5rem; color: var(--text-dark); font-size: 1.05rem; }
  p  { margin: 0 0 1.25rem; font-size: 0.875rem; color: var(--text-light); }
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
`;

const DangerBtn = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 7px;
  background: #e53e3e;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Jobs() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ sourceId: "", newOnly: false, starredOnly: false });
  const [scraping, setScraping] = useState({});
  const [confirm, setConfirm] = useState(null); // { type: 'delete'|'blacklist', job }

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter.sourceId) params.set("source_id", filter.sourceId);
      if (filter.newOnly) params.set("new_only", "true");

      const [jobsRes, sourcesRes] = await Promise.all([
        authFetch(`/jobs/?${params}`),
        authFetch("/sources/"),
      ]);
      if (!jobsRes.ok || !sourcesRes.ok) throw new Error("Failed to load data");
      setJobs(await jobsRes.json());
      setSources(await sourcesRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerScrape = async (sourceId) => {
    setScraping((s) => ({ ...s, [sourceId]: true }));
    try {
      await authFetch(`/sources/${sourceId}/scrape`, { method: "POST" });
      setTimeout(loadData, 5_000);
    } catch (err) {
      setError(err.message);
    } finally {
      setScraping((s) => ({ ...s, [sourceId]: false }));
    }
  };

  const markRead = async (jobId, e) => {
    e.stopPropagation();
    await authFetch(`/jobs/${jobId}/read`, { method: "PATCH" });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, is_new: false } : j)));
  };

  const toggleStar = async (jobId, e) => {
    e.stopPropagation();
    const res = await authFetch(`/jobs/${jobId}/star`, { method: "PATCH" });
    if (res.ok) {
      const data = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, is_starred: data.is_starred } : j)));
    }
  };

  const deleteJob = async () => {
    if (!confirm) return;
    await authFetch(`/jobs/${confirm.job.id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j.id !== confirm.job.id));
    setConfirm(null);
  };

  const blacklistCompany = async () => {
    if (!confirm) return;
    await authFetch(`/jobs/${confirm.job.id}/blacklist`, { method: "POST" });
    const company = confirm.job.company;
    setJobs((prev) => prev.filter((j) => j.company !== company));
    setConfirm(null);
  };

  const newCount = jobs.filter((j) => j.is_new).length;
  const displayed = filter.starredOnly ? jobs.filter((j) => j.is_starred) : jobs;

  return (
    <Page>
      <PageHeader>
        <TitleRow>
          <Title>Jobs</Title>
          {newCount > 0 && <NewBadge>{newCount} new</NewBadge>}
        </TitleRow>

        <Toolbar>
          <Select
            value={filter.sourceId}
            onChange={(e) => setFilter((f) => ({ ...f, sourceId: e.target.value }))}
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={filter.newOnly}
              onChange={(e) => setFilter((f) => ({ ...f, newOnly: e.target.checked }))}
            />
            New only
          </CheckboxLabel>

          <CheckboxLabel>
            <input
              type="checkbox"
              checked={filter.starredOnly}
              onChange={(e) => setFilter((f) => ({ ...f, starredOnly: e.target.checked }))}
            />
            ⭐ Starred
          </CheckboxLabel>

          {sources.length > 0 && <Divider />}

          {sources.map((s) => (
            <ScrapeButton
              key={s.id}
              loading={scraping[s.id]}
              disabled={scraping[s.id]}
              onClick={() => triggerScrape(s.id)}
            >
              {scraping[s.id] ? `Scraping "${s.name}"…` : `↻ Scrape "${s.name}"`}
            </ScrapeButton>
          ))}
        </Toolbar>
      </PageHeader>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <StatusText>Loading jobs…</StatusText>
      ) : displayed.length === 0 ? (
        <EmptyState>
          <h2>No jobs found</h2>
          <p>
            {sources.length === 0
              ? "Add a job source first."
              : filter.starredOnly
              ? "You haven't starred any jobs yet."
              : "Try triggering a scrape above."}
          </p>
        </EmptyState>
      ) : (
        <JobList>
          {displayed.map((job) => (
            <JobCard
              key={job.id}
              isNew={job.is_new}
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <CardTop>
                <div>
                  <JobTitle>{job.title}</JobTitle>
                  {job.company && <Company>{job.company}</Company>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {job.is_new && <NewDot>New</NewDot>}
                  <ActionBtn
                    title={job.is_starred ? "Unstar" : "Star (teaches scraper your preferences)"}
                    onClick={(e) => toggleStar(job.id, e)}
                    style={{ fontSize: '1rem', border: 'none', background: 'transparent', padding: '0.1rem 0.25rem' }}
                  >
                    {job.is_starred ? '⭐' : '☆'}
                  </ActionBtn>
                </div>
              </CardTop>

              <Pills>
                {job.location && <Pill>📍 {job.location}</Pill>}
                {job.salary && <Pill>💰 {job.salary}</Pill>}
              </Pills>

              {job.description && <Description>{job.description}</Description>}

              <CardFooter>
                <DateText>
                  {job.posted_date || new Date(job.found_at).toLocaleDateString()}
                </DateText>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {job.is_new && (
                    <MarkReadBtn onClick={(e) => markRead(job.id, e)}>
                      Mark read
                    </MarkReadBtn>
                  )}
                  {job.company && (
                    <ActionBtn
                      warn
                      title={`Blacklist ${job.company} — won't show their jobs again`}
                      onClick={(e) => { e.stopPropagation(); setConfirm({ type: 'blacklist', job }); }}
                    >
                      🚫
                    </ActionBtn>
                  )}
                  <ActionBtn
                    danger
                    title="Delete this job"
                    onClick={(e) => { e.stopPropagation(); setConfirm({ type: 'delete', job }); }}
                  >
                    🗑
                  </ActionBtn>
                  {job.url && (
                    <ApplyLink
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Apply ↗
                    </ApplyLink>
                  )}
                </div>
              </CardFooter>
            </JobCard>
          ))}
        </JobList>
      )}

      {confirm && (
        <ConfirmOverlay onClick={() => setConfirm(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            {confirm.type === 'delete' ? (
              <>
                <h3>Delete job?</h3>
                <p>"{confirm.job.title}" will be permanently removed.</p>
                <ConfirmBtns>
                  <CancelBtn onClick={() => setConfirm(null)}>Cancel</CancelBtn>
                  <DangerBtn onClick={deleteJob}>Delete</DangerBtn>
                </ConfirmBtns>
              </>
            ) : (
              <>
                <h3>Blacklist {confirm.job.company}?</h3>
                <p>
                  All jobs from <strong>{confirm.job.company}</strong> will be removed
                  and the scraper will ignore them going forward.
                </p>
                <ConfirmBtns>
                  <CancelBtn onClick={() => setConfirm(null)}>Cancel</CancelBtn>
                  <DangerBtn onClick={blacklistCompany}>Blacklist</DangerBtn>
                </ConfirmBtns>
              </>
            )}
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </Page>
  );
}
