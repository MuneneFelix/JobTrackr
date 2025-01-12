import { useState } from 'react';
import styled from 'styled-components';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';

const JobsContainer = styled.div`
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

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ToggleButton = styled.button`
  padding: 0.5rem;
  border: 1px solid var(--bg-light);
  background: ${props => props.active ? 'var(--primary-teal)' : 'var(--white)'};
  color: ${props => props.active ? 'var(--white)' : 'var(--text-dark)'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => !props.active && 'var(--bg-light)'};
  }
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const mockJobs = [
  {
    company: 'Google',
    title: 'Senior Software Engineer',
    location: 'Mountain View, CA',
    type: 'Full-time',
    tags: ['Python', 'Cloud', 'AI/ML'],
    isNew: true,
    date: 'Posted 2 hours ago'
  },
  {
    company: 'Microsoft',
    title: 'Product Manager',
    location: 'Redmond, WA',
    type: 'Full-time',
    tags: ['Product', 'Azure', 'Management'],
    isNew: false,
    date: 'Updated 1 day ago'
  }
];

function Jobs() {
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    status: ''
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <JobsContainer>
      <Header>
        <Title>Job Listings</Title>
        <ViewToggle>
          <ToggleButton 
            active={view === 'grid'} 
            onClick={() => setView('grid')}
          >
            ⊞
          </ToggleButton>
          <ToggleButton 
            active={view === 'list'} 
            onClick={() => setView('list')}
          >
            ☰
          </ToggleButton>
        </ViewToggle>
      </Header>

      <JobFilters onFilterChange={handleFilterChange} />

      <JobsGrid>
        {mockJobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </JobsGrid>
    </JobsContainer>
  );
}

export default Jobs; 