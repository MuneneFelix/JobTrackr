import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Card = styled.div`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--primary-blue);
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 8px;
`;

const Label = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
`;

const Value = styled.div`
  color: var(--text-dark);
  font-weight: 500;
`;

function Profile() {
  const { user } = useAuth();
  const [loading] = useState(false);

  if (loading) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <Container>
      <Header>
        <Title>Profile</Title>
      </Header>

      <Card>
        <Section>
          <SectionTitle>Personal Information</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <Label>Name</Label>
              <Value>{user.name}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Email</Label>
              <Value>{user.email}</Value>
            </InfoItem>
            <InfoItem>
              <Label>Role</Label>
              <Value>{user.isAdmin ? 'Administrator' : 'User'}</Value>
            </InfoItem>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>Account Statistics</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <Label>Job Sources</Label>
              <Value>5</Value>
            </InfoItem>
            <InfoItem>
              <Label>Jobs Found</Label>
              <Value>156</Value>
            </InfoItem>
            <InfoItem>
              <Label>Member Since</Label>
              <Value>March 2024</Value>
            </InfoItem>
          </InfoGrid>
        </Section>
      </Card>
    </Container>
  );
}

export default Profile; 