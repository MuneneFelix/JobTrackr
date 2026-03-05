import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Card = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Status = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.isNew ? 'var(--success)' : 'var(--warning)'};
  color: var(--white);
`;

const Company = styled.div`
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const Title = styled.h3`
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-size: 1.125rem;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-light);
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.25rem 0.75rem;
  background: var(--bg-light);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--text-dark);
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bg-light);
`;

const Date = styled.span`
  font-size: 0.875rem;
  color: var(--text-light);
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--primary-teal);
  color: var(--white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

function JobCard({ job }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <Card>
      <Status isNew={job.isNew}>{job.isNew ? 'New' : 'Updated'}</Status>
      <Company>{job.company}</Company>
      <Title>{job.title}</Title>
      <Meta>
        <span>{job.location}</span>
        <span>{job.type}</span>
      </Meta>
      <Tags>
        {job.tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </Tags>
      <Actions>
        <Date>{job.date}</Date>
        <ViewButton onClick={handleViewDetails}>View Details</ViewButton>
      </Actions>
    </Card>
  );
}

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number.isRequired,
    company: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    isNew: PropTypes.bool.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
};

export default JobCard; 