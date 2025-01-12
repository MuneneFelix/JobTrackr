import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const SettingsContainer = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const SettingsForm = styled.form`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;

  h2 {
    color: var(--primary-blue);
    margin-bottom: 1rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-weight: 500;
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

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  width: 40px;
  height: 20px;
  appearance: none;
  background: ${props => props.checked ? 'var(--primary-teal)' : 'var(--bg-light)'};
  border-radius: 10px;
  position: relative;
  cursor: pointer;

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '22px' : '2px'};
    transition: left 0.3s ease;
  }
`;

const SaveButton = styled.button`
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

function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: {
      email: true,
      browser: false,
    },
    privacy: {
      profilePublic: true,
      showActivity: true,
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement settings update
    console.log('Settings updated:', formData);
  };

  return (
    <SettingsContainer>
      <h1>Settings</h1>
      <SettingsForm onSubmit={handleSubmit}>
        <Section>
          <h2>Profile</h2>
          <FormGroup>
            <Label>Full Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>
        </Section>

        <Section>
          <h2>Notifications</h2>
          <FormGroup>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={formData.notifications.email}
                onChange={() => handleToggle('notifications', 'email')}
              />
              Email Notifications
            </Toggle>
          </FormGroup>
          <FormGroup>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={formData.notifications.browser}
                onChange={() => handleToggle('notifications', 'browser')}
              />
              Browser Notifications
            </Toggle>
          </FormGroup>
        </Section>

        <Section>
          <h2>Privacy</h2>
          <FormGroup>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={formData.privacy.profilePublic}
                onChange={() => handleToggle('privacy', 'profilePublic')}
              />
              Public Profile
            </Toggle>
          </FormGroup>
          <FormGroup>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={formData.privacy.showActivity}
                onChange={() => handleToggle('privacy', 'showActivity')}
              />
              Show Activity
            </Toggle>
          </FormGroup>
        </Section>

        <SaveButton type="submit">Save Changes</SaveButton>
      </SettingsForm>
    </SettingsContainer>
  );
}

export default Settings; 