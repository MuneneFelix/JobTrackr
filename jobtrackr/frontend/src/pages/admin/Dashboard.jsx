import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
  font-size: 2rem;
  font-weight: 700;
  color: ${p => p.color || 'var(--primary-blue)'};
  line-height: 1;
  margin-bottom: 0.35rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Section = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--bg-light);

  a {
    color: var(--primary-teal);
    font-size: 0.85rem;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
`;

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 1.25rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
  background: var(--bg-light);
`;

const Td = styled.td`
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--bg-light);
  font-size: 0.9rem;
  vertical-align: middle;
  &:last-child { border-bottom: 0; }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${p => p.admin ? '#EBF8FF' : 'var(--bg-light)'};
  color: ${p => p.admin ? 'var(--primary-teal)' : 'var(--text-light)'};
`;

const JobLink = styled.a`
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
  &:hover { color: var(--primary-teal); text-decoration: underline; }
`;

const EmptyRow = styled.tr``;
const EmptyTd = styled.td`
  padding: 2rem;
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
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

// ── Component ──────────────────────────────────────────────────────────────────

function AdminDashboard() {
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

  const stats = [
    { label: 'Total Users', value: users.length, color: 'var(--primary-blue)' },
    { label: 'Active Users', value: users.filter(u => u.is_active).length, color: 'var(--primary-teal)' },
    { label: 'Admins', value: users.filter(u => u.is_admin).length, color: '#805AD5' },
    { label: 'Jobs Indexed', value: jobs.length, color: 'var(--primary-blue)' },
    { label: 'User Sources', value: sources.filter(s => s.is_active).length, color: 'var(--primary-teal)' },
    { label: 'Default Sources', value: defaults.filter(d => d.is_active).length, color: '#D69E2E' },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const recentJobs = jobs.slice(0, 8);

  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) return <Loading>Loading dashboard…</Loading>;

  return (
    <Page>
      <Header>
        <Title>Dashboard</Title>
      </Header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <StatsGrid>
        {stats.map(s => (
          <StatCard key={s.label}>
            <StatNum color={s.color}>{s.value.toLocaleString()}</StatNum>
            <StatLabel>{s.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <Grid2>
        {/* Recent Users */}
        <Section>
          <SectionHeader>
            <SectionTitle>Recent Users</SectionTitle>
            <Link to="/admin/users">View all →</Link>
          </SectionHeader>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <EmptyRow><EmptyTd colSpan={3}>No users yet</EmptyTd></EmptyRow>
                ) : recentUsers.map(u => (
                  <tr key={u.id}>
                    <Td>{u.email}</Td>
                    <Td><Badge admin={u.is_admin}>{u.is_admin ? 'Admin' : 'User'}</Badge></Td>
                    <Td>{fmt(u.created_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </Section>

        {/* Recent Jobs */}
        <Section>
          <SectionHeader>
            <SectionTitle>Latest Jobs Indexed</SectionTitle>
            <Link to="/admin/jobs">View all →</Link>
          </SectionHeader>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Company</Th>
                  <Th>Found</Th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <EmptyRow><EmptyTd colSpan={3}>No jobs indexed yet</EmptyTd></EmptyRow>
                ) : recentJobs.map(j => (
                  <tr key={j.id}>
                    <Td>
                      <JobLink href={j.url} target="_blank" rel="noopener noreferrer">
                        {j.title.length > 32 ? j.title.slice(0, 32) + '…' : j.title}
                      </JobLink>
                    </Td>
                    <Td>{j.company}</Td>
                    <Td>{fmt(j.found_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </Section>
      </Grid2>
    </Page>
  );
}

export default AdminDashboard;
