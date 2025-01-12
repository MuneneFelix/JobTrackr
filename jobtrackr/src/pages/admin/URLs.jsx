import { useState } from 'react';
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
  background: ${props => props.active ? 'var(--success)' : 'var(--error)'};
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

function AdminURLs() {
  const [urls] = useState([
    {
      id: 1,
      title: 'Google Careers',
      url: 'https://careers.google.com',
      owner: 'John Doe',
      status: 'active',
      jobsFound: 156,
      lastChecked: '5 mins ago'
    },
    {
      id: 2,
      title: 'Microsoft Careers',
      url: 'https://careers.microsoft.com',
      owner: 'Jane Smith',
      status: 'error',
      jobsFound: 89,
      lastChecked: '1 hour ago'
    }
  ]);

  return (
    <Container>
      <Header>
        <Title>All URLs</Title>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>URL</Th>
              <Th>Owner</Th>
              <Th>Status</Th>
              <Th>Jobs Found</Th>
              <Th>Last Checked</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {urls.map(url => (
              <tr key={url.id}>
                <Td>{url.title}</Td>
                <Td>
                  <a href={url.url} target="_blank" rel="noopener noreferrer">
                    {url.url}
                  </a>
                </Td>
                <Td>{url.owner}</Td>
                <Td>
                  <StatusBadge active={url.status === 'active'}>
                    {url.status}
                  </StatusBadge>
                </Td>
                <Td>{url.jobsFound}</Td>
                <Td>{url.lastChecked}</Td>
                <Td>
                  <ActionButton>View</ActionButton>
                  <ActionButton>Edit</ActionButton>
                  <ActionButton>Delete</ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default AdminURLs;