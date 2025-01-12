import styled from 'styled-components';
import { Link } from 'react-router-dom';

const AuthContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, var(--bg-light) 0%, #E6FFFA 100%);
`;

const AuthForm = styled.form`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  margin: auto;
`;

const FormTitle = styled.h1`
  color: var(--primary-blue);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-teal);
  color: var(--white);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

function Signup() {
  return (
    <AuthContainer>
      <AuthForm>
        <FormTitle>Create Account</FormTitle>
        <FormGroup>
          <Label>Full Name</Label>
          <Input type="text" required />
        </FormGroup>
        <FormGroup>
          <Label>Email</Label>
          <Input type="email" required />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <Input type="password" required />
        </FormGroup>
        <FormGroup>
          <Label>Confirm Password</Label>
          <Input type="password" required />
        </FormGroup>
        <SubmitButton type="submit">Sign Up</SubmitButton>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </AuthForm>
    </AuthContainer>
  );
}

export default Signup; 