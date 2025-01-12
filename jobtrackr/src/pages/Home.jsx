import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  min-height: calc(100vh - 70px);
`;

const Hero = styled.section`
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-teal) 100%);
  padding: 4rem 2rem;
  color: var(--white);
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--accent-coral);
  color: var(--white);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

const Features = styled.section`
  padding: 4rem 2rem;
  background: var(--white);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-teal);
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: var(--text-light);
  line-height: 1.6;
`;

const HowItWorks = styled.section`
  padding: 4rem 2rem;
  background: var(--bg-light);
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: var(--primary-blue);
  margin-bottom: 3rem;
`;

const Steps = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  color: var(--text-light);
  line-height: 1.6;
`;

function Home() {
  return (
    <HomeContainer>
      <Hero>
        <HeroContent>
          <Title>Track Your Job Search Journey</Title>
          <Subtitle>
            Streamline your job hunting process with automated tracking and powerful insights
          </Subtitle>
          <CTAButton to="/signup">Get Started Free</CTAButton>
        </HeroContent>
      </Hero>

      <Features>
        <SectionTitle>Why Choose JobTrackr?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureTitle>Automated Job Tracking</FeatureTitle>
            <FeatureDescription>
              Automatically track job postings from multiple sources in one place
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Smart Analytics</FeatureTitle>
            <FeatureDescription>
              Get insights into your job search progress and application success rate
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔔</FeatureIcon>
            <FeatureTitle>Real-time Notifications</FeatureTitle>
            <FeatureDescription>
              Stay updated with instant notifications for new jobs and application status changes
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </Features>

      <HowItWorks>
        <SectionTitle>How It Works</SectionTitle>
        <Steps>
          <Step>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Add Your Job Sources</StepTitle>
              <StepDescription>
                Enter the career pages and job boards you want to track
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>Automatic Monitoring</StepTitle>
              <StepDescription>
                We'll automatically check for new jobs and changes to existing listings
              </StepDescription>
            </StepContent>
          </Step>

          <Step>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Track Your Progress</StepTitle>
              <StepDescription>
                Keep track of your applications, interviews, and offers in one place
              </StepDescription>
            </StepContent>
          </Step>
        </Steps>
      </HowItWorks>
    </HomeContainer>
  );
}

export default Home; 