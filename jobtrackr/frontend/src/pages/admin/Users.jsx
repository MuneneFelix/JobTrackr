import { useState } from 'react';
import styled from 'styled-components';

const UsersContainer = styled.div`
  padding: 1rem;
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

const TableContainer = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: var(--white);
  color: var(--text-light);
  font-weight: 500;
  border-bottom: 2px solid var(--bg-light);
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--bg-light);
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.active ? 'var(--success)' : 'var(--text-light)'};
  color: var(--white);
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;

  &:hover {
    background: var(--bg-light);
    color: var(--primary-teal);
  }
`;

function Users() {
  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      lastActive: '2 mins ago'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'inactive',
      lastActive: '5 days ago'
    }
  ]);

  return (
    <UsersContainer>
      <Header>
        <Title>User Management</Title>
        <AddButton>Add User</AddButton>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Last Active</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <StatusBadge active={user.status === 'active'}>
                    {user.status}
                  </StatusBadge>
                </Td>
                <Td>{user.lastActive}</Td>
                <Td>
                  <ActionButton>Edit</ActionButton>
                  <ActionButton>Delete</ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </UsersContainer>
  );
}

export default Users; 