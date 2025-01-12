import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from '../hooks/useForm';
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

const Subtitle = styled.p`
  color: var(--text-light);
`;

const Form = styled.form`
  background: var(--white);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormSection = styled.div`
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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  background: var(--white);
  
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.primary ? `
    background: var(--primary-teal);
    color: var(--white);
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  ` : `
    background: var(--white);
    color: var(--text-dark);
    border: 1px solid var(--bg-light);

    &:hover {
      background: var(--bg-light);
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

function AddJobSource() {
  const [loading, setLoading] = useState(false);
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
    if (!values.company) {
      errors.company = 'Company name is required';
    }
    if (!values.jobType) {
      errors.jobType = 'Job type is required';
    }
    if (!values.checkFrequency) {
      errors.checkFrequency = 'Check frequency is required';
    }
    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      title: '',
      url: '',
      company: '',
      jobType: '',
      checkFrequency: '',
      keywords: '',
      location: ''
    },
    validateForm
  );

  const handleAddSource = async (formValues) => {
    try {
      setLoading(true);
      // API call would go here
      console.log('Form values:', formValues);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/urls');
    } catch (error) {
      console.error('Error adding job source:', error);
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
        <Title>Add Job Source</Title>
        <Subtitle>Configure a new job board or career page to track</Subtitle>
      </Header>

      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(handleAddSource);
      }}>
        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>
          <FormGroup>
            <Label htmlFor="title">Source Title*</Label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="e.g., Google Careers Page"
            />
            {errors.title && <ErrorText>{errors.title}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="url">URL*</Label>
            <Input
              id="url"
              name="url"
              value={values.url}
              onChange={handleChange}
              placeholder="https://careers.company.com"
            />
            {errors.url && <ErrorText>{errors.url}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="company">Company Name*</Label>
            <Input
              id="company"
              name="company"
              value={values.company}
              onChange={handleChange}
              placeholder="e.g., Google"
            />
            {errors.company && <ErrorText>{errors.company}</ErrorText>}
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Job Preferences</SectionTitle>
          <FormGroup>
            <Label htmlFor="jobType">Job Type*</Label>
            <Select
              id="jobType"
              name="jobType"
              value={values.jobType}
              onChange={handleChange}
            >
              <option value="">Select a job type</option>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
            {errors.jobType && <ErrorText>{errors.jobType}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              name="keywords"
              value={values.keywords}
              onChange={handleChange}
              placeholder="e.g., software engineer, developer"
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>Monitoring Settings</SectionTitle>
          <FormGroup>
            <Label htmlFor="checkFrequency">Check Frequency*</Label>
            <Select
              id="checkFrequency"
              name="checkFrequency"
              value={values.checkFrequency}
              onChange={handleChange}
            >
              <option value="">Select check frequency</option>
              <option value="hourly">Every hour</option>
              <option value="daily">Once a day</option>
              <option value="weekly">Once a week</option>
            </Select>
            {errors.checkFrequency && <ErrorText>{errors.checkFrequency}</ErrorText>}
          </FormGroup>
        </FormSection>

        <ButtonGroup>
          <Button type="button" onClick={() => navigate('/urls')}>
            Cancel
          </Button>
          <Button type="submit" primary disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Job Source'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
}

export default AddJobSource; 