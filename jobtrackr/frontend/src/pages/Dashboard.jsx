import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Layout ────────────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, var(--primary-blue) 0%, #2a4a7f 100%);
  color: var(--white);
  padding: 2rem;
  border-radius: 14px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(26,54,93,0.3);

  h1 { font-size: 1.75rem; margin: 0 0 0.35rem; }
  p  { margin: 0; opacity: 0.8; font-size: 0.95rem; }
`;

// ── Stats ─────────────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-top: 3px solid ${p => p.$accent || 'var(--primary-teal)'};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  }
`;

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--primary-blue);
  line-height: 1;
  margin-bottom: 0.4rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
`;

// ── Body grid ─────────────────────────────────────────────────────────────────

const BodyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;

  h2 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0;
  }
`;

const SeeAll = styled(Link)`
  font-size: 0.8rem;
  color: var(--primary-teal);
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const PanelList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const PanelItem = styled.li`
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f7fafc;
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: ${p => p.$clickable ? '#f7fafc' : 'transparent'}; }
`;

const JobRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
`;

const JobName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-dark);
`;

const JobMeta = styled.span`
  font-size: 0.75rem;
  color: var(--text-light);
  white-space: nowrap;
`;

const NewDot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary-teal);
  margin-right: 0.4rem;
  flex-shrink: 0;
  margin-top: 5px;
`;

const SourceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SourceName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-dark);
`;

const StatusPill = styled.span`
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-weight: 600;
  background: ${p => p.$ok ? '#e6f7ee' : '#fff5f5'};
  color: ${p => p.$ok ? 'var(--success)' : 'var(--error)'};
`;

const EmptyNote = styled.p`
  text-align: center;
  color: var(--text-light);
  font-size: 0.875rem;
  padding: 2rem;
  margin: 0;
`;

// ── Quick actions ─────────────────────────────────────────────────────────────

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const ActionBtn = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.85rem;
  background: ${p => p.$secondary ? 'var(--bg-light)' : 'var(--primary-teal)'};
  color: ${p => p.$secondary ? 'var(--text-dark)' : 'var(--white)'};
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/jobs/').then(r => r.ok ? r.json() : []),
      authFetch('/sources/').then(r => r.ok ? r.json() : []),
    ]).then(([j, s]) => {
      setJobs(j);
      setSources(s);
    }).finally(() => setLoading(false));
  }, [authFetch]);

  const totalJobs   = jobs.length;
  const newJobs     = jobs.filter(j => j.is_new).length;
  const activeSrcs  = sources.filter(s => s.is_active).length;
  const failedSrcs  = sources.filter(s => s.last_status === 'failed').length;

  const recentJobs  = [...jobs]
    .sort((a, b) => new Date(b.found_at) - new Date(a.found_at))
    .slice(0, 5);

  return (
    <Page>
      <WelcomeCard>
        <h1>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋</h1>
        <p>Here's what's happening with your job search today.</p>
      </WelcomeCard>

      <StatsGrid>
        <StatCard $accent="var(--primary-teal)">
          <StatValue>{loading ? '—' : activeSrcs}</StatValue>
          <StatLabel>Active Sources</StatLabel>
        </StatCard>
        <StatCard $accent="#4299e1">
          <StatValue>{loading ? '—' : totalJobs}</StatValue>
          <StatLabel>Total Jobs</StatLabel>
        </StatCard>
        <StatCard $accent="var(--success)">
          <StatValue>{loading ? '—' : newJobs}</StatValue>
          <StatLabel>Unread</StatLabel>
        </StatCard>
        <StatCard $accent={failedSrcs > 0 ? 'var(--error)' : 'var(--success)'}>
          <StatValue>{loading ? '—' : failedSrcs}</StatValue>
          <StatLabel>Failed Sources</StatLabel>
        </StatCard>
      </StatsGrid>

      <Actions>
        <ActionBtn to="/urls/add">+ Add Source</ActionBtn>
        <ActionBtn to="/jobs" $secondary>Browse Jobs</ActionBtn>
      </Actions>

      <BodyGrid>
        <Panel>
          <PanelHeader>
            <h2>Recent Jobs</h2>
            <SeeAll to="/jobs">See all</SeeAll>
          </PanelHeader>
          <PanelList>
            {loading ? (
              <EmptyNote>Loading…</EmptyNote>
            ) : recentJobs.length === 0 ? (
              <EmptyNote>No jobs yet. Trigger a scrape to find some!</EmptyNote>
            ) : recentJobs.map(job => (
              <PanelItem key={job.id} $clickable onClick={() => navigate(`/jobs/${job.id}`)}>
                <JobRow>
                  <span style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {job.is_new && <NewDot />}
                    <JobName>{job.title}</JobName>
                  </span>
                  <JobMeta>{new Date(job.found_at).toLocaleDateString()}</JobMeta>
                </JobRow>
                {job.company && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.15rem', paddingLeft: job.is_new ? '1rem' : 0 }}>
                    {job.company}{job.location ? ` · ${job.location}` : ''}
                  </div>
                )}
              </PanelItem>
            ))}
          </PanelList>
        </Panel>

        <Panel>
          <PanelHeader>
            <h2>Job Sources</h2>
            <SeeAll to="/urls">Manage</SeeAll>
          </PanelHeader>
          <PanelList>
            {loading ? (
              <EmptyNote>Loading…</EmptyNote>
            ) : sources.length === 0 ? (
              <EmptyNote>No sources yet. <Link to="/urls/add">Add one</Link>.</EmptyNote>
            ) : sources.map(src => (
              <PanelItem key={src.id}>
                <SourceRow>
                  <SourceName>{src.name}</SourceName>
                  <StatusPill $ok={src.last_status !== 'failed'}>
                    {src.last_status || 'pending'}
                  </StatusPill>
                </SourceRow>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                  {src.check_frequency} · {src.is_active ? 'active' : 'inactive'}
                </div>
              </PanelItem>
            ))}
          </PanelList>
        </Panel>
      </BodyGrid>
    </Page>
  );
}
