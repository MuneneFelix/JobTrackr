import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div``;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
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

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
`;

const RefreshBtn = styled.button`
  padding: 0.5rem 1.25rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover:not(:disabled) { background: #f7fafc; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const LastChecked = styled.p`
  font-size: 0.78rem;
  color: var(--text-light);
  margin: 0;
`;

// ── Grid ──────────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

// ── Card ──────────────────────────────────────────────────────────────────────

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const CardWrap = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 1.4rem 1.5rem;
  border-left: 4px solid ${p => {
    if (p.$status === 'ok' || p.$status === 'configured') return '#48bb78';
    if (p.$status === 'warn')                               return '#f6ad55';
    if (p.$status === 'error')                              return '#fc8181';
    if (p.$status === 'stopped' || p.$status === 'unconfigured') return '#a0aec0';
    return '#a0aec0';
  }};
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const CardIcon = styled.span`
  font-size: 1.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  ${p => (p.$s === 'ok' || p.$s === 'configured')
    && 'background: #f0fff4; color: #276749;'}
  ${p => p.$s === 'warn'
    && 'background: #fffaf0; color: #c05621;'}
  ${p => p.$s === 'error'
    && 'background: #fff5f5; color: #c53030;'}
  ${p => (p.$s === 'stopped' || p.$s === 'unconfigured')
    && 'background: #f7fafc; color: #718096;'}
`;

const CardName = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.25rem;
`;

const CardDetail = styled.p`
  font-size: 0.82rem;
  color: var(--text-light);
  margin: 0;
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--primary-teal);
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 0.35rem;
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICE_META = {
  api:       { icon: '🚀', label: 'API' },
  database:  { icon: '🗄️',  label: 'Database' },
  groq:      { icon: '🤖', label: 'Groq AI' },
  scheduler: { icon: '⏰', label: 'Scheduler' },
  smtp:      { icon: '📧', label: 'SMTP Email' },
  cache:     { icon: '⚡', label: 'Scrape Cache' },
  disk:      { icon: '💾', label: 'Disk / DB Size' },
};

// preferred display order
const SERVICE_ORDER = ['api', 'database', 'scheduler', 'groq', 'smtp', 'cache', 'disk'];

function HealthCard({ name, data }) {
  const meta    = SERVICE_META[name] || { icon: '🔧', label: name };
  const status  = data?.status || 'unknown';
  const detail  = data?.detail || '—';

  return (
    <CardWrap $status={status}>
      <CardTop>
        <CardIcon>{meta.icon}</CardIcon>
        <StatusBadge $s={status}>{status}</StatusBadge>
      </CardTop>
      <CardName>{meta.label}</CardName>
      <CardDetail>{detail}</CardDetail>
    </CardWrap>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminHealth() {
  const { authFetch } = useAuth();

  const [health, setHealth]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastChecked, setLast]    = useState(null);
  const [secAgo, setSecAgo]       = useState(0);
  const secTimer                  = useRef(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res  = await authFetch('/admin/health/');
      const data = await res.json();
      setHealth(data);
      setLast(new Date());
      setSecAgo(0);
    } catch {
      // keep stale data on failure
    } finally {
      setLoading(false);
    }
  };

  // initial load + auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "X seconds ago" counter
  useEffect(() => {
    clearInterval(secTimer.current);
    secTimer.current = setInterval(() => setSecAgo(s => s + 1), 1000);
    return () => clearInterval(secTimer.current);
  }, [lastChecked]);

  const orderedKeys = health
    ? [...SERVICE_ORDER.filter(k => k in health), ...Object.keys(health).filter(k => !SERVICE_ORDER.includes(k))]
    : [];

  return (
    <Page>
      <PageHeader>
        <TitleBlock>
          <Title>System Health</Title>
          <Subtitle>Live status of JobTrackr services. Auto-refreshes every 30 seconds.</Subtitle>
        </TitleBlock>
        <HeaderRight>
          <RefreshBtn onClick={fetchHealth} disabled={loading}>
            {loading ? <><Spinner />Checking…</> : '↺ Refresh'}
          </RefreshBtn>
          {lastChecked && (
            <LastChecked>
              Last checked: {secAgo < 5 ? 'just now' : `${secAgo}s ago`}
            </LastChecked>
          )}
        </HeaderRight>
      </PageHeader>

      {!health && loading ? (
        <Grid>
          {SERVICE_ORDER.map(k => (
            <CardWrap key={k} $status="unknown">
              <CardTop>
                <CardIcon>{SERVICE_META[k]?.icon || '🔧'}</CardIcon>
                <Spinner />
              </CardTop>
              <CardName>{SERVICE_META[k]?.label || k}</CardName>
              <CardDetail>Checking…</CardDetail>
            </CardWrap>
          ))}
        </Grid>
      ) : (
        <Grid>
          {orderedKeys.map(key => (
            <HealthCard key={key} name={key} data={health[key]} />
          ))}
        </Grid>
      )}
    </Page>
  );
}
