import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

// ── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 2rem;
  max-width: 620px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: var(--primary-blue);
  font-size: 1.7rem;
  margin: 0 0 1.75rem;
`;

const Card = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 1.75rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin: 0 0 0.35rem;
`;

const SectionSub = styled.p`
  font-size: 0.82rem;
  color: var(--text-light);
  margin: 0 0 1.25rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.25rem 0;
`;

// ── Form controls ─────────────────────────────────────────────────────────────

const FormRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dark);
`;

const SubLabel = styled.p`
  font-size: 0.78rem;
  color: var(--text-light);
  margin: 0.15rem 0 0;
`;

const FieldGroup = styled.div`
  margin-bottom: 1.1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--white);
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--primary-teal); }
  &:disabled { background: #f7fafc; cursor: not-allowed; }
`;

// ── Toggle switch ─────────────────────────────────────────────────────────────

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

function Toggle({ checked, onChange }) {
  return (
    <ToggleWrap onClick={onChange}>
      <ToggleTrack $on={checked} />
      <ToggleThumb $on={checked} />
    </ToggleWrap>
  );
}

// ── Feedback messages ─────────────────────────────────────────────────────────

const SuccessMsg = styled.div`
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const ErrorMsg = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
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

const LoadingBox = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
`;

// ── Hour label helper ─────────────────────────────────────────────────────────

function hourLabel(h) {
  if (h === 0)  return '12:00 AM (midnight)';
  if (h < 12)   return `${h}:00 AM`;
  if (h === 12) return '12:00 PM (noon)';
  return `${h - 12}:00 PM`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const { authFetch } = useAuth();

  const [digest, setDigest] = useState({ enabled: true, frequency: 'daily', send_hour: 8 });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    authFetch('/users/me/digest')
      .then(r => r.json())
      .then(data => {
        setDigest({ enabled: data.enabled, frequency: data.frequency, send_hour: data.send_hour });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await authFetch('/users/me/digest', {
        method: 'PATCH',
        body: JSON.stringify(digest),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save settings');
      setDigest({ enabled: data.enabled, frequency: data.frequency, send_hour: data.send_hour });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <PageTitle>Settings</PageTitle>

      <Card>
        <SectionTitle>Email Digest</SectionTitle>
        <SectionSub>
          Receive a summary of newly discovered jobs from your active sources, delivered straight to your inbox.
        </SectionSub>

        {loading ? (
          <LoadingBox>Loading preferences…</LoadingBox>
        ) : (
          <form onSubmit={handleSave}>
            {/* Enabled toggle */}
            <FormRow>
              <div>
                <FormLabel>Enable email digest</FormLabel>
                <SubLabel>Send periodic summaries of new job listings to your email</SubLabel>
              </div>
              <Toggle
                checked={digest.enabled}
                onChange={() => setDigest(d => ({ ...d, enabled: !d.enabled }))}
              />
            </FormRow>

            <Divider />

            {/* Frequency */}
            <FieldGroup>
              <Label>Frequency</Label>
              <Select
                value={digest.frequency}
                onChange={e => setDigest(d => ({ ...d, frequency: e.target.value }))}
                disabled={!digest.enabled}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="never">Never (disable sending)</option>
              </Select>
            </FieldGroup>

            {/* Send hour */}
            <FieldGroup>
              <Label>Send time (UTC)</Label>
              <Select
                value={digest.send_hour}
                onChange={e => setDigest(d => ({ ...d, send_hour: Number(e.target.value) }))}
                disabled={!digest.enabled || digest.frequency === 'never'}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>{hourLabel(h)}</option>
                ))}
              </Select>
            </FieldGroup>

            {error  && <ErrorMsg>{error}</ErrorMsg>}
            {saved  && <SuccessMsg>✓ Settings saved!</SuccessMsg>}

            <SaveBtn type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </SaveBtn>
          </form>
        )}
      </Card>
    </Page>
  );
}
