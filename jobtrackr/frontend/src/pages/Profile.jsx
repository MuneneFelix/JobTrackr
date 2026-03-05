import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  padding: 2rem;
  max-width: 700px;
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
  background: ${p => p.admin ? '#ebf4ff' : '#f0fff4'};
  color: ${p => p.admin ? '#2b6cb0' : '#276749'};
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
  border-top: 3px solid ${p => p.accent || 'var(--primary-teal)'};
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

const InfoCard = styled.div`
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const InfoHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f4f8;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #f7fafc;
  font-size: 0.875rem;

  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.span`
  color: var(--text-light);
`;

const InfoValue = styled.span`
  color: var(--text-dark);
  font-weight: 500;
`;

const PwCard = styled(InfoCard)``;

const PwBody = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PwGroup = styled.div``;

const PwLabel = styled.label`
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const PwInput = styled.input`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const PwFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const PwSaveBtn = styled.button`
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

const PwMsg = styled.span`
  font-size: 0.82rem;
  color: ${p => p.error ? 'var(--error)' : 'var(--success)'};
`;

function Profile() {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, sources: 0 });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', error: false });

  useEffect(() => {
    Promise.all([
      authFetch('/jobs/').then(r => r.ok ? r.json() : []),
      authFetch('/sources/').then(r => r.ok ? r.json() : []),
    ]).then(([jobs, sources]) => {
      setStats({ jobs: jobs.length, sources: sources.length });
    });
  }, [authFetch]);

  const handleChangePassword = async () => {
    setPwMsg({ text: '', error: false });
    if (pw.next !== pw.confirm) {
      setPwMsg({ text: 'New passwords do not match', error: true });
      return;
    }
    if (pw.next.length < 8) {
      setPwMsg({ text: 'Password must be at least 8 characters', error: true });
      return;
    }
    setPwSaving(true);
    try {
      const res = await authFetch('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ current_password: pw.current, new_password: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setPwMsg({ text: 'Password updated successfully', error: false });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ text: err.message, error: true });
    } finally {
      setPwSaving(false);
    }
  };

  const initial = user?.email?.[0]?.toUpperCase() || '?';
  const isAdmin = user?.is_admin || user?.role === 'admin';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <Page>
      <AvatarRow>
        <Avatar>{initial}</Avatar>
        <AvatarInfo>
          <UserName>{user?.email?.split('@')[0]}</UserName>
          <UserEmail>{user?.email}</UserEmail>
          <RolePill admin={isAdmin}>{isAdmin ? 'Admin' : 'User'}</RolePill>
        </AvatarInfo>
      </AvatarRow>

      <StatsGrid>
        <StatCard accent="var(--primary-teal)">
          <StatValue>{stats.sources}</StatValue>
          <StatLabel>Sources</StatLabel>
        </StatCard>
        <StatCard accent="#4299e1">
          <StatValue>{stats.jobs}</StatValue>
          <StatLabel>Jobs Found</StatLabel>
        </StatCard>
        <StatCard accent="var(--success)">
          <StatValue>{isAdmin ? '✓' : '—'}</StatValue>
          <StatLabel>Admin</StatLabel>
        </StatCard>
      </StatsGrid>

      <InfoCard>
        <InfoHeader>Account Details</InfoHeader>
        <InfoRow>
          <InfoLabel>Email</InfoLabel>
          <InfoValue>{user?.email}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Role</InfoLabel>
          <InfoValue>{isAdmin ? 'Administrator' : 'Standard user'}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Member since</InfoLabel>
          <InfoValue>{memberSince}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Account status</InfoLabel>
          <InfoValue style={{ color: 'var(--success)' }}>Active</InfoValue>
        </InfoRow>
      </InfoCard>

      <PwCard style={{ marginTop: '1.25rem' }}>
        <InfoHeader>Change Password</InfoHeader>
        <PwBody>
          <PwGroup>
            <PwLabel>Current password</PwLabel>
            <PwInput
              type="password"
              value={pw.current}
              onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
          </PwGroup>
          <PwGroup>
            <PwLabel>New password</PwLabel>
            <PwInput
              type="password"
              value={pw.next}
              onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
              placeholder="Min. 8 characters"
            />
          </PwGroup>
          <PwGroup>
            <PwLabel>Confirm new password</PwLabel>
            <PwInput
              type="password"
              value={pw.confirm}
              onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••"
            />
          </PwGroup>
        </PwBody>
        <PwFooter>
          {pwMsg.text && <PwMsg error={pwMsg.error}>{pwMsg.text}</PwMsg>}
          <PwSaveBtn
            onClick={handleChangePassword}
            disabled={pwSaving || !pw.current || !pw.next || !pw.confirm}
            style={{ marginLeft: 'auto' }}
          >
            {pwSaving ? 'Saving…' : 'Update Password'}
          </PwSaveBtn>
        </PwFooter>
      </PwCard>
    </Page>
  );
}

export default Profile;
