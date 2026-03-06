import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

// ── Layout ─────────────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 2rem;
  max-width: 780px;
  margin: 0 auto;
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--white);
  padding: 1.75rem 2rem;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-teal));
  color: var(--white);
  font-size: 1.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AvatarInfo = styled.div``;

const UserName = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.2rem;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0;
`;

const RolePill = styled.span`
  margin-top: 0.4rem;
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => p.$admin ? '#ebf4ff' : '#f0fff4'};
  color: ${p => p.$admin ? '#2b6cb0' : '#276749'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  @media (max-width: 500px) { grid-template-columns: 1fr 1fr; }
`;

const StatCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-top: 3px solid ${p => p.$accent || 'var(--primary-teal)'};
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-blue);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.25rem;
`;

// ── Card shell ──────────────────────────────────────────────────────────────

const Card = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 1.25rem;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f4f8;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardBody = styled.div` padding: 1.25rem 1.5rem; `;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

// ── Form fields ─────────────────────────────────────────────────────────────

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`;

const FieldGroup = styled.div``;

const FieldLabel = styled.label`
  display: block;
  font-size: 0.8rem;
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
  transition: border-color 0.2s;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

// ── Skills tags ─────────────────────────────────────────────────────────────

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Tag = styled.span`
  padding: 0.2rem 0.65rem;
  background: #ebf8ff;
  color: #2b6cb0;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    font-size: 0.85rem;
    padding: 0;
    line-height: 1;
    &:hover { opacity: 1; }
  }
`;

const TagInput = styled.input`
  flex: 1;
  min-width: 130px;
  padding: 0.3rem 0.65rem;
  border: 1.5px dashed #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

// ── Entry cards (experience / education) ────────────────────────────────────

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const EntryCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.9rem 1rem 0.9rem;
  position: relative;
`;

const EntryRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
  @media (max-width: 540px) { grid-template-columns: 1fr; }
`;

const EntryField = styled.input`
  width: 100%;
  padding: 0.45rem 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  box-sizing: border-box;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const EntryTextarea = styled.textarea`
  width: 100%;
  padding: 0.45rem 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  box-sizing: border-box;
  resize: vertical;
  min-height: 60px;
  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #e53e3e;
  font-size: 1.1rem;
  opacity: 0.5;
  line-height: 1;
  &:hover { opacity: 1; }
`;

const AddEntryBtn = styled.button`
  margin-top: 0.6rem;
  padding: 0.4rem 0.9rem;
  border: 1.5px dashed #e2e8f0;
  border-radius: 8px;
  background: none;
  color: var(--text-light);
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { border-color: var(--primary-teal); color: var(--primary-teal); }
`;

// ── Resume upload zone ──────────────────────────────────────────────────────

const UploadZone = styled.div`
  border: 2px dashed ${p => p.$dragover ? 'var(--primary-teal)' : '#e2e8f0'};
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$dragover ? '#f0fffe' : 'transparent'};
  &:hover { border-color: var(--primary-teal); }
`;

// ── Account info ────────────────────────────────────────────────────────────

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #f7fafc;
  font-size: 0.875rem;
  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.span` color: var(--text-light); `;
const InfoValue = styled.span` color: var(--text-dark); font-weight: 500; `;

// ── Shared small components ─────────────────────────────────────────────────

const SaveBtn = styled.button`
  padding: 0.6rem 1.5rem;
  background: var(--primary-teal);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #235f60; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Msg = styled.span`
  font-size: 0.82rem;
  color: ${p => p.$error ? 'var(--error)' : '#38a169'};
`;

// ── Helpers ─────────────────────────────────────────────────────────────────

const emptyExp = () => ({ company: '', title: '', start_date: '', end_date: '', description: '' });
const emptyEdu = () => ({ school: '', degree: '', field: '', start_year: '', end_year: '' });

// ── Component ───────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, authFetch } = useAuth();
  const fileRef = useRef(null);

  const [stats, setStats] = useState({ jobs: 0, sources: 0, applications: 0 });
  const [profile, setProfile] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState({ text: '', error: false });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ text: '', error: false });
  const [dragover, setDragover] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', error: false });

  useEffect(() => {
    Promise.all([
      authFetch('/jobs/').then(r => r.ok ? r.json() : []),
      authFetch('/sources/').then(r => r.ok ? r.json() : []),
      authFetch('/applications/').then(r => r.ok ? r.json() : []),
      authFetch('/users/me/profile').then(r => r.ok ? r.json() : null),
    ]).then(([jobs, sources, applications, prof]) => {
      setStats({ jobs: jobs.length, sources: sources.length, applications: applications.length });
      setProfile({
        full_name: prof?.full_name || '',
        phone: prof?.phone || '',
        location: prof?.location || '',
        linkedin: prof?.linkedin || '',
        github: prof?.github || '',
        skills: prof?.skills || [],
        education: prof?.education || [],
        experience: prof?.experience || [],
        resume_filename: prof?.resume_filename || null,
      });
    });
  }, [authFetch]);

  // Resume upload (must use raw fetch for multipart)
  const uploadResume = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadMsg({ text: '', error: false });
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/users/me/resume', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      setProfile(p => ({
        ...p,
        full_name: data.full_name || p.full_name,
        phone: data.phone || p.phone,
        location: data.location || p.location,
        linkedin: data.linkedin || p.linkedin,
        github: data.github || p.github,
        skills: data.skills?.length ? data.skills : p.skills,
        education: data.education?.length ? data.education : p.education,
        experience: data.experience?.length ? data.experience : p.experience,
        resume_filename: data.resume_filename || p.resume_filename,
      }));
      setUploadMsg({ text: 'Resume parsed — profile updated!', error: false });
    } catch (err) {
      setUploadMsg({ text: err.message, error: true });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveMsg({ text: '', error: false });
    try {
      const res = await authFetch('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: profile.full_name,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          github: profile.github,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed');
      }
      setSaveMsg({ text: 'Profile saved', error: false });
    } catch (err) {
      setSaveMsg({ text: err.message, error: true });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwMsg({ text: '', error: false });
    if (pw.next !== pw.confirm) { setPwMsg({ text: 'Passwords do not match', error: true }); return; }
    if (pw.next.length < 8) { setPwMsg({ text: 'Min. 8 characters', error: true }); return; }
    setPwSaving(true);
    try {
      const res = await authFetch('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ current_password: pw.current, new_password: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setPwMsg({ text: 'Password updated', error: false });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ text: err.message, error: true });
    } finally {
      setPwSaving(false);
    }
  };

  const addSkill = (val) => {
    const s = val.trim();
    if (!s || profile.skills.includes(s)) return;
    setProfile(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (s) =>
    setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));

  const updateExp = (i, field, val) =>
    setProfile(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

  const updateEdu = (i, field, val) =>
    setProfile(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));

  const initial = user?.email?.[0]?.toUpperCase() || '?';
  const isAdmin = user?.is_admin || user?.role === 'admin';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <Page>
      {/* Avatar row */}
      <AvatarRow>
        <Avatar>{initial}</Avatar>
        <AvatarInfo>
          <UserName>{profile?.full_name || user?.email?.split('@')[0]}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          <RolePill $admin={isAdmin}>{isAdmin ? 'Admin' : 'User'}</RolePill>
        </AvatarInfo>
      </AvatarRow>

      {/* Stats */}
      <StatsGrid>
        <StatCard $accent="var(--primary-teal)">
          <StatValue>{stats.sources}</StatValue>
          <StatLabel>Sources</StatLabel>
        </StatCard>
        <StatCard $accent="#4299e1">
          <StatValue>{stats.jobs}</StatValue>
          <StatLabel>Jobs Found</StatLabel>
        </StatCard>
        <StatCard $accent="#38a169">
          <StatValue>{stats.applications}</StatValue>
          <StatLabel>Applications</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Resume upload */}
      <Card>
        <CardHeader>
          Resume
          {profile?.resume_filename && (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 400 }}>
              {profile.resume_filename}
            </span>
          )}
        </CardHeader>
        <CardBody>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
            onChange={e => uploadResume(e.target.files?.[0])}
          />
          <UploadZone
            $dragover={dragover}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragover(true); }}
            onDragLeave={() => setDragover(false)}
            onDrop={e => { e.preventDefault(); setDragover(false); uploadResume(e.dataTransfer.files?.[0]); }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{uploading ? '⏳' : '📄'}</div>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>
              {uploading ? 'Parsing resume with AI…' : 'Drop your resume here or click to browse'}
            </p>
            <p style={{ margin: '0.3rem 0 0', color: 'var(--text-light)', fontSize: '0.75rem', opacity: 0.7 }}>
              PDF, DOCX, or TXT — AI fills in your profile automatically
            </p>
          </UploadZone>
          {uploadMsg.text && (
            <Msg $error={uploadMsg.error} style={{ display: 'block', marginTop: '0.75rem' }}>
              {uploadMsg.text}
            </Msg>
          )}
        </CardBody>
      </Card>

      {/* Profile editor */}
      {profile === null ? (
        <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>Loading profile…</p>
      ) : (
        <>
          {/* Personal info */}
          <Card>
            <CardHeader>Personal Information</CardHeader>
            <CardBody>
              <FieldGrid>
                {[
                  ['Full Name', 'full_name', 'text', 'Jane Doe'],
                  ['Phone', 'phone', 'tel', '+1 555 000 0000'],
                  ['Location', 'location', 'text', 'San Francisco, CA'],
                  ['LinkedIn URL', 'linkedin', 'url', 'https://linkedin.com/in/...'],
                  ['GitHub URL', 'github', 'url', 'https://github.com/...'],
                ].map(([label, key, type, ph]) => (
                  <FieldGroup key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <FieldInput
                      type={type}
                      value={profile[key]}
                      onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={ph}
                    />
                  </FieldGroup>
                ))}
              </FieldGrid>
            </CardBody>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>Skills</CardHeader>
            <CardBody>
              <TagList>
                {profile.skills.map(s => (
                  <Tag key={s}>
                    {s}
                    <button onClick={() => removeSkill(s)}>×</button>
                  </Tag>
                ))}
                <TagInput
                  placeholder="Add skill, press Enter…"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(skillInput); }
                  }}
                  onBlur={() => skillInput && addSkill(skillInput)}
                />
              </TagList>
            </CardBody>
          </Card>

          {/* Work experience */}
          <Card>
            <CardHeader>Work Experience</CardHeader>
            <CardBody>
              <EntryList>
                {profile.experience.map((exp, i) => (
                  <EntryCard key={i}>
                    <RemoveBtn onClick={() => setProfile(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }))}>×</RemoveBtn>
                    <EntryRow>
                      <EntryField placeholder="Company" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} />
                      <EntryField placeholder="Job title" value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} />
                    </EntryRow>
                    <EntryRow>
                      <EntryField placeholder="Start (e.g. Jan 2022)" value={exp.start_date} onChange={e => updateExp(i, 'start_date', e.target.value)} />
                      <EntryField placeholder="End (or Present)" value={exp.end_date} onChange={e => updateExp(i, 'end_date', e.target.value)} />
                    </EntryRow>
                    <EntryTextarea
                      placeholder="Responsibilities and achievements…"
                      value={exp.description}
                      onChange={e => updateExp(i, 'description', e.target.value)}
                    />
                  </EntryCard>
                ))}
              </EntryList>
              <AddEntryBtn onClick={() => setProfile(p => ({ ...p, experience: [...p.experience, emptyExp()] }))}>
                + Add position
              </AddEntryBtn>
            </CardBody>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>Education</CardHeader>
            <CardBody>
              <EntryList>
                {profile.education.map((edu, i) => (
                  <EntryCard key={i}>
                    <RemoveBtn onClick={() => setProfile(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }))}>×</RemoveBtn>
                    <EntryRow>
                      <EntryField placeholder="School / University" value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} />
                      <EntryField placeholder="Degree (e.g. B.Sc.)" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} />
                    </EntryRow>
                    <EntryRow>
                      <EntryField placeholder="Field of study" value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} />
                      <EntryRow style={{ marginBottom: 0 }}>
                        <EntryField placeholder="Start year" value={edu.start_year} onChange={e => updateEdu(i, 'start_year', e.target.value)} />
                        <EntryField placeholder="End year" value={edu.end_year} onChange={e => updateEdu(i, 'end_year', e.target.value)} />
                      </EntryRow>
                    </EntryRow>
                  </EntryCard>
                ))}
              </EntryList>
              <AddEntryBtn onClick={() => setProfile(p => ({ ...p, education: [...p.education, emptyEdu()] }))}>
                + Add education
              </AddEntryBtn>
            </CardBody>
          </Card>

          {/* Save profile */}
          <Card>
            <CardFooter>
              {saveMsg.text && <Msg $error={saveMsg.error}>{saveMsg.text}</Msg>}
              <SaveBtn onClick={saveProfile} disabled={saving} style={{ marginLeft: 'auto' }}>
                {saving ? 'Saving…' : 'Save Profile'}
              </SaveBtn>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Account details */}
      <Card>
        <CardHeader>Account Details</CardHeader>
        <InfoRow><InfoLabel>Email</InfoLabel><InfoValue>{user?.email}</InfoValue></InfoRow>
        <InfoRow><InfoLabel>Role</InfoLabel><InfoValue>{isAdmin ? 'Administrator' : 'Standard user'}</InfoValue></InfoRow>
        <InfoRow><InfoLabel>Member since</InfoLabel><InfoValue>{memberSince}</InfoValue></InfoRow>
        <InfoRow>
          <InfoLabel>Account status</InfoLabel>
          <InfoValue style={{ color: '#38a169' }}>Active</InfoValue>
        </InfoRow>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>Change Password</CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[['Current password', 'current'], ['New password', 'next'], ['Confirm new password', 'confirm']].map(([label, key]) => (
              <FieldGroup key={key}>
                <FieldLabel>{label}</FieldLabel>
                <FieldInput
                  type="password"
                  value={pw[key]}
                  onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                />
              </FieldGroup>
            ))}
          </div>
        </CardBody>
        <CardFooter>
          {pwMsg.text && <Msg $error={pwMsg.error}>{pwMsg.text}</Msg>}
          <SaveBtn
            onClick={changePassword}
            disabled={pwSaving || !pw.current || !pw.next || !pw.confirm}
            style={{ marginLeft: 'auto' }}
          >
            {pwSaving ? 'Saving…' : 'Update Password'}
          </SaveBtn>
        </CardFooter>
      </Card>
    </Page>
  );
}
