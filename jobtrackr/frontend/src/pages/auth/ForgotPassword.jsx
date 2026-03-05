import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const Card = styled.div`
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
  line-height: 1.6;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
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

const TokenBox = styled.div`
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;
`;

const TokenLabel = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: #276749;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const TokenValue = styled.div`
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
  background: var(--white);
  border: 1px solid #c6f6d5;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  color: var(--text-dark);
  margin-bottom: 0.75rem;
`;

const ResetLink = styled(Link)`
  display: block;
  text-align: center;
  padding: 0.7rem;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover { background: #235f60; }
`;

const DevNote = styled.p`
  font-size: 0.72rem;
  color: var(--text-light);
  text-align: center;
  margin-top: 0.75rem;
  font-style: italic;
`;

const BackLink = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 1.5rem;

  a { color: var(--primary-teal); text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDevToken('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Request failed');
      if (data.dev_token) setDevToken(data.dev_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <CardTitle>Forgot password?</CardTitle>
        <CardSub>
          Enter your email and we&apos;ll generate a reset link for you.
        </CardSub>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        {!devToken ? (
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Email address</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </FormGroup>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </SubmitButton>
          </form>
        ) : (
          <TokenBox>
            <TokenLabel>Your reset token</TokenLabel>
            <TokenValue>{devToken}</TokenValue>
            <ResetLink to={`/reset-password?token=${devToken}`}>
              Continue to reset password →
            </ResetLink>
            <DevNote>
              In production this would be sent to your email.
            </DevNote>
          </TokenBox>
        )}

        <BackLink>
          Remember your password? <Link to="/login">Sign in</Link>
        </BackLink>
      </Card>
    </Page>
  );
}
