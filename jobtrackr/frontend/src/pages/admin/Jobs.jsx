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

function AdminJobs() {
  return (
    <Container>
      <Header>
        <Title>Jobs Management</Title>
      </Header>
      {/* Add job management content here */}
    </Container>
  );
}

export default AdminJobs; 