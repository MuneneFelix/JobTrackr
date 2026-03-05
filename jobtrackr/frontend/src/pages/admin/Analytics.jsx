import styled from 'styled-components';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

function AdminAnalytics() {
  return (
    <Container>
      <Header>
        <Title>Analytics</Title>
      </Header>
      <StatsGrid>
        <StatCard>
          <h3>Total Users</h3>
          <div>1,234</div>
        </StatCard>
        <StatCard>
          <h3>Active URLs</h3>
          <div>567</div>
        </StatCard>
        <StatCard>
          <h3>Jobs Found</h3>
          <div>15,789</div>
        </StatCard>
      </StatsGrid>
      {/* Add charts and detailed analytics here */}
    </Container>
  );
}

export default AdminAnalytics; 