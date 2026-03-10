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

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  max-width: 300px;
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

const Btn = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: var(--bg-light);
  color: var(--text-dark);
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
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
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--bg-light);
  font-size: 0.85rem;
  vertical-align: middle;
`;

const EventBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  background: ${p => {
    if (p.type?.includes('FAIL') || p.type?.includes('ERROR') || p.type === 'UNAUTHORIZED') return '#FFF5F5';
    if (p.type?.includes('SUCCESS') || p.type?.includes('LOGIN')) return '#D1FAE5';
    if (p.type?.includes('REGISTER')) return '#EBF8FF';
    return 'var(--bg-light)';
  }};
  color: ${p => {
    if (p.type?.includes('FAIL') || p.type?.includes('ERROR') || p.type === 'UNAUTHORIZED') return 'var(--accent-coral)';
    if (p.type?.includes('SUCCESS') || p.type?.includes('LOGIN')) return '#065F46';
    if (p.type?.includes('REGISTER')) return '#1E40AF';
    return 'var(--text-dark)';
  }};
`;

const DetailText = styled.span`
  color: var(--text-light);
  font-size: 0.8rem;
  font-family: monospace;
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

const PAGE_SIZE = 30;

const EVENT_TYPES = [
  'all',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'REGISTER',
  'PASSWORD_RESET',
  'UNAUTHORIZED',
  'TOKEN_REFRESH',
  'LOGOUT',
];

function AdminAuditLog() {
  const { authFetch } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    authFetch('/admin/events/?limit=500')
      .then(r => r.json())
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => {
      const matchQ = !q ||
        (e.user_email || '').toLowerCase().includes(q) ||
        (e.ip_address || '').toLowerCase().includes(q) ||
        (e.detail || '').toLowerCase().includes(q) ||
        e.event_type.toLowerCase().includes(q);
      const matchT = typeFilter === 'all' || e.event_type === typeFilter;
      return matchQ && matchT;
    });
  }, [events, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const handleType   = e => { setTypeFilter(e.target.value); setPage(1); };

  const fmt = d => new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Page>
      <Header>
        <Title>Audit Log</Title>
        <Btn onClick={load} disabled={loading}>↺ Refresh</Btn>
      </Header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <FilterRow>
        <SearchInput
          type="search"
          placeholder="Search email, IP, detail…"
          value={search}
          onChange={handleSearch}
        />
        <FilterSelect value={typeFilter} onChange={handleType}>
          {EVENT_TYPES.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All event types' : t}</option>
          ))}
        </FilterSelect>
        {filtered.length !== events.length && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            {filtered.length} of {events.length} events
          </span>
        )}
      </FilterRow>

      {loading ? <Loading>Loading audit log…</Loading> : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Event</Th>
                <Th>User</Th>
                <Th>IP Address</Th>
                <Th>Detail</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5}><EmptyState>No events match your filters.</EmptyState></td></tr>
              ) : paginated.map(e => (
                <tr key={e.id}>
                  <Td style={{ whiteSpace: 'nowrap' }}>{fmt(e.created_at)}</Td>
                  <Td><EventBadge type={e.event_type}>{e.event_type}</EventBadge></Td>
                  <Td>{e.user_email || <span style={{ color: 'var(--text-light)' }}>—</span>}</Td>
                  <Td><DetailText>{e.ip_address || '—'}</DetailText></Td>
                  <Td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <DetailText title={e.detail}>{e.detail || '—'}</DetailText>
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

export default AdminAuditLog;
