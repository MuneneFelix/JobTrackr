import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
`;

const SettingsForm = styled.form`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 600px;
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
`;

function AdminSettings() {
  return (
    <Container>
      <Header>
        <Title>Admin Settings</Title>
      </Header>
      <SettingsForm>
        <FormGroup>
          <Label>Site Name</Label>
          <Input type="text" defaultValue="JobTrackr" />
        </FormGroup>
        <FormGroup>
          <Label>Admin Email</Label>
          <Input type="email" defaultValue="admin@jobtrackr.com" />
        </FormGroup>
        {/* Add more settings fields */}
      </SettingsForm>
    </Container>
  );
}

export default AdminSettings; 