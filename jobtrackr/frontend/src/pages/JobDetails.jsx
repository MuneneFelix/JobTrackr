import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  padding: 2rem;
  max-width: 760px;
  margin: 0 auto;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: var(--primary-teal);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;

  &:hover { text-decoration: underline; }
`;

const Card = styled.div`
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const CardTop = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #f0f4f8;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const JobTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
`;

const NewBadge = styled.span`
  flex-shrink: 0;
  padding: 0.25rem 0.7rem;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const Company = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-teal);
  margin-bottom: 1rem;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Pill = styled.span`
  padding: 0.3rem 0.8rem;
  background: var(--bg-light);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--text-light);
  border: 1px solid #e2e8f0;
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 1.75rem;

  &:last-child { margin-bottom: 0; }
`;

const SectionTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-light);
  margin-bottom: 0.75rem;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: var(--text-dark);
  line-height: 1.75;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
`;

const MetaItem = styled.div`
  background: var(--bg-light);
  border-radius: 8px;
  padding: 0.75rem 1rem;
`;

const MetaLabel = styled.div`
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
  margin-bottom: 0.25rem;
`;

const MetaValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dark);
`;

const CardFooter = styled.div`
  padding: 1.25rem 2rem;
  border-top: 1px solid #f0f4f8;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ApplyBtn = styled.a`
  padding: 0.7rem 1.75rem;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    background: #235f60;
    box-shadow: 0 4px 12px rgba(44,122,123,0.3);
  }
`;

const MarkReadBtn = styled.button`
  padding: 0.7rem 1.25rem;
  background: transparent;
  border: 1.5px solid #e2e8f0;
  color: var(--text-light);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-teal);
    color: var(--primary-teal);
  }
`;

const ErrorText = styled.p`
  color: var(--error);
  text-align: center;
  padding: 3rem;
`;

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch(`/jobs/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Job not found');
        return r.json();
      })
      .then(setJob)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, authFetch]);

  const markRead = async () => {
    await authFetch(`/jobs/${id}/read`, { method: 'PATCH' });
    setJob(j => ({ ...j, is_new: false }));
  };

  if (loading) return <Page><p style={{ color: 'var(--text-light)', padding: '2rem 0' }}>Loading…</p></Page>;
  if (error) return <Page><ErrorText>{error}</ErrorText></Page>;
  if (!job) return null;

  return (
    <Page>
      <BackBtn onClick={() => navigate(-1)}>← Back to jobs</BackBtn>

      <Card>
        <CardTop>
          <TopRow>
            <JobTitle>{job.title}</JobTitle>
            {job.is_new && <NewBadge>New</NewBadge>}
          </TopRow>
          {job.company && <Company>{job.company}</Company>}
          <Pills>
            {job.location && <Pill>📍 {job.location}</Pill>}
            {job.salary  && <Pill>💰 {job.salary}</Pill>}
          </Pills>
        </CardTop>

        <CardBody>
          {job.description && (
            <Section>
              <SectionTitle>About this role</SectionTitle>
              <Description>{job.description}</Description>
            </Section>
          )}

          <Section>
            <SectionTitle>Details</SectionTitle>
            <MetaGrid>
              {job.posted_date && (
                <MetaItem>
                  <MetaLabel>Posted</MetaLabel>
                  <MetaValue>{job.posted_date}</MetaValue>
                </MetaItem>
              )}
              <MetaItem>
                <MetaLabel>Found</MetaLabel>
                <MetaValue>{new Date(job.found_at).toLocaleDateString()}</MetaValue>
              </MetaItem>
              {job.company && (
                <MetaItem>
                  <MetaLabel>Company</MetaLabel>
                  <MetaValue>{job.company}</MetaValue>
                </MetaItem>
              )}
              {job.location && (
                <MetaItem>
                  <MetaLabel>Location</MetaLabel>
                  <MetaValue>{job.location}</MetaValue>
                </MetaItem>
              )}
            </MetaGrid>
          </Section>
        </CardBody>

        <CardFooter>
          {job.url && (
            <ApplyBtn href={job.url} target="_blank" rel="noopener noreferrer">
              View Job Posting ↗
            </ApplyBtn>
          )}
          {job.is_new && (
            <MarkReadBtn onClick={markRead}>Mark as read</MarkReadBtn>
          )}
        </CardFooter>
      </Card>
    </Page>
  );
}

export default JobDetails;
