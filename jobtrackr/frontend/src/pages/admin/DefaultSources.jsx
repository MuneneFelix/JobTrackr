import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Styled Components ──────────────────────────────────────────────────────────

const Page = styled.div` padding: 1rem; `;

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

const BtnRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: ${p => p.secondary ? 'var(--bg-light)' : 'var(--primary-teal)'};
  color: ${p => p.secondary ? 'var(--text-dark)' : 'white'};
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
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
  padding: 0.75rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  font-size: 0.875rem;
  color: var(--text-light);
  span { font-weight: 700; color: var(--primary-blue); font-size: 1.1rem; margin-right: 0.35rem; }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.55rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 220px;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const FilterSelect = styled.select`
  padding: 0.55rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const TableWrap = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f4f8;
  vertical-align: middle;
  color: var(--text-dark);
`;

const CategoryBadge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #e8f4fd;
  color: #2b6cb0;
  white-space: nowrap;
`;

const Toggle = styled.button`
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: ${p => p.on ? 'var(--primary-teal)' : '#cbd5e0'};
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
  &::after {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${p => p.on ? '21px' : '3px'};
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const IconBtn = styled.button`
  padding: 0.3rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-light);
  transition: all 0.15s;
  &:hover { background: #fff5f5; color: var(--error); border-color: #fed7d7; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Modal = styled.div`
  background: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  background: none; border: none; font-size: 1.25rem;
  color: var(--text-light); cursor: pointer;
  &:hover { color: var(--text-dark); }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f4f8;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-family: monospace;
  resize: vertical;
  min-height: 200px;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const HintText = styled.p`
  font-size: 0.78rem;
  color: var(--text-light);
  margin: 0.25rem 0 0;
`;

const ErrorBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const SuccessBanner = styled.div`
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);
  h3 { color: var(--text-dark); }
`;

// ── Tab styles ────────────────────────────────────────────────────────────────

const TabRow = styled.div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 0.6rem 1.1rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: ${p => p.active ? '700' : '400'};
  color: ${p => p.active ? 'var(--primary-teal)' : 'var(--text-light)'};
  border-bottom: 2px solid ${p => p.active ? 'var(--primary-teal)' : 'transparent'};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { color: var(--primary-teal); }
`;

const FileDropZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: ${p => p.hasFile ? '#f0fff4' : '#fafbfc'};
  border-color: ${p => p.hasFile ? '#9ae6b4' : '#cbd5e0'};
  text-align: center;
  &:hover { border-color: var(--primary-teal); background: #f0fdfd; }
  input { display: none; }
  span { font-size: 0.875rem; color: var(--text-light); margin-top: 0.4rem; }
  strong { font-size: 0.95rem; color: var(--text-dark); }
`;

// ── Bulk Upload Modal ──────────────────────────────────────────────────────────

function BulkModal({ onClose, onDone }) {
  const { authFetch } = useAuth();
  const [tab, setTab] = useState('paste');   // 'paste' | 'file'
  const [json, setJson] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const EXAMPLE = JSON.stringify([
    { name: 'ReliefWeb Kenya', url: 'https://reliefweb.int/jobs?advanced-search=(C131)', category: 'Global Aggregators', check_frequency: 'daily' },
    { name: 'UNDP Kenya', url: 'https://www.undp.org/kenya/jobs', category: 'UN Agencies', check_frequency: 'daily' },
  ], null, 2);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setJson(ev.target.result);
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setError(''); setSuccess('');
    let parsed;
    try {
      parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) throw new Error('Must be a JSON array');
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/admin/default-sources/bulk', {
        method: 'POST',
        body: JSON.stringify({ sources: parsed }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || 'Upload failed');
      }
      const data = await res.json();
      setSuccess(`Successfully added ${data.length} sources.`);
      setJson(''); setFileName('');
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>Bulk Upload Default Sources</h3>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorBanner>{error}</ErrorBanner>}
          {success && <SuccessBanner>{success}</SuccessBanner>}

          <TabRow>
            <Tab active={tab === 'paste'} onClick={() => setTab('paste')}>Paste JSON</Tab>
            <Tab active={tab === 'file'} onClick={() => setTab('file')}>Upload JSON File</Tab>
          </TabRow>

          {tab === 'paste' ? (
            <FormGroup>
              <Label>Paste JSON Array</Label>
              <Textarea
                value={json}
                onChange={e => setJson(e.target.value)}
                placeholder={EXAMPLE}
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <FileDropZone hasFile={!!fileName}>
                <input type="file" accept=".json,application/json" onChange={handleFileChange} />
                {fileName ? (
                  <>
                    <strong>✓ {fileName}</strong>
                    <span>Click to change file</span>
                  </>
                ) : (
                  <>
                    <strong>Click to select a JSON file</strong>
                    <span>or drag and drop here</span>
                  </>
                )}
              </FileDropZone>
            </FormGroup>
          )}

          <HintText>
            Each item needs: <code>name</code>, <code>url</code>. Optional: <code>category</code>, <code>check_frequency</code> (hourly/daily/weekly).
          </HintText>
        </ModalBody>
        <ModalFooter>
          <Btn secondary onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleUpload} disabled={loading || !json.trim()}>
            {loading ? 'Uploading…' : `Upload${json ? ` (${(() => { try { return JSON.parse(json).length; } catch { return '?'; } })()})` : ''}`}
          </Btn>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}

