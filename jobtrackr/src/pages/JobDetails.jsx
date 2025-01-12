import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import JobDetailsCard from '../components/jobs/JobDetailsCard';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

// Mock data - in real app, this would come from an API
const mockJob = {
  id: 1,
  company: 'Google',
  companyLogo: 'https://via.placeholder.com/64',
  title: 'Senior Software Engineer',
  location: 'Mountain View, CA',
  type: 'Full-time',
  salary: '$150,000 - $200,000',
  isNew: true,
  postedDate: '2 days ago',
  description: 'We are looking for a Senior Software Engineer to join our team...',
  requirements: [
    'Bachelor\'s degree in Computer Science or related field',
    '8+ years of software development experience',
    'Strong experience with distributed systems',
    'Excellent problem-solving skills'
  ],
  responsibilities: [
    'Design and implement scalable solutions',
    'Lead technical projects and mentor junior engineers',
    'Collaborate with cross-functional teams',
    'Participate in code reviews and technical discussions'
  ],
  applyUrl: 'https://careers.google.com'
};

function JobDetails() {
  const { id } = useParams();
  
  // In a real app, you would fetch the job details using the id
  console.log('Job ID:', id);

  return (
    <Container>
      <JobDetailsCard job={mockJob} />
    </Container>
  );
}

export default JobDetails; 