import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Shared layout ──────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin: 0;
`;

const AddButton = styled.button`
  padding: 0.65rem 1.4rem;
  background: var(--primary-teal);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #235f60; box-shadow: 0 4px 12px rgba(44,122,123,0.3); }
`;

const ErrorBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
`;

const SuccessBanner = styled.div`
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
`;

const StatusText = styled.p`
  color: var(--text-light);
  padding: 2rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: var(--text-light);
  h2 { color: var(--text-dark); margin-bottom: 0.5rem; }
  p  { font-size: 0.9rem; margin-bottom: 1.5rem; }
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #e8f4fd;
  color: #2b6cb0;
  margin-left: 0.4rem;
  vertical-align: middle;
`;

// ── Grid view (≤ GRID_THRESHOLD sources) ──────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
`;

const Card = styled.div`
  background: var(--white);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-left: 4px solid ${p => p.failed ? 'var(--error)' : p.active ? 'var(--primary-teal)' : '#e2e8f0'};
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const SourceName = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.3rem;
`;

const SourceUrl = styled.a`
  color: var(--primary-teal);
  font-size: 0.78rem;
  word-break: break-all;
  text-decoration: none;
  opacity: 0.8;
  &:hover { opacity: 1; text-decoration: underline; }
`;

const StatusPill = styled.span`
  flex-shrink: 0;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => p.failed ? '#fff5f5' : p.pending ? 'var(--bg-light)' : '#e6f7ee'};
  color:       ${p => p.failed ? 'var(--error)' : p.pending ? 'var(--text-light)' : 'var(--success)'};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f0f4f8;
  margin: 0.85rem 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const InfoItem = styled.div`
  text-align: center;
  flex: 1;
`;

const InfoValue = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${p => p.failed ? 'var(--error)' : 'var(--text-dark)'};
`;

const InfoLabel = styled.div`
  font-size: 0.72rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.15rem;
`;

const FailureNote = styled.div`
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  background: #fff5f5;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--error);
  line-height: 1.5;
  word-break: break-word;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #f0f4f8;
`;

const ActionBtn = styled.button`
  flex: 1;
  padding: 0.45rem 0;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${p => p.danger ? '#fed7d7' : '#e2e8f0'};
  background: ${p => p.danger ? '#fff5f5' : 'transparent'};
  color: ${p => p.danger ? 'var(--error)' : 'var(--text-light)'};
  &:hover {
    border-color: ${p => p.danger ? 'var(--error)' : 'var(--primary-teal)'};
    color:        ${p => p.danger ? 'var(--error)' : 'var(--primary-teal)'};
    background:   ${p => p.danger ? '#fff0f0' : '#f0fdfd'};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ── List view (> GRID_THRESHOLD sources) ──────────────────────────────────────

const ListWrap = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 1.25rem;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1rem;
  background: ${p =>
    p.variant === 'failed'  ? '#FFF5F5' :
    p.variant === 'ok'      ? '#F0FFF4' : 'var(--bg-light)'};
  border-bottom: 1px solid ${p =>
    p.variant === 'failed'  ? '#fed7d7' :
    p.variant === 'ok'      ? '#9ae6b4' : '#e2e8f0'};
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${p =>
    p.variant === 'failed'  ? 'var(--error)' :
    p.variant === 'ok'      ? '#276749' : 'var(--text-light)'};
`;

const SectionCount = styled.span`
  background: ${p =>
    p.variant === 'failed'  ? '#fed7d7' :
    p.variant === 'ok'      ? '#c6f6d5' : '#e2e8f0'};
  color: ${p =>
    p.variant === 'failed'  ? '#c53030' :
    p.variant === 'ok'      ? '#22543d' : 'var(--text-light)'};
  border-radius: 999px;
  padding: 0.05rem 0.5rem;
  font-size: 0.72rem;
`;

const ListRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--bg-light);
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafcff; }

  @media (max-width: 700px) { flex-wrap: wrap; }
`;

const StatusDot = styled.span`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p =>
    p.variant === 'failed'  ? 'var(--error)' :
    p.variant === 'ok'      ? 'var(--success)' : '#cbd5e0'};
`;

const RowInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RowName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowUrl = styled.a`
  font-size: 0.72rem;
  color: var(--text-light);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  &:hover { color: var(--primary-teal); text-decoration: underline; }
`;

const RowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 700px) { display: none; }
`;

const FreqBadge = styled.span`
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${p =>
    p.freq === 'hourly' ? '#FFF3CD' :
    p.freq === 'daily'  ? '#EBF8FF' : '#F0FFF4'};
  color: ${p =>
    p.freq === 'hourly' ? '#92400E' :
    p.freq === 'daily'  ? '#1E40AF' : '#276749'};
