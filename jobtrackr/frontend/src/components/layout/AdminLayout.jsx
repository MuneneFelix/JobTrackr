import { Outlet, NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: var(--sidebar-width);
  background: var(--white);
  height: 100vh;
  position: fixed;
  padding: 1.5rem 1rem;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const SidebarLogo = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.25rem;
  padding: 0 0.5rem;
`;

const SidebarSub = styled.div`
  font-size: 0.7rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 0.5rem;
  margin-bottom: 1.5rem;
`;

const NavSection = styled.div`
  margin-bottom: 0.5rem;
`;

const NavLabel = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-light);
  padding: 0 0.75rem;
  margin-bottom: 0.25rem;
  margin-top: 1rem;
`;

const menuItem = `
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  color: var(--text-dark);
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 0.15rem;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: var(--bg-light);
    color: var(--primary-teal);
  }
`;

const MenuItem = styled(NavLink)`
  ${menuItem}
  &.active {
    background: var(--bg-light);
    color: var(--primary-teal);
    font-weight: 600;
  }
`;

const BackLink = styled(Link)`
  ${menuItem}
  margin-top: auto;
  color: var(--text-light);
  font-size: 0.85rem;
  &:hover { color: var(--primary-teal); }
`;

const MainContent = styled.main`
  margin-left: var(--sidebar-width);
  flex: 1;
  padding: 2rem;
  background: var(--bg-light);
  min-height: 100vh;
`;

function AdminLayout() {
  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarLogo>JobTrackr</SidebarLogo>
        <SidebarSub>Admin Panel</SidebarSub>

        <NavSection>
          <NavLabel>Overview</NavLabel>
          <MenuItem to="/admin" end>📊 Dashboard</MenuItem>
          <MenuItem to="/admin/analytics">📈 Analytics</MenuItem>
        </NavSection>

        <NavSection>
          <NavLabel>Manage</NavLabel>
          <MenuItem to="/admin/users">👥 Users</MenuItem>
          <MenuItem to="/admin/default-sources">🌐 Default Sources</MenuItem>
          <MenuItem to="/admin/urls">🔗 All Sources</MenuItem>
          <MenuItem to="/admin/jobs">💼 All Jobs</MenuItem>
        </NavSection>

        <NavSection>
          <NavLabel>System</NavLabel>
          <MenuItem to="/admin/settings">🔐 Audit Log</MenuItem>
        </NavSection>

        <BackLink to="/dashboard">← Back to App</BackLink>
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}

export default AdminLayout;
