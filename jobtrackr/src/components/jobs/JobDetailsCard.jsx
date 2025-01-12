import styled from 'styled-components';
import PropTypes from 'prop-types';

const Card = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const CompanyInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CompanyLogo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
`;

const CompanyName = styled.h2`
  color: var(--primary-blue);
  margin-bottom: 0.25rem;
`;

const Location = styled.div`
  color: var(--text-light);
  font-size: 0.875rem;
`;

const Status = styled.div`
  padding: 0.5rem 1rem;
  background: ${props => props.isNew ? 'var(--success)' : 'var(--warning)'};
  color: var(--white);
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  color: var(--text-light);
  font-size: 0.875rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;

  h3 {
    color: var(--primary-blue);
    margin-bottom: 1rem;
    font-size: 1.125rem;
  }

  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    color: var(--text-dark);
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: 1rem;
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

function JobDetailsCard({ job }) {
  return (
    <Card>
      <Header>
        <CompanyInfo>
          <CompanyLogo src={job.companyLogo || "https://via.placeholder.com/64"} alt={job.company} />
          <div>
            <CompanyName>{job.company}</CompanyName>
            <Location>{job.location}</Location>
          </div>
        </CompanyInfo>
        <Status isNew={job.isNew}>{job.isNew ? 'New' : 'Updated'}</Status>
      </Header>

      <Title>{job.title}</Title>

      <MetaInfo>
        <span>{job.type}</span>
        <span>{job.salary}</span>
        <span>Posted {job.postedDate}</span>
      </MetaInfo>

      <Section>
        <h3>Description</h3>
        <p>{job.description}</p>
      </Section>

      <Section>
        <h3>Requirements</h3>
        <ul>
          {job.requirements.map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </Section>

      <Section>
        <h3>Responsibilities</h3>
        <ul>
          {job.responsibilities.map((resp, index) => (
            <li key={index}>{resp}</li>
          ))}
        </ul>
      </Section>

      <ApplyButton onClick={() => window.open(job.applyUrl, '_blank')}>
        Apply Now
      </ApplyButton>
    </Card>
  );
}

JobDetailsCard.propTypes = {
  job: PropTypes.shape({
    company: PropTypes.string.isRequired,
    companyLogo: PropTypes.string,
    title: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    salary: PropTypes.string,
    isNew: PropTypes.bool,
    postedDate: PropTypes.string,
    description: PropTypes.string.isRequired,
    requirements: PropTypes.arrayOf(PropTypes.string).isRequired,
    responsibilities: PropTypes.arrayOf(PropTypes.string).isRequired,
    applyUrl: PropTypes.string.isRequired,
  }).isRequired,
};

export default JobDetailsCard; 