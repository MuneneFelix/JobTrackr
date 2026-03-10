import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Page = styled.div` padding: 1rem; `;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: var(--primary-blue);
  font-size: 2rem;
  margin: 0;
`;

const TableContainer = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0f4f8;
  vertical-align: middle;
  color: var(--text-dark);
`;

const Badge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => p.active ? '#e6f7ee' : '#fff5f5'};
  color: ${p => p.active ? 'var(--success)' : 'var(--error)'};
`;

const AdminBadge = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${p => p.admin ? '#fef3c7' : '#f0f4f8'};
  color: ${p => p.admin ? '#92400e' : 'var(--text-light)'};
`;

const Toggle = styled.button`
  width: 40px;
  height: 22px;
  border-radius: 999px;
  border: none;
  background: ${p => p.on ? 'var(--primary-teal)' : '#cbd5e0'};
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  position: relative;
  transition: background 0.2s;
  opacity: ${p => p.disabled ? 0.5 : 1};
  &::after {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${p => p.on ? '21px' : '3px'};
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const ErrorBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: var(--error);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  background: var(--white);
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  font-size: 0.875rem;
  color: var(--text-light);
  span { font-weight: 700; color: var(--primary-blue); font-size: 1.1rem; margin-right: 0.35rem; }
`;

export default function Users() {
  const { authFetch, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = () => {
    setLoading(true);
    authFetch('/admin/users/')
      .then(res => { if (!res.ok) throw new Error('Failed to load users'); return res.json(); })
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleToggle = async (userId, field, currentValue) => {
    try {
      const res = await authFetch(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || 'Update failed');
      }
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (e) {
      setError(e.message);
    }
  };

  const adminCount = users.filter(u => u.is_admin).length;
  const activeCount = users.filter(u => u.is_active).length;

  return (
    <Page>
      <Header>
        <Title>User Management</Title>
      </Header>

      <Stats>
        <Stat><span>{users.length}</span> Total Users</Stat>
        <Stat><span>{activeCount}</span> Active</Stat>
        <Stat><span>{adminCount}</span> Admins</Stat>
      </Stats>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <p style={{ color: 'var(--text-light)' }}>Loading…</p>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Active</Th>
                <Th>Admin</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = u.email === currentUser?.email;
                return (
                  <tr key={u.id}>
                    <Td style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>{u.id}</Td>
                    <Td style={{ fontWeight: 500 }}>
                      {u.email}
                      {isSelf && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--primary-teal)' }}>(you)</span>}
                    </Td>
                    <Td><AdminBadge admin={u.is_admin}>{u.is_admin ? 'Admin' : 'User'}</AdminBadge></Td>
                    <Td><Badge active={u.is_active}>{u.is_active ? 'Active' : 'Inactive'}</Badge></Td>
                    <Td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </Td>
                    <Td>
                      <Toggle
                        on={u.is_active}
                        disabled={isSelf}
                        onClick={() => !isSelf && handleToggle(u.id, 'is_active', u.is_active)}
                      />
                    </Td>
                    <Td>
                      <Toggle
                        on={u.is_admin}
                        disabled={isSelf}
                        onClick={() => !isSelf && handleToggle(u.id, 'is_admin', u.is_admin)}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Page>
  );
}
