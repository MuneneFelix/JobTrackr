import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import LoadingSpinner from '../components/common/LoadingSpinner';

const URLDetailsContainer = styled.div`
  padding: 2rem;
`;

const URLHeader = styled.div`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const URLTitle = styled.h1`
  color: var(--primary-blue);
  margin-bottom: 1rem;
`;

const URLLink = styled.a`
  color: var(--primary-teal);
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const StatCard = styled.div`
  background: var(--bg-light);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

function URLDetails() {
  const { id } = useParams();
  // TODO: Fetch URL details using id

  const mockURL = {
    title: 'Google Careers',
    url: 'https://careers.google.com',
    status: 'Active',
    lastChecked: '5 minutes ago',
    totalJobs: 156,
    newJobs: 3,
    updatedJobs: 2
  };

  return (
    <URLDetailsContainer>
      <URLHeader>
        <URLTitle>{mockURL.title}</URLTitle>
        <URLLink href={mockURL.url} target="_blank" rel="noopener noreferrer">
          {mockURL.url}
        </URLLink>
        <StatsGrid>
          <StatCard>
            <h3>Status</h3>
            <p>{mockURL.status}</p>
          </StatCard>
          <StatCard>
            <h3>Last Checked</h3>
            <p>{mockURL.lastChecked}</p>
          </StatCard>
          <StatCard>
            <h3>Total Jobs</h3>
            <p>{mockURL.totalJobs}</p>
          </StatCard>
          <StatCard>
            <h3>New Jobs</h3>
            <p>{mockURL.newJobs}</p>
          </StatCard>
        </StatsGrid>
      </URLHeader>
    </URLDetailsContainer>
  );
}

export default URLDetails; 