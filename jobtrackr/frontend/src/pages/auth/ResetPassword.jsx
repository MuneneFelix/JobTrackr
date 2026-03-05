import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Page = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  padding: 2rem;
`;

const Card = styled.form`
  background: var(--white);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 420px;
`;

const CardTitle = styled.h2`
  color: var(--primary-blue);
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
`;

const CardSub = styled.p`
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 1.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.15rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-dark);
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus { outline: none; border-color: var(--primary-teal); }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: var(--primary-teal);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.25rem;

  &:hover:not(:disabled) { background: #235f60; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ErrorBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.65rem 0.9rem;
  border-radius: 7px;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
`;

const SuccessBanner = styled(ErrorBanner)`
  background: #f0fff4;
  border-color: #9ae6b4;
  color: #276749;
`;

const BackLink = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 1.5rem;

  a { color: var(--primary-teal); text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    token: searchParams.get('token') || '',
    new_password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: form.token, new_password: form.new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reset failed');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card onSubmit={handleSubmit}>
        <CardTitle>Set new password</CardTitle>
        <CardSub>Enter your reset token and choose a new password.</CardSub>

        {error && <ErrorBanner>{error}</ErrorBanner>}
        {success && <SuccessBanner>Password updated! Redirecting to login…</SuccessBanner>}

        <FormGroup>
          <Label>Reset token</Label>
          <Input
            value={form.token}
            onChange={e => setForm(f => ({ ...f, token: e.target.value }))}
            placeholder="Paste your reset token"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>New password</Label>
          <Input
            type="password"
            value={form.new_password}
            onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />
        </FormGroup>

        <FormGroup>
          <Label>Confirm new password</Label>
          <Input
            type="password"
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="••••••••"
            required
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={loading || success}>
          {loading ? 'Updating…' : 'Update Password'}
        </SubmitButton>

        <BackLink>
          <Link to="/login">Back to sign in</Link>
        </BackLink>
      </Card>
    </Page>
  );
}
