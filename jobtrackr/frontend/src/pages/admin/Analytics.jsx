import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Styled Components ──────────────────────────────────────────────────────────

const Page = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--bg-light);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
`;

const StatNum = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${p => p.color || 'var(--primary-blue)'};
  line-height: 1;
  margin-bottom: 0.3rem;
`;

const StatLabel = styled.div`
  font-size: 0.78rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Card = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  margin-bottom: 1.25rem;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-light);
  background: var(--bg-light);
`;

const Td = styled.td`
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--bg-light);
  font-size: 0.875rem;
  &:last-child { border-bottom: 0; }
`;

const Bar = styled.div`
  height: 8px;
  border-radius: 999px;
  background: var(--bg-light);
  margin-top: 0.3rem;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: ${p => p.color || 'var(--primary-teal)'};
  width: ${p => p.pct}%;
  transition: width 0.5s ease;
`;

const FreqBadge = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${p =>
    p.freq === 'hourly' ? '#FFF3CD' :
    p.freq === 'daily'  ? '#D1FAE5' : '#EBF8FF'};
  color: ${p =>
    p.freq === 'hourly' ? '#92400E' :
    p.freq === 'daily'  ? '#065F46' : '#1E40AF'};
`;

const Loading = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
`;

const ErrorBanner = styled.div`
  background: #FFF5F5;
  color: var(--accent-coral);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ── Component ──────────────────────────────────────────────────────────────────

function AdminAnalytics() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [sources, setSources] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [defaults, setDefaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      authFetch('/admin/users/').then(r => r.json()),
      authFetch('/admin/sources/').then(r => r.json()),
      authFetch('/admin/jobs/').then(r => r.json()),
      authFetch('/admin/default-sources/').then(r => r.json()),
    ])
      .then(([u, s, j, d]) => { setUsers(u); setSources(s); setJobs(j); setDefaults(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading>Loading analytics…</Loading>;

  // ── User stats ────────────────────────────────────────────────────────────
  const activeUsers    = users.filter(u => u.is_active).length;
  const inactiveUsers  = users.filter(u => !u.is_active).length;
  const adminUsers     = users.filter(u => u.is_admin).length;
  const newUsers7d     = users.filter(u => new Date(u.created_at) >= daysAgo(7)).length;
  const newUsers30d    = users.filter(u => new Date(u.created_at) >= daysAgo(30)).length;

  // ── Jobs stats ────────────────────────────────────────────────────────────
  const jobs7d         = jobs.filter(j => new Date(j.found_at) >= daysAgo(7)).length;
  const jobs24h        = jobs.filter(j => new Date(j.found_at) >= daysAgo(1)).length;
  const starredJobs    = jobs.filter(j => j.is_starred).length;

  // ── Source stats ──────────────────────────────────────────────────────────
  const activeSrc      = sources.filter(s => s.is_active).length;
  const failedSrc      = sources.filter(s => s.last_status === 'error').length;
  const defaultSrc     = sources.filter(s => s.is_default).length;
  const freqGroups     = groupBy(sources, 'check_frequency');

  // ── Default source categories ─────────────────────────────────────────────
  const catGroups = groupBy(defaults, 'category');
  const catRows = Object.entries(catGroups)
    .sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...catRows.map(c => c[1]), 1);

  const activeDefaults   = defaults.filter(d => d.is_active).length;
  const disabledDefaults = defaults.filter(d => !d.is_active).length;

  return (
    <Page>
      <Header>
        <Title>Analytics</Title>
      </Header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* ── Users ── */}
      <Card>
        <SectionTitle>👥 Users</SectionTitle>
        <Grid>
          <StatCard><StatNum>{users.length}</StatNum><StatLabel>Total</StatLabel></StatCard>
          <StatCard><StatNum color="var(--primary-teal)">{activeUsers}</StatNum><StatLabel>Active</StatLabel></StatCard>
          <StatCard><StatNum color="var(--accent-coral)">{inactiveUsers}</StatNum><StatLabel>Inactive</StatLabel></StatCard>
          <StatCard><StatNum color="#805AD5">{adminUsers}</StatNum><StatLabel>Admins</StatLabel></StatCard>
          <StatCard><StatNum color="var(--primary-teal)">{newUsers7d}</StatNum><StatLabel>New (7 days)</StatLabel></StatCard>
          <StatCard><StatNum>{newUsers30d}</StatNum><StatLabel>New (30 days)</StatLabel></StatCard>
        </Grid>
      </Card>

      {/* ── Jobs ── */}
      <Card>
        <SectionTitle>💼 Jobs Indexed</SectionTitle>
        <Grid>
          <StatCard><StatNum>{jobs.length.toLocaleString()}</StatNum><StatLabel>Total</StatLabel></StatCard>
          <StatCard><StatNum color="var(--primary-teal)">{jobs24h}</StatNum><StatLabel>Last 24 h</StatLabel></StatCard>
          <StatCard><StatNum color="var(--primary-teal)">{jobs7d}</StatNum><StatLabel>Last 7 days</StatLabel></StatCard>
          <StatCard><StatNum color="#D69E2E">{starredJobs}</StatNum><StatLabel>Starred</StatLabel></StatCard>
        </Grid>
      </Card>

      <Grid2>
        {/* ── User Sources ── */}
        <Card style={{ marginBottom: 0 }}>
          <SectionTitle>🔗 User Sources</SectionTitle>
          <Grid style={{ marginBottom: '1rem' }}>
            <StatCard><StatNum>{sources.length}</StatNum><StatLabel>Total</StatLabel></StatCard>
            <StatCard><StatNum color="var(--primary-teal)">{activeSrc}</StatNum><StatLabel>Active</StatLabel></StatCard>
            <StatCard><StatNum color="var(--accent-coral)">{failedSrc}</StatNum><StatLabel>Errored</StatLabel></StatCard>
            <StatCard><StatNum color="#3182CE">{defaultSrc}</StatNum><StatLabel>From Defaults</StatLabel></StatCard>
          </Grid>
          <Table>
            <thead>
              <tr>
                <Th>Frequency</Th>
                <Th>Count</Th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(freqGroups).map(([freq, count]) => (
                <tr key={freq}>
                  <Td><FreqBadge freq={freq}>{freq}</FreqBadge></Td>
                  <Td>{count}</Td>
                </tr>
              ))}
              {Object.keys(freqGroups).length === 0 && (
                <tr><Td colSpan={2} style={{ color: 'var(--text-light)', textAlign: 'center' }}>No sources yet</Td></tr>
              )}
            </tbody>
          </Table>
        </Card>

        {/* ── Default Sources ── */}
        <Card style={{ marginBottom: 0 }}>
          <SectionTitle>🌐 Default Sources</SectionTitle>
          <Grid style={{ marginBottom: '1rem' }}>
            <StatCard><StatNum>{defaults.length}</StatNum><StatLabel>Total</StatLabel></StatCard>
            <StatCard><StatNum color="var(--primary-teal)">{activeDefaults}</StatNum><StatLabel>Active</StatLabel></StatCard>
            <StatCard><StatNum color="var(--accent-coral)">{disabledDefaults}</StatNum><StatLabel>Disabled</StatLabel></StatCard>
          </Grid>
          <Table>
            <thead>
              <tr>
                <Th>Category</Th>
                <Th>Count</Th>
                <Th>Distribution</Th>
              </tr>
            </thead>
            <tbody>
              {catRows.map(([cat, count]) => (
                <tr key={cat}>
                  <Td>{cat}</Td>
                  <Td>{count}</Td>
                  <Td style={{ minWidth: 80 }}>
                    <Bar><BarFill pct={(count / maxCat) * 100} /></Bar>
                  </Td>
                </tr>
              ))}
              {catRows.length === 0 && (
                <tr><Td colSpan={3} style={{ color: 'var(--text-light)', textAlign: 'center' }}>No default sources yet</Td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Grid2>
    </Page>
  );
}

export default AdminAnalytics;
