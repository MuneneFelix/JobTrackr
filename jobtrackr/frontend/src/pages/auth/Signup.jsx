import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const API = "/api";

const Page = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
`;

const Branding = styled.div`
  flex: 1;
  background: linear-gradient(145deg, var(--primary-blue) 0%, #2a6b6c 100%);
  color: var(--white);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;

  @media (max-width: 768px) { display: none; }
`;

const BrandTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
`;

const BrandSub = styled.p`
  opacity: 0.8;
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 340px;
`;

const Perks = styled.ul`
  list-style: none;
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    font-size: 0.95rem;
    opacity: 0.9;
  }

  span.icon { font-size: 1.1rem; }
`;

const FormSide = styled.div`
  flex: 1;
  display: flex;
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
  max-width: 400px;
`;

const CardTitle = styled.h2`
  color: var(--primary-blue);
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
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
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
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
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background: #235f60;
    box-shadow: 0 4px 12px rgba(44,122,123,0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const Footer = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 1.25rem;

  a { color: var(--primary-teal); text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
`;

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Signup failed');
      }
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Branding>
        <BrandTitle>JobTrackr</BrandTitle>
        <BrandSub>
          Create a free account and start monitoring job boards in minutes.
        </BrandSub>
        <Perks>
          <li><span className="icon">✅</span> Free to use</li>
          <li><span className="icon">🤖</span> AI extracts jobs automatically</li>
          <li><span className="icon">🔒</span> Your data stays private</li>
        </Perks>
      </Branding>

      <FormSide>
        <Card onSubmit={handleSubmit}>
          <CardTitle>Create account</CardTitle>
          <CardSub>Start tracking jobs for free today</CardSub>

          {error && <ErrorBanner>{error}</ErrorBanner>}

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </FormGroup>

          <FormGroup>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </SubmitButton>

          <Footer>
            Already have an account? <Link to="/login">Sign in</Link>
          </Footer>
        </Card>
      </FormSide>
    </Page>
  );
}

export default Signup;