// ── Add Single Modal ───────────────────────────────────────────────────────────

function AddModal({ onClose, onDone }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({ name: '', url: '', category: '', check_frequency: 'daily' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    if (!form.name.trim() || !form.url.trim()) {
      setError('Name and URL are required');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/admin/default-sources/', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || 'Failed to add source');
      }
      onDone();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <ModalHeader>
          <h3>Add Default Source</h3>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <FormGroup>
            <Label>Name *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ReliefWeb Kenya" />
          </FormGroup>
          <FormGroup>
            <Label>URL *</Label>
            <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
          </FormGroup>
          <FormGroup>
            <Label>Category</Label>
            <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="UN Agencies" />
          </FormGroup>
          <FormGroup>
            <Label>Check Frequency</Label>
            <Select value={form.check_frequency} onChange={e => setForm(f => ({ ...f, check_frequency: e.target.value }))}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Btn secondary onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding…' : 'Add Source'}
          </Btn>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Global Aggregators', 'Kenya Job Boards', 'Africa Job Boards',
  'UN Agencies', 'Health INGOs', 'Child & Family INGOs', 'Humanitarian & Relief',
  'Development & Governance', 'Environment & Conservation', 'Regional & Development Finance',
  'Education & Research'];

export default function DefaultSources() {
  const { authFetch } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pushMsg, setPushMsg] = useState('');
  const [pushing, setPushing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showBulk, setShowBulk] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadSources(); }, []);

  const loadSources = () => {
    setLoading(true);
    authFetch('/admin/default-sources/')
      .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
      .then(setSources)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleToggle = async (source) => {
    try {
      const res = await authFetch(`/admin/default-sources/${source.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !source.is_active }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setSources(prev => prev.map(s => s.id === source.id ? updated : s));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this default source?')) return;
    try {
      const res = await authFetch(`/admin/default-sources/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setSources(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = sources.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.url.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handlePushToAll = async () => {
    if (!window.confirm('Push all active default sources to every existing user who doesn\'t have them yet?')) return;
    setPushing(true); setPushMsg(''); setError('');
    try {
      const res = await authFetch('/admin/default-sources/push-to-all', { method: 'POST' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Push failed'); }
      const data = await res.json();
      setPushMsg(`Done — added ${data.added} source(s) across ${data.users_updated} user(s).`);
    } catch (e) {
      setError(e.message);
    } finally {
      setPushing(false);
    }
  };

  const activeCount = sources.filter(s => s.is_active).length;

  return (
    <Page>
      <Header>
        <Title>Default Sources</Title>
        <BtnRow>
          <Btn secondary onClick={() => setShowAdd(true)}>+ Add Single</Btn>
          <Btn secondary onClick={() => setShowBulk(true)}>⬆ Bulk Upload</Btn>
          <Btn onClick={handlePushToAll} disabled={pushing} style={{ background: '#6b46c1' }}>
            {pushing ? 'Pushing…' : '📤 Push to All Users'}
          </Btn>
        </BtnRow>
      </Header>

      <Stats>
        <Stat><span>{sources.length}</span> Total Sources</Stat>
        <Stat><span>{activeCount}</span> Active</Stat>
        <Stat><span>{sources.length - activeCount}</span> Disabled</Stat>
      </Stats>

      <FilterRow>
        <SearchInput
          placeholder="Search by name or URL…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FilterSelect value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </FilterSelect>
      </FilterRow>

      {error && <ErrorBanner style={{ marginBottom: '1rem' }}>{error}</ErrorBanner>}
      {pushMsg && <SuccessBanner style={{ marginBottom: '1rem' }}>{pushMsg}</SuccessBanner>}

      {loading ? (
        <p style={{ color: 'var(--text-light)' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <h3>No default sources yet</h3>
          <p>Use Bulk Upload to add the NGO job sites.</p>
          <Btn onClick={() => setShowBulk(true)}>⬆ Bulk Upload</Btn>
        </EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th>Category</Th>
                <Th>Frequency</Th>
                <Th>Active</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(source => (
                <tr key={source.id}>
                  <Td style={{ fontWeight: 500 }}>{source.name}</Td>
                  <Td>
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--primary-teal)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                      {source.url.length > 55 ? source.url.slice(0, 55) + '…' : source.url}
                    </a>
                  </Td>
                  <Td>
                    {source.category
                      ? <CategoryBadge>{source.category}</CategoryBadge>
                      : <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>—</span>}
                  </Td>
                  <Td style={{ textTransform: 'capitalize' }}>{source.check_frequency}</Td>
                  <Td>
                    <Toggle on={source.is_active} onClick={() => handleToggle(source)} />
                  </Td>
                  <Td>
                    <IconBtn onClick={() => handleDelete(source.id)}>🗑</IconBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {showBulk && <BulkModal onClose={() => setShowBulk(false)} onDone={loadSources} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onDone={loadSources} />}
    </Page>
  );
}
