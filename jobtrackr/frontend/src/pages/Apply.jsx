import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

// ── Layout ──────────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 1.75rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 1.85rem;
  margin: 0 0 0.35rem;
`;

const Subtitle = styled.p`
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 0;
`;

// ── Status / loading ─────────────────────────────────────────────────────────

const StatusBox = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);

  h2 { color: var(--text-dark); margin-bottom: 0.5rem; }
  p  { font-size: 0.9rem; }
`;

const Spinner = styled.div`
  margin: 0 auto 1rem;
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary-teal);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin { to { transform: rotate(360deg); } }
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

// ── Draft card ───────────────────────────────────────────────────────────────

const DraftList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DraftCard = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const DraftHeader = styled.div`
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const JobMeta = styled.div``;

const JobTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.2rem;
`;

const JobCompany = styled.div`
  font-size: 0.85rem;
  color: var(--primary-teal);
  font-weight: 500;
`;

const SentPill = styled.span`
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #f0fff4;
  color: #276749;
`;

const DraftBody = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.35rem;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const FieldTextarea = styled.textarea`
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  box-sizing: border-box;
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
  font-family: inherit;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

// ── Tailored resume panel ────────────────────────────────────────────────────

const ResumePanel = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
`;

const ResumePanelHeader = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border: none;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dark);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover { background: #edf2f7; }
`;

const ResumePanelBody = styled.div`
  padding: 1rem;
  background: #fafafa;
  font-size: 0.875rem;
  color: var(--text-dark);
  line-height: 1.6;
`;

const SkillTag = styled.span`
  display: inline-block;
  padding: 0.15rem 0.55rem;
  background: #ebf8ff;
  color: #2b6cb0;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0.2rem 0.2rem 0 0;
`;

// ── Bottom action bar ────────────────────────────────────────────────────────

const ActionBar = styled.div`
  position: sticky;
  bottom: 0;
  background: var(--white);
  border-top: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
  margin-top: 1.5rem;
`;

const BackBtn = styled.button`
  padding: 0.6rem 1.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover { background: #f7fafc; }
`;

const SendBtn = styled.button`
  padding: 0.7rem 2rem;
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

const Msg = styled.span`
  font-size: 0.85rem;
  color: ${p => p.$error ? 'var(--error)' : '#38a169'};
`;

// ── Component ────────────────────────────────────────────────────────────────

export default function Apply() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const jobIds = (searchParams.get('jobs') || '').split(',').filter(Boolean).map(Number);

  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState([]);       // array of draft objects
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState({});            // resume panel open state per draft index
  const [sending, setSending] = useState(false);
  const [sentIds, setSentIds] = useState(new Set());
  const [sendMsg, setSendMsg] = useState({ text: '', error: false });

  useEffect(() => {
    if (!jobIds.length) {
      setError('No jobs selected.');
      setGenerating(false);
      return;
    }
    authFetch('/applications/generate', {
      method: 'POST',
      body: JSON.stringify({ job_ids: jobIds }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Generation failed');
        setDrafts(data.drafts.map(d => ({ ...d, email_to: '' })));
        setProfile(data.profile);
      })
      .catch(err => setError(err.message))
      .finally(() => setGenerating(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDraft = (i, field, val) =>
    setDrafts(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const sendAll = async () => {
    setSending(true);
    setSendMsg({ text: '', error: false });
    try {
      const res = await authFetch('/applications/', {
        method: 'POST',
        body: JSON.stringify({
          drafts: drafts.map(d => ({ ...d, status: 'sent' })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save');
      setSentIds(new Set(data.map(a => a.job_id)));
      setSendMsg({ text: `${data.length} application${data.length !== 1 ? 's' : ''} marked as sent!`, error: false });
    } catch (err) {
      setSendMsg({ text: err.message, error: true });
    } finally {
      setSending(false);
    }
  };

  if (generating) {
    return (
      <Page>
        <PageHeader>
          <Title>Preparing Applications</Title>
          <Subtitle>AI is generating personalised emails and tailoring your resume…</Subtitle>
        </PageHeader>
        <StatusBox>
          <Spinner />
          <p>This usually takes 10–30 seconds</p>
        </StatusBox>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <ErrorBanner>{error}</ErrorBanner>
        <BackBtn onClick={() => navigate('/jobs')}>Back to jobs</BackBtn>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <Title>Email Outbox</Title>
        <Subtitle>
          Review and edit {drafts.length} AI-generated application email{drafts.length !== 1 ? 's' : ''} before sending.
        </Subtitle>
      </PageHeader>

      <DraftList>
        {drafts.map((draft, i) => {
          const sent = sentIds.has(draft.job_id);
          return (
            <DraftCard key={draft.job_id}>
              <DraftHeader>
                <JobMeta>
                  <JobTitle>{draft.job_title}</JobTitle>
                  <JobCompany>{draft.job_company}</JobCompany>
                </JobMeta>
                {sent && <SentPill>Sent</SentPill>}
              </DraftHeader>

              <DraftBody>
                {/* Recipient email */}
                <div>
                  <FieldLabel>To (recipient email)</FieldLabel>
                  <FieldInput
                    type="email"
                    value={draft.email_to}
                    onChange={e => updateDraft(i, 'email_to', e.target.value)}
                    placeholder="recruiter@company.com"
                    disabled={sent}
                  />
                </div>

                {/* Subject */}
                <div>
                  <FieldLabel>Subject</FieldLabel>
                  <FieldInput
                    type="text"
                    value={draft.email_subject}
                    onChange={e => updateDraft(i, 'email_subject', e.target.value)}
                    disabled={sent}
                  />
                </div>

                {/* Body */}
                <div>
                  <FieldLabel>Email body</FieldLabel>
                  <FieldTextarea
                    value={draft.email_body}
                    onChange={e => updateDraft(i, 'email_body', e.target.value)}
                    disabled={sent}
                  />
                </div>

                {/* Tailored resume panel */}
                {(draft.tailored_summary || draft.highlighted_skills?.length > 0) && (
                  <ResumePanel>
                    <ResumePanelHeader onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))}>
                      <span>Tailored resume highlights</span>
                      <span>{open[i] ? '▲' : '▼'}</span>
                    </ResumePanelHeader>
                    {open[i] && (
                      <ResumePanelBody>
                        {draft.tailored_summary && (
                          <p style={{ margin: '0 0 0.75rem' }}>{draft.tailored_summary}</p>
                        )}
                        {draft.highlighted_skills?.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>KEY SKILLS FOR THIS ROLE</strong>
                            <div style={{ marginTop: '0.35rem' }}>
                              {draft.highlighted_skills.map(s => <SkillTag key={s}>{s}</SkillTag>)}
                            </div>
                          </div>
                        )}
                        {profile?.resume_filename && (
                          <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                            Attached resume: <strong>{profile.resume_filename}</strong>
                          </p>
                        )}
                      </ResumePanelBody>
                    )}
                  </ResumePanel>
                )}
              </DraftBody>
            </DraftCard>
          );
        })}
      </DraftList>

      <ActionBar>
        <BackBtn onClick={() => navigate('/jobs')}>Back to jobs</BackBtn>
        {sendMsg.text && <Msg $error={sendMsg.error}>{sendMsg.text}</Msg>}
        <SendBtn onClick={sendAll} disabled={sending || sentIds.size === drafts.length}>
          {sending
            ? 'Saving…'
            : sentIds.size === drafts.length
            ? 'All sent!'
            : `Send ${drafts.length} application${drafts.length !== 1 ? 's' : ''}`}
        </SendBtn>
      </ActionBar>
    </Page>
  );
}
