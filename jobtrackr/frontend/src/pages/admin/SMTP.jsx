import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  max-width: 640px;
`;

const PageHeader = styled.div`
  margin-bottom: 1.75rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 1.7rem;
  margin: 0 0 0.35rem;
`;

const Subtitle = styled.p`
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
`;

const Card = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 1.75rem;
`;

// ── Form controls ─────────────────────────────────────────────────────────────

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.25rem;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

const FieldGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
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

const PwdWrap = styled.div`
  position: relative;
`;

const PwdToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-light);
  padding: 0;
  &:hover { color: var(--primary-teal); }
`;

// ── Toggle switch ─────────────────────────────────────────────────────────────

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
`;

const ToggleWrap = styled.div`
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
`;

const ToggleTrack = styled.div`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${p => p.$on ? 'var(--primary-teal)' : '#cbd5e0'};
  transition: background 0.2s;
  cursor: pointer;
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 3px;
  left: ${p => p.$on ? '23px' : '3px'};
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: left 0.2s;
  pointer-events: none;
`;

function Toggle({ checked, onChange, label }) {
  return (
    <ToggleRow>
      <ToggleWrap onClick={onChange}>
        <ToggleTrack $on={checked} />
        <ToggleThumb $on={checked} />
      </ToggleWrap>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>{label}</span>
    </ToggleRow>
  );
}

// ── Actions ───────────────────────────────────────────────────────────────────

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.5rem 0;
`;

const SaveBtn = styled.button`
  padding: 0.65rem 1.75rem;
  background: var(--primary-teal);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #235f60; box-shadow: 0 4px 12px rgba(44,122,123,0.3); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const TestBtn = styled.button`
  padding: 0.65rem 1.25rem;
  background: transparent;
  color: var(--primary-teal);
  border: 1.5px solid var(--primary-teal);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #edfafa; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// ── Feedback ──────────────────────────────────────────────────────────────────

const SuccessMsg = styled.div`
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const ErrorMsg = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-size: 0.9rem;

  h3 { color: var(--text-dark); margin: 0 0 0.5rem; }
`;

const UpdatedAt = styled.p`
  font-size: 0.78rem;
  color: var(--text-light);
  margin: 1rem 0 0;
`;

// ── Component ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  host: '',
  port: 587,
  username: '',
  password: '',
  from_email: '',
  from_name: 'JobTrackr',
  use_tls: true,
};

export default function AdminSMTP() {
  const { authFetch } = useAuth();

  const [form, setForm]               = useState(DEFAULT_FORM);
  const [loading, setLoading]         = useState(true);
  const [notConfigured, setNotConf]   = useState(false);
  const [updatedAt, setUpdatedAt]     = useState(null);
  const [saving, setSaving]           = useState(false);
  const [testing, setTesting]         = useState(false);
  const [msg, setMsg]                 = useState({ text: '', error: false });
  const [showPwd, setShowPwd]         = useState(false);

  useEffect(() => {
    authFetch('/admin/smtp/')
      .then(async r => {
        if (r.status === 404) { setNotConf(true); setLoading(false); return; }
        const data = await r.json();
        setForm({ ...data, password: '' }); // don't pre-fill masked password
        setUpdatedAt(data.updated_at);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', error: false });
    try {
      const res = await authFetch('/admin/smtp/', {
        method: 'PUT',
        body: JSON.stringify({ ...form, port: Number(form.port) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save');
      setNotConf(false);
      setUpdatedAt(data.updated_at);
      setForm(f => ({ ...f, password: '' })); // clear password field after save
      setMsg({ text: '✓ SMTP settings saved successfully', error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMsg({ text: '', error: false });
    try {
      const res = await authFetch('/admin/smtp/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Test failed');
      setMsg({ text: `✓ Test email sent to ${data.to}`, error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <PageHeader>
          <Title>SMTP Settings</Title>
        </PageHeader>
        <Card><p style={{ color: 'var(--text-light)' }}>Loading…</p></Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <Title>SMTP Settings</Title>
        <Subtitle>Configure the outgoing email server used for application emails and digests.</Subtitle>
      </PageHeader>

      <Card>
        {notConfigured && (
          <EmptyState>
            <h3>Not configured yet</h3>
            <p>Fill in the form below to enable outgoing email for JobTrackr.</p>
          </EmptyState>
        )}

        <form onSubmit={handleSave}>
          <FormGrid>
            {/* Host */}
            <FieldGroup>
              <Label>SMTP Host *</Label>
              <Input
                type="text"
                value={form.host}
                onChange={set('host')}
                placeholder="smtp.gmail.com"
                required
              />
            </FieldGroup>

            {/* Port */}
            <FieldGroup>
              <Label>Port *</Label>
              <Input
                type="number"
                value={form.port}
                onChange={set('port')}
                placeholder="587"
                required
                min="1"
                max="65535"
              />
            </FieldGroup>

            {/* Username */}
            <FieldGroup>
              <Label>Username *</Label>
              <Input
                type="text"
                value={form.username}
                onChange={set('username')}
                placeholder="your@email.com"
                required
                autoComplete="username"
              />
            </FieldGroup>

            {/* Password */}
            <FieldGroup>
              <Label>Password {notConfigured ? '*' : '(leave blank to keep current)'}</Label>
              <PwdWrap>
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={notConfigured ? 'required' : '••••••••'}
                  required={notConfigured}
                  autoComplete="new-password"
                  style={{ paddingRight: '3.5rem' }}
                />
                <PwdToggle type="button" onClick={() => setShowPwd(s => !s)}>
                  {showPwd ? 'Hide' : 'Show'}
                </PwdToggle>
              </PwdWrap>
            </FieldGroup>

            {/* From email */}
            <FieldGroup>
              <Label>From Email *</Label>
              <Input
                type="email"
                value={form.from_email}
                onChange={set('from_email')}
                placeholder="noreply@yourdomain.com"
                required
              />
            </FieldGroup>

            {/* From name */}
            <FieldGroup>
              <Label>From Name</Label>
              <Input
                type="text"
                value={form.from_name}
                onChange={set('from_name')}
                placeholder="JobTrackr"
              />
            </FieldGroup>

            {/* TLS toggle */}
            <FullWidth>
              <Toggle
                checked={form.use_tls}
                onChange={() => setForm(f => ({ ...f, use_tls: !f.use_tls }))}
                label="Use STARTTLS (recommended for port 587)"
              />
            </FullWidth>
          </FormGrid>

          {msg.text && (
            <>
              <Divider />
              {msg.error
                ? <ErrorMsg>{msg.text}</ErrorMsg>
                : <SuccessMsg>{msg.text}</SuccessMsg>}
            </>
          )}

          <ActionRow>
            <SaveBtn type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </SaveBtn>
            {!notConfigured && (
              <TestBtn
                type="button"
                onClick={handleTest}
                disabled={testing || saving}
              >
                {testing ? 'Sending…' : '📧 Send Test Email'}
              </TestBtn>
            )}
          </ActionRow>

          {updatedAt && (
            <UpdatedAt>
              Last updated: {new Date(updatedAt).toLocaleString()}
            </UpdatedAt>
          )}
        </form>
      </Card>
    </Page>
  );
}
