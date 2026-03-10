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

const FilterSelect = styled.select`
  padding: 0.6rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--white);
  cursor: pointer;
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
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SrcLink = styled.a`
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
  &:hover { color: var(--primary-teal); text-decoration: underline; }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${p =>
    p.status === 'ok'      ? '#D1FAE5' :
    p.status === 'error'   ? '#FFF5F5' : 'var(--bg-light)'};
  color: ${p =>
    p.status === 'ok'    ? '#065F46' :
    p.status === 'error' ? 'var(--accent-coral)' : 'var(--text-light)'};
`;

const FreqBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${p =>
    p.freq === 'hourly' ? '#FFF3CD' :
    p.freq === 'daily'  ? '#EBF8FF' : '#F0FFF4'};
  color: ${p =>
    p.freq === 'hourly' ? '#92400E' :
    p.freq === 'daily'  ? '#1E40AF' : '#276749'};
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  background: #EBF8FF;
  color: #2B6CB0;
  margin-left: 0.4rem;
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

function AdminURLs() {
  const { authFetch } = useAuth();
  const [sources, setSources] = useState([]);
  const [userMap, setUserMap] = useState({});       // owner_id → email
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      authFetch('/admin/sources/').then(r => r.json()),
      authFetch('/admin/users/').then(r => r.json()),
    ])
      .then(([srcs, users]) => {
        setSources(srcs);
        const map = {};
        users.forEach(u => { map[u.id] = u.email; });
        setUserMap(map);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sources.filter(s => {
      const matchQ  = !q || s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q) || (userMap[s.owner_id] || '').toLowerCase().includes(q);
      const matchSt = statusFilter === 'all' || (statusFilter === 'active' && s.is_active) || (statusFilter === 'inactive' && !s.is_active) || (statusFilter === 'error' && s.last_status === 'error') || (statusFilter === 'default' && s.is_default);
      return matchQ && matchSt;
    });
  }, [sources, search, statusFilter, userMap]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const handleFilter = e => { setStatusFilter(e.target.value); setPage(1); };

  const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const activeSrc  = sources.filter(s => s.is_active).length;
  const errorSrc   = sources.filter(s => s.last_status === 'error').length;
  const defaultSrc = sources.filter(s => s.is_default).length;

  return (
    <Page>
      <Header>
        <Title>All User Sources</Title>
      </Header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <Stats>
        <Stat><StatNum>{sources.length}</StatNum><StatLabel>Total</StatLabel></Stat>
        <Stat><StatNum color="var(--primary-teal)">{activeSrc}</StatNum><StatLabel>Active</StatLabel></Stat>
        <Stat><StatNum color="var(--accent-coral)">{errorSrc}</StatNum><StatLabel>Errored</StatLabel></Stat>
        <Stat><StatNum color="#3182CE">{defaultSrc}</StatNum><StatLabel>From Defaults</StatLabel></Stat>
      </Stats>

      <FilterRow>
        <SearchInput
          type="search"
          placeholder="Search name, URL, or owner…"
          value={search}
          onChange={handleSearch}
        />
        <FilterSelect value={statusFilter} onChange={handleFilter}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Errored</option>
          <option value="default">From Defaults</option>
        </FilterSelect>
      </FilterRow>

      {loading ? <Loading>Loading sources…</Loading> : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th>Owner</Th>
                <Th>Frequency</Th>
                <Th>Status</Th>
                <Th>Last Checked</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6}><EmptyState>No sources match your filters.</EmptyState></td></tr>
              ) : paginated.map(s => (
                <tr key={s.id}>
                  <Td title={s.name}>
                    {s.name}
                    {s.is_default && <DefaultBadge>Default</DefaultBadge>}
                  </Td>
                  <Td>
                    <SrcLink href={s.url} target="_blank" rel="noopener noreferrer" title={s.url}>
                      {s.url.replace(/^https?:\/\//, '')}
                    </SrcLink>
                  </Td>
                  <Td title={userMap[s.owner_id]}>{userMap[s.owner_id] || `User #${s.owner_id}`}</Td>
                  <Td><FreqBadge freq={s.check_frequency}>{s.check_frequency}</FreqBadge></Td>
                  <Td>
                    <StatusBadge status={s.is_active ? (s.last_status === 'error' ? 'error' : 'ok') : 'inactive'}>
                      {!s.is_active ? 'Disabled' : s.last_status === 'error' ? 'Error' : 'Active'}
                    </StatusBadge>
                  </Td>
                  <Td style={{ whiteSpace: 'nowrap' }}>{fmt(s.last_checked)}</Td>
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

export default AdminURLs;
