import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.div`
  min-height: calc(100vh - 70px);
`;

// ── Hero ──────────────────────────────────────────────────────────────────────

const Hero = styled.section`
  background: linear-gradient(135deg, var(--primary-blue) 0%, #1a6b6c 100%);
  padding: 6rem 2rem 5rem;
  color: var(--white);
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const HeroTag = styled.div`
  display: inline-block;
  background: rgba(255,255,255,0.15);
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;

  span { color: #7dd3d4; }
`;

const HeroSub = styled.p`
  font-size: 1.15rem;
  opacity: 0.85;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryBtn = styled(Link)`
  padding: 0.9rem 2rem;
  background: var(--white);
  color: var(--primary-blue);
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const SecondaryBtn = styled(Link)`
  padding: 0.9rem 2rem;
  background: transparent;
  color: var(--white);
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--white);
    background: rgba(255,255,255,0.1);
  }
`;

// ── Features ──────────────────────────────────────────────────────────────────

const Features = styled.section`
  padding: 5rem 2rem;
  background: var(--white);
`;

const SectionLabel = styled.div`
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--primary-teal);
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.75rem;
`;

const SectionSub = styled.p`
  text-align: center;
  color: var(--text-light);
  max-width: 480px;
  margin: 0 auto 3.5rem;
  line-height: 1.7;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: var(--bg-light);
  padding: 2rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
`;

const FeatureDesc = styled.p`
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.65;
`;

// ── How it works ──────────────────────────────────────────────────────────────

const HowItWorks = styled.section`
  padding: 5rem 2rem;
  background: var(--bg-light);
`;

const Steps = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Step = styled.div`
  display: flex;
  gap: 1.5rem;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 19px;
    top: 44px;
    bottom: -1px;
    width: 2px;
    background: #e2e8f0;
  }
`;

const StepNum = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--primary-teal);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
`;

const StepBody = styled.div`
  padding-bottom: 2.5rem;
`;

const StepTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.4rem;
  padding-top: 0.5rem;
`;

const StepDesc = styled.p`
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.65;
`;

// ── CTA ───────────────────────────────────────────────────────────────────────

const CTA = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, #1a6b6c 100%);
  text-align: center;
  color: var(--white);

  h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
  p  { opacity: 0.8; margin-bottom: 2rem; font-size: 1.05rem; }
`;

// ── Component ─────────────────────────────────────────────────────────────────

function Home() {
  return (
    <Page>
      <Hero>
        <HeroContent>
          <HeroTag>AI-Powered Job Tracking</HeroTag>
          <HeroTitle>
            Never miss a <span>job opening</span> again
          </HeroTitle>
          <HeroSub>
            Add any job board or careers page. JobTrackr scrapes it automatically
            and uses AI to extract every listing — structured and searchable.
          </HeroSub>
          <HeroButtons>
            <PrimaryBtn to="/signup">Get Started Free</PrimaryBtn>
            <SecondaryBtn to="/login">Sign In</SecondaryBtn>
          </HeroButtons>
        </HeroContent>
      </Hero>

      <Features>
        <SectionLabel>Features</SectionLabel>
        <SectionTitle>Everything you need</SectionTitle>
        <SectionSub>
          Built for job seekers who want to stay ahead without checking 10 tabs every morning.
        </SectionSub>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🤖</FeatureIcon>
            <FeatureTitle>AI Extraction</FeatureTitle>
            <FeatureDesc>
              No custom parsers needed. Our AI reads any career page and extracts
              job titles, companies, locations, and salaries automatically.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>⏰</FeatureIcon>
            <FeatureTitle>Scheduled Scraping</FeatureTitle>
            <FeatureDesc>
              Set a check frequency (hourly, daily) per source. New jobs are
              flagged and waiting for you when you log in.
            </FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>📬</FeatureIcon>
            <FeatureTitle>Unread Tracking</FeatureTitle>
            <FeatureDesc>
              Jobs are marked as new until you review them. Never lose track of
              what you've seen and what's fresh.
            </FeatureDesc>
          </FeatureCard>
        </FeaturesGrid>
      </Features>

      <HowItWorks>
        <SectionLabel>How it works</SectionLabel>
        <SectionTitle>Up and running in 3 steps</SectionTitle>
        <SectionSub>No setup headaches. Works on any public careers page.</SectionSub>
        <Steps>
          <Step>
            <StepNum>1</StepNum>
            <StepBody>
              <StepTitle>Add a job source</StepTitle>
              <StepDesc>Paste the URL of any job board, careers page, or listing site you want to monitor.</StepDesc>
            </StepBody>
          </Step>
          <Step>
            <StepNum>2</StepNum>
            <StepBody>
              <StepTitle>We scrape it for you</StepTitle>
              <StepDesc>JobTrackr fetches the page and our AI extracts every job listing into structured data.</StepDesc>
            </StepBody>
          </Step>
          <Step>
            <StepNum>3</StepNum>
            <StepBody>
              <StepTitle>Browse new jobs</StepTitle>
              <StepDesc>Log in to see what's new, filter by source, and mark jobs as read when you're done.</StepDesc>
            </StepBody>
          </Step>
        </Steps>
      </HowItWorks>

      <CTA>
        <h2>Ready to track smarter?</h2>
        <p>Free to use. No credit card required.</p>
        <PrimaryBtn to="/signup">Create Your Account</PrimaryBtn>
      </CTA>
    </Page>
  );
}

export default Home;