`;

const MetaText = styled.span`
  font-size: 0.78rem;
  color: var(--text-light);
  white-space: nowrap;
`;

const RowFailNote = styled.div`
  width: 100%;
  margin-top: 0.3rem;
  padding: 0.35rem 0.6rem;
  background: #fff5f5;
  border-radius: 5px;
  font-size: 0.72rem;
  color: var(--error);
`;

const RowActions = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
`;

const RowBtn = styled.button`
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  &:hover:not(:disabled) {
    border-color: var(--primary-teal);
    color: var(--primary-teal);
    background: #f0fdfd;
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ViewJobsBtn = styled(RowBtn)`
  border-color: var(--primary-teal);
  color: var(--primary-teal);
  &:hover { background: var(--primary-teal); color: white; }
`;

// ── Edit Modal ────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
`;

const Modal = styled.div`
  background: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f4f8;
  h3 { margin: 0; font-size: 1.1rem; color: var(--text-dark); }
`;

const CloseBtn = styled.button`
  background: none; border: none;
  font-size: 1.25rem; color: var(--text-light);
  cursor: pointer; line-height: 1; padding: 0.25rem;
  &:hover { color: var(--text-dark); }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1.1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--white);
  transition: border-color 0.2s;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-light);
  border-radius: 8px;
`;

const ToggleLabel = styled.div`
  font-size: 0.9rem; font-weight: 500; color: var(--text-dark);
  small { display: block; font-size: 0.75rem; color: var(--text-light); font-weight: 400; }
`;

const Toggle = styled.button`
  width: 44px; height: 24px;
  border-radius: 999px; border: none;
  background: ${p => p.on ? 'var(--primary-teal)' : '#cbd5e0'};
  cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0;
  &::after {
    content: '';
    position: absolute;
    width: 18px; height: 18px;
    border-radius: 50%; background: white;
    top: 3px; left: ${p => p.on ? '23px' : '3px'};
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f4f8;
  gap: 0.75rem;
`;

const DeleteBtn = styled.button`
  padding: 0.6rem 1.1rem;
  border: 1.5px solid #fed7d7; background: #fff5f5; color: var(--error);
  border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer;
  transition: all 0.15s;
  &:hover { background: var(--error); color: white; border-color: var(--error); }
`;

const SaveBtn = styled.button`
  flex: 1;
  padding: 0.6rem 1.5rem;
  background: var(--primary-teal); color: white;
  border: none; border-radius: 8px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #235f60; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRID_THRESHOLD = 5;

const isFailed  = s => s.last_status === 'failed' || s.last_status === 'error';
const isPending = s => !s.last_checked;
const isOk      = s => !isFailed(s) && !isPending(s);

const sortByChecked = arr => [...arr].sort((a, b) => {
  if (!a.last_checked && !b.last_checked) return 0;
  if (!a.last_checked) return 1;
  if (!b.last_checked) return -1;
  return new Date(b.last_checked) - new Date(a.last_checked);
});

const fmtDate = d => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

// ── EditModal ─────────────────────────────────────────────────────────────────

function EditModal({ source, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: source.name,
    url: source.url,
    check_frequency: source.check_frequency,
    is_active: source.is_active,
  });
  const [saving, setSaving]               = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]                 = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await onSave(source.id, form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>Edit Source</h3>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>

        <ModalBody>
          {error && <ErrorBanner>{error}</ErrorBanner>}

          <FormGroup>
            <Label>Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </FormGroup>

          <FormGroup>
            <Label>URL</Label>
            <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </FormGroup>

          <FormGroup>
            <Label>Check Frequency</Label>
            <ModalSelect value={form.check_frequency} onChange={e => setForm(f => ({ ...f, check_frequency: e.target.value }))}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </ModalSelect>
          </FormGroup>

          <ToggleRow>
            <ToggleLabel>
              Active
              <small>{form.is_active ? 'Scraping enabled' : 'Scraping paused'}</small>
            </ToggleLabel>
            <Toggle on={form.is_active} onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} />
          </ToggleRow>
        </ModalBody>

        <ModalFooter>
          {confirmDelete ? (
            <>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Are you sure?</span>
              <DeleteBtn onClick={() => onDelete(source.id)}>Yes, delete</DeleteBtn>
              <SaveBtn onClick={() => setConfirmDelete(false)} style={{ flex: 'none', padding: '0.6rem 1rem' }}>Cancel</SaveBtn>
            </>
          ) : (
            <>
              <DeleteBtn onClick={() => setConfirmDelete(true)}>Delete</DeleteBtn>
              <SaveBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</SaveBtn>
            </>
          )}
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}

// ── List section ──────────────────────────────────────────────────────────────

function ListSection({ sources, variant, label, scraping, onScrape, onEdit, onViewJobs }) {
  if (sources.length === 0) return null;

  const dotVariant = variant === 'pending' ? 'pending' : variant;

  return (
    <ListWrap>
      <SectionHead variant={variant}>
        {variant === 'failed' ? '⚠' : variant === 'ok' ? '✓' : '○'}
        &nbsp;{label}
        <SectionCount variant={variant}>{sources.length}</SectionCount>
      </SectionHead>

      {sources.map(s => (
        <ListRow key={s.id}>
          <StatusDot variant={dotVariant} />

          <RowInfo>
            <RowName>
              {s.name}
              {s.is_default && <DefaultBadge>Default</DefaultBadge>}
            </RowName>
            <RowUrl href={s.url} target="_blank" rel="noopener noreferrer" title={s.url}>
              {s.url.replace(/^https?:\/\//, '')}
            </RowUrl>
            {isFailed(s) && s.failure_reason && (
              <RowFailNote title={s.failure_reason}>
                {s.failure_reason.length > 100 ? s.failure_reason.slice(0, 100) + '…' : s.failure_reason}
              </RowFailNote>
            )}
          </RowInfo>

          <RowMeta>
            <FreqBadge freq={s.check_frequency}>{s.check_frequency}</FreqBadge>
            {s.last_checked && <MetaText>{fmtDate(s.last_checked)}</MetaText>}
          </RowMeta>

          <RowActions>
            <ViewJobsBtn onClick={() => onViewJobs(s.id)}>
              💼 Jobs
            </ViewJobsBtn>
            <RowBtn onClick={() => onEdit(s)}>⚙</RowBtn>
            <RowBtn disabled={scraping[s.id]} onClick={() => onScrape(s.id)}>
              {scraping[s.id] ? '…' : '↻'}
            </RowBtn>
          </RowActions>
        </ListRow>
      ))}
    </ListWrap>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function URLs() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [sources, setSources]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [syncing, setSyncing]       = useState(false);
  const [syncMsg, setSyncMsg]       = useState('');
  const [scraping, setScraping]     = useState({});
  const [editSource, setEditSource] = useState(null);

  useEffect(() => { loadSources(); }, []);

  const loadSources = () => {
    authFetch('/sources/')
      .then(res => { if (!res.ok) throw new Error('Failed to load sources'); return res.json(); })
      .then(setSources)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleSave = async (id, form) => {
    const res = await authFetch(`/sources/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to update source');
    }
    const updated = await res.json();
    setSources(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleDelete = async (id) => {
    const res = await authFetch(`/sources/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    setSources(prev => prev.filter(s => s.id !== id));
    setEditSource(null);
  };

  const handleSyncDefaults = async () => {
    setSyncing(true); setSyncMsg(''); setError('');
    try {
      const res = await authFetch('/sources/sync-defaults', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      setSyncMsg(data.added > 0
        ? `Added ${data.added} new default source${data.added > 1 ? 's' : ''}.`
        : 'Already up to date — no new defaults to add.');
      if (data.added > 0) loadSources();
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleScrape = async (id) => {
    setScraping(s => ({ ...s, [id]: true }));
    try {
      await authFetch(`/sources/${id}/scrape`, { method: 'POST' });
      setTimeout(loadSources, 5_000);
    } finally {
      setScraping(s => ({ ...s, [id]: false }));
    }
  };

  const handleViewJobs = (sourceId) => {
    navigate(`/jobs?source=${sourceId}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const useListView = sources.length > GRID_THRESHOLD;

  const failedSources  = sortByChecked(sources.filter(isFailed));
  const okSources      = sortByChecked(sources.filter(isOk));
  const pendingSources = sortByChecked(sources.filter(isPending));

  return (
    <Page>
      <Header>
        <Title>Job Sources</Title>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <AddButton
            onClick={handleSyncDefaults}
            disabled={syncing}
            style={{ background: '#6b46c1' }}
          >
            {syncing ? 'Syncing…' : '↓ Get Default Sources'}
          </AddButton>
          <AddButton onClick={() => navigate('/urls/add')}>+ Add Source</AddButton>
        </div>
      </Header>

      {error   && <ErrorBanner>{error}</ErrorBanner>}
      {syncMsg && <SuccessBanner>{syncMsg}</SuccessBanner>}

      {loading ? (
        <StatusText>Loading…</StatusText>

      ) : sources.length === 0 ? (
        <EmptyState>
          <h2>No job sources yet</h2>
          <p>Add a job board or career page to start tracking listings.</p>
          <AddButton onClick={() => navigate('/urls/add')}>+ Add Your First Source</AddButton>
        </EmptyState>

      ) : useListView ? (
        // ── Grouped list view ────────────────────────────────────────────
        <>
          <ListSection
            sources={failedSources}
            variant="failed"
            label="Failed"
            scraping={scraping}
            onScrape={handleScrape}
            onEdit={setEditSource}
            onViewJobs={handleViewJobs}
          />
          <ListSection
            sources={okSources}
            variant="ok"
            label="Successful"
            scraping={scraping}
            onScrape={handleScrape}
            onEdit={setEditSource}
            onViewJobs={handleViewJobs}
          />
          <ListSection
            sources={pendingSources}
            variant="pending"
            label="Not yet scraped"
            scraping={scraping}
            onScrape={handleScrape}
            onEdit={setEditSource}
            onViewJobs={handleViewJobs}
          />
        </>

      ) : (
        // ── Grid card view ───────────────────────────────────────────────
        <Grid>
          {sortByChecked(sources).map(source => {
            const failed  = isFailed(source);
            const pending = isPending(source);
            return (
              <Card key={source.id} active={source.is_active && !failed} failed={failed}>
                <CardHeader>
                  <div>
                    <SourceName>
                      {source.name}
                      {source.is_default && <DefaultBadge>Default</DefaultBadge>}
                    </SourceName>
                    <SourceUrl href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.url}
                    </SourceUrl>
                  </div>
                  <StatusPill failed={failed} pending={pending && !failed}>
                    {failed ? 'failed' : pending ? 'pending' : 'active'}
                  </StatusPill>
                </CardHeader>

                <Divider />

                <InfoRow>
                  <InfoItem>
                    <InfoValue>{source.check_frequency}</InfoValue>
                    <InfoLabel>Frequency</InfoLabel>
                  </InfoItem>
                  <InfoItem>
                    <InfoValue failed={failed}>{source.last_status ?? '—'}</InfoValue>
                    <InfoLabel>Last Status</InfoLabel>
                  </InfoItem>
                  <InfoItem>
                    <InfoValue>{fmtDate(source.last_checked)}</InfoValue>
                    <InfoLabel>Last Checked</InfoLabel>
                  </InfoItem>
                </InfoRow>

                {failed && source.failure_reason && (
                  <FailureNote>
                    ⚠ {source.failure_reason.length > 120
                      ? source.failure_reason.slice(0, 120) + '…'
                      : source.failure_reason}
                  </FailureNote>
                )}

                <CardActions>
                  <ActionBtn onClick={() => handleViewJobs(source.id)}>💼 Jobs</ActionBtn>
                  <ActionBtn onClick={() => setEditSource(source)}>⚙ Edit</ActionBtn>
                  <ActionBtn
                    disabled={scraping[source.id]}
                    onClick={() => handleScrape(source.id)}
                  >
                    {scraping[source.id] ? 'Scraping…' : '↻ Scrape'}
                  </ActionBtn>
                </CardActions>
              </Card>
            );
          })}
        </Grid>
      )}

      {editSource && (
        <EditModal
          source={editSource}
          onClose={() => setEditSource(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </Page>
  );
}
