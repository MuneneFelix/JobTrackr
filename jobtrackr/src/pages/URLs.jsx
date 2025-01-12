import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useForm } from '../hooks/useForm';
import { useNavigate } from 'react-router-dom';

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

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
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

const URLGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const URLCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const URLHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const URLTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--primary-blue);
  margin-bottom: 0.5rem;
`;

const URLLink = styled.a`
  color: var(--primary-teal);
  font-size: 0.875rem;
  word-break: break-all;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const URLStatus = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.active ? 'var(--success)' : 'var(--error)'};
  color: var(--white);
`;

const URLStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-blue);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-light);
`;

const AddURLModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
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
  
  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
`;

const ErrorText = styled.div`
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

function URLs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [urls, setUrls] = useState([
    {
      id: 1,
      title: 'Google Careers',
      url: 'https://careers.google.com',
      status: 'active',
      jobsFound: 156,
      lastChecked: '5 mins ago'
    }
  ]);
  const navigate = useNavigate();

  const validateForm = (values) => {
    const errors = {};
    if (!values.title) {
      errors.title = 'Title is required';
    }
    if (!values.url) {
      errors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(values.url)) {
      errors.url = 'Must be a valid URL';
    }
    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { title: '', url: '' },
    validateForm
  );

  const handleAddURL = async (formValues) => {
    try {
      setLoading(true);
      // API call would go here
      const newUrl = {
        id: urls.length + 1,
        ...formValues,
        status: 'active',
        jobsFound: 0,
        lastChecked: 'Just now'
      };
      setUrls(prev => [...prev, newUrl]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding URL:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <Container>
      <Header>
        <Title>My Job Sources</Title>
        <AddButton onClick={() => navigate('/urls/add')}>Add New Source</AddButton>
      </Header>

      <URLGrid>
        {urls.map(url => (
          <URLCard key={url.id}>
            <URLHeader>
              <div>
                <URLTitle>{url.title}</URLTitle>
                <URLLink href={url.url} target="_blank" rel="noopener noreferrer">
                  {url.url}
                </URLLink>
              </div>
              <URLStatus active={url.status === 'active'}>
                {url.status}
              </URLStatus>
            </URLHeader>

            <URLStats>
              <StatItem>
                <StatValue>{url.jobsFound}</StatValue>
                <StatLabel>Jobs Found</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{url.lastChecked}</StatValue>
                <StatLabel>Last Checked</StatLabel>
              </StatItem>
            </URLStats>
          </URLCard>
        ))}
      </URLGrid>

      {showModal && (
        <AddURLModal>
          <ModalContent>
            <h2>Add New Job Source</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(handleAddURL);
            }}>
              <FormGroup>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                />
                {errors.title && <ErrorText>{errors.title}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={values.url}
                  onChange={handleChange}
                />
                {errors.url && <ErrorText>{errors.url}</ErrorText>}
              </FormGroup>

              <AddButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add URL'}
              </AddButton>
            </form>
          </ModalContent>
        </AddURLModal>
      )}
    </Container>
  );
}

export default URLs; 