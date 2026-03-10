import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Styled Components ──────────────────────────────────────────────────────────

const Page = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin: 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  background: var(--white);
  border-radius: 10px;
  padding: 0.9rem 1.4rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  min-width: 120px;
`;

const StatNum = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.color || 'var(--primary-blue)'};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.25rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  max-width: 360px;
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--white);
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const TableWrap = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.65rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
  background: var(--bg-light);
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bg-light);
  font-size: 0.875rem;
  vertical-align: middle;
`;

const JobLink = styled.a`
  color: var(--primary-blue);
  font-weight: 500;
  text-decoration: none;
  &:hover { color: var(--primary-teal); text-decoration: underline; }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${p => p.new ? '#D1FAE5' : 'var(--bg-light)'};
  color: ${p => p.new ? '#065F46' : 'var(--text-light)'};
`;

const StarBadge = styled.span`
  color: #D69E2E;
  font-size: 1rem;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--bg-light);
  font-size: 0.85rem;
  color: var(--text-light);
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PagBtn = styled.button`
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: var(--white);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: var(--bg-light); color: var(--primary-teal); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const PagRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
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

const PAGE_SIZE = 25;

function AdminJobs() {
  const { authFetch } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    authFetch('/admin/jobs/')
      .then(r => r.json())
      .then(setJobs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return jobs;
    return jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };

  const fmt = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const stats7d  = jobs.filter(j => new Date(j.found_at) >= new Date(Date.now() - 7 * 864e5)).length;
  const starred  = jobs.filter(j => j.is_starred).length;

  return (
    <Page>
      <Header>
        <Title>All Jobs</Title>
      </Header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <Stats>
        <Stat><StatNum>{jobs.length.toLocaleString()}</StatNum><StatLabel>Total Indexed</StatLabel></Stat>
        <Stat><StatNum color="var(--primary-teal)">{stats7d}</StatNum><StatLabel>Last 7 days</StatLabel></Stat>
        <Stat><StatNum color="#D69E2E">{starred}</StatNum><StatLabel>Starred</StatLabel></Stat>
      </Stats>

      <FilterRow>
        <SearchInput
          type="search"
          placeholder="Search title, company, location…"
          value={search}
          onChange={handleSearch}
        />
      </FilterRow>

      {loading ? <Loading>Loading jobs…</Loading> : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Company</Th>
                <Th>Location</Th>
                <Th>Found</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5}><EmptyState>No jobs match your search.</EmptyState></td></tr>
              ) : paginated.map(j => (
                <tr key={j.id}>
                  <Td>
                    <JobLink href={j.url} target="_blank" rel="noopener noreferrer">
                      {j.title}
                    </JobLink>
                  </Td>
                  <Td>{j.company}</Td>
                  <Td>{j.location || <span style={{ color: 'var(--text-light)' }}>—</span>}</Td>
                  <Td style={{ whiteSpace: 'nowrap' }}>{fmt(j.found_at)}</Td>
                  <Td>
                    {j.is_new && <Badge new>New</Badge>}
                    {j.is_starred && <StarBadge title="Starred">★</StarBadge>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <span>
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <PagRow>
                <PagBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</PagBtn>
                <span>Page {page} / {totalPages}</span>
                <PagBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</PagBtn>
              </PagRow>
            </Pagination>
          )}
        </TableWrap>
      )}
    </Page>
  );
}

export default AdminJobs;
