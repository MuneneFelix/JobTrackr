import styled from 'styled-components';

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  width: 300px;
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--primary-teal);
  color: var(--white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
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
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const StatTitle = styled.div`
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-blue);
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.positive ? 'var(--success)' : 'var(--error)'};
`;

const TableContainer = styled.div`
  background: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: var(--text-light);
  border-bottom: 2px solid var(--bg-light);
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--bg-light);
`;

function AdminDashboard() {
  return (
    <div>
      <DashboardHeader>
        <Title>Admin Dashboard</Title>
        <HeaderActions>
          <SearchBar>
            <SearchInput type="search" placeholder="Search users, URLs, or jobs..." />
            <SearchButton>Search</SearchButton>
          </SearchBar>
        </HeaderActions>
      </DashboardHeader>

      <StatsGrid>
        <StatCard>
          <StatTitle>Total Users</StatTitle>
          <StatValue>1,234</StatValue>
          <StatChange positive>
            <span>↑ 12%</span>
            <span>vs last month</span>
          </StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>Active URLs</StatTitle>
          <StatValue>3,567</StatValue>
          <StatChange positive>
            <span>↑ 8%</span>
            <span>vs last month</span>
          </StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>Jobs Tracked</StatTitle>
          <StatValue>15,789</StatValue>
          <StatChange positive>
            <span>↑ 15%</span>
            <span>vs last month</span>
          </StatChange>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <h2>Recent Activity</h2>
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Action</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>John Doe</Td>
              <Td>Added new URL</Td>
              <Td>Active</Td>
              <Td>2 mins ago</Td>
              <Td>
                <button>View</button>
                <button>Edit</button>
              </Td>
            </tr>
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default AdminDashboard; 