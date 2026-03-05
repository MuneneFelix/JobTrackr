import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

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

const SuccessBanner = styled(ErrorBanner)`
  background: #f0fff4;
  border-color: #9ae6b4;
  color: #276749;
`;

const Footer = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-light);
  margin-top: 1.25rem;

  a { color: var(--primary-teal); text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
`;

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const registered = new URLSearchParams(location.search).get('registered');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch {
      // handled by AuthContext
    }
  };

  return (
    <Page>
      <Branding>
        <BrandTitle>JobTrackr</BrandTitle>
        <BrandSub>
          Monitor job boards automatically. Never miss a new opening again.
        </BrandSub>
        <Perks>
          <li><span className="icon">🔍</span> AI-powered job extraction</li>
          <li><span className="icon">⏰</span> Scheduled automatic scraping</li>
          <li><span className="icon">📬</span> Unread job tracking</li>
        </Perks>
      </Branding>

      <FormSide>
        <Card onSubmit={handleSubmit}>
          <CardTitle>Welcome back</CardTitle>
          <CardSub>Sign in to your account to continue</CardSub>

          {registered && <SuccessBanner>Account created! You can now log in.</SuccessBanner>}
          {error && <ErrorBanner>{error}</ErrorBanner>}

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormGroup>

          <div style={{ textAlign: 'right', marginBottom: '0.25rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </SubmitButton>

          <Footer>
            Don&apos;t have an account? <Link to="/signup">Sign up free</Link>
          </Footer>
        </Card>
      </FormSide>
    </Page>
  );
}

export default Login;
