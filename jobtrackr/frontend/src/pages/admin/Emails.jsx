import { useState, useEffect, useCallback, Fragment } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div``;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div``;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 1.7rem;
  margin: 0 0 0.25rem;
`;

const Subtitle = styled.p`
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
`;

// ── Toolbar ───────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1.5px solid ${p => p.$active ? 'var(--primary-teal)' : '#e2e8f0'};
  background: ${p => p.$active ? '#edfafa' : 'transparent'};
  color: ${p => p.$active ? 'var(--primary-teal)' : 'var(--text-dark)'};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: var(--primary-teal); background: #edfafa; }
`;

const RefreshBtn = styled.button`
  margin-left: auto;
  padding: 0.4rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 0.82rem;
  cursor: pointer;
  &:hover { background: #f7fafc; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// ── Table ─────────────────────────────────────────────────────────────────────

const TableWrap = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-light);
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f0f4f8;
  cursor: pointer;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafcff; }
  ${p => p.$expanded && 'background: #f7fafc;'}
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-dark);
  vertical-align: top;
`;

const TimeCell = styled.span`
  white-space: nowrap;
  color: var(--text-light);
  font-size: 0.8rem;
`;

const SubjectCell = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

// ── Type badge ────────────────────────────────────────────────────────────────

const TypeBadge = styled.span`
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  ${p => p.$t === 'application' && 'background: #ebf8ff; color: #2b6cb0;'}
  ${p => p.$t === 'digest'      && 'background: #f0fff4; color: #276749;'}
  ${p => p.$t === 'test'        && 'background: #fffff0; color: #975a16;'}
  ${p => !['application','digest','test'].includes(p.$t) && 'background: #f7fafc; color: #718096;'}
`;

// ── Status pill ───────────────────────────────────────────────────────────────

const StatusPill = styled.span`
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  ${p => p.$s === 'sent'   && 'background: #f0fff4; color: #276749;'}
  ${p => p.$s === 'failed' && 'background: #fff5f5; color: #c53030;'}
`;

// ── Expanded row ──────────────────────────────────────────────────────────────

const ExpandedRow = styled.tr`
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const ExpandedCell = styled.td`
  padding: 0 1rem 1rem;
`;

const PreviewBox = styled.pre`
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0 0 0.5rem;
  font-family: inherit;
  color: var(--text-dark);
  max-height: 200px;
  overflow-y: auto;
`;

const ErrorBox = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
`;

// ── Pagination ────────────────────────────────────────────────────────────────

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const PageBtn = styled.button`
  padding: 0.35rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  background: transparent;
  font-size: 0.82rem;
  cursor: pointer;
  &:hover:not(:disabled) { background: #f7fafc; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const PageInfo = styled.span`
  font-size: 0.82rem;
  color: var(--text-light);
`;

// ── Empty / Loading ───────────────────────────────────────────────────────────

const EmptyRow = styled.tr``;

const EmptyCell = styled.td`
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const FILTERS = [
  { label: 'All',         value: '' },
  { label: 'Application', value: 'application' },
  { label: 'Digest',      value: 'digest' },
  { label: 'Test',        value: 'test' },
];

const PAGE_SIZE = 30;

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminEmails() {
  const { authFetch } = useAuth();

  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [typeFilter, setType]   = useState('');
  const [page, setPage]         = useState(1);
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (typeFilter) params.set('email_type', typeFilter);
      const res  = await authFetch(`/admin/emails/?${params}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, typeFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (val) => {
    setType(val);
    setPage(1);
    setExpanded(null);
  };

  const toggleExpand = (id) =>
    setExpanded(prev => prev === id ? null : id);

  const hasMore = logs.length === PAGE_SIZE;

  return (
    <Page>
      <PageHeader>
        <TitleBlock>
          <Title>Email Outbox</Title>
          <Subtitle>Audit log of all emails sent by JobTrackr.</Subtitle>
        </TitleBlock>
      </PageHeader>

      <Toolbar>
        {FILTERS.map(f => (
          <FilterBtn
            key={f.value}
            $active={typeFilter === f.value}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </FilterBtn>
        ))}
        <RefreshBtn onClick={fetchLogs} disabled={loading}>
          {loading ? 'Loading…' : '↺ Refresh'}
        </RefreshBtn>
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Sent at</Th>
              <Th>Type</Th>
              <Th>To</Th>
              <Th>Subject</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow>
                <EmptyCell colSpan={5}>Loading…</EmptyCell>
              </EmptyRow>
            ) : logs.length === 0 ? (
              <EmptyRow>
                <EmptyCell colSpan={5}>No emails found.</EmptyCell>
              </EmptyRow>
            ) : (
              logs.map(log => (
                <Fragment key={log.id}>
                  <Tr
                    $expanded={expanded === log.id}
                    onClick={() => toggleExpand(log.id)}
                  >
                    <Td><TimeCell>{fmtDate(log.sent_at)}</TimeCell></Td>
                    <Td><TypeBadge $t={log.email_type}>{log.email_type}</TypeBadge></Td>
                    <Td style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>{log.to_email}</Td>
                    <Td><SubjectCell>{log.subject}</SubjectCell></Td>
                    <Td><StatusPill $s={log.status}>{log.status}</StatusPill></Td>
                  </Tr>
                  {expanded === log.id && (
                    <ExpandedRow>
                      <ExpandedCell colSpan={5}>
                        {log.body_preview && (
                          <PreviewBox>{log.body_preview}</PreviewBox>
                        )}
                        {log.error && (
                          <ErrorBox>⚠ {log.error}</ErrorBox>
                        )}
                        {!log.body_preview && !log.error && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-light)' }}>No preview available.</p>
                        )}
                      </ExpandedCell>
                    </ExpandedRow>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        {!loading && (page > 1 || hasMore) && (
          <Pagination>
            <PageBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</PageBtn>
            <PageInfo>Page {page}</PageInfo>
            <PageBtn disabled={!hasMore} onClick={() => setPage(p => p + 1)}>Next →</PageBtn>
          </Pagination>
        )}
      </TableWrap>
    </Page>
  );
}
