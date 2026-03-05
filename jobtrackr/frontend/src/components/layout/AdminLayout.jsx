import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
  padding: 2rem;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
`;

const SidebarLogo = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 2rem;
`;

const SidebarMenu = styled.ul`
  list-style: none;
`;

const MenuItem = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  color: var(--text-dark);
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;

  &:hover, &.active {
    background: var(--bg-light);
    color: var(--primary-teal);
  }
`;

const MainContent = styled.main`
  margin-left: var(--sidebar-width);
  flex: 1;
  padding: 2rem;
`;

function AdminLayout() {
  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarLogo>JobTrackr Admin</SidebarLogo>
        <SidebarMenu>
          <li><MenuItem to="/admin">Dashboard</MenuItem></li>
          <li><MenuItem to="/admin/users">Users</MenuItem></li>
          <li><MenuItem to="/admin/urls">URLs</MenuItem></li>
          <li><MenuItem to="/admin/jobs">Jobs</MenuItem></li>
          <li><MenuItem to="/admin/analytics">Analytics</MenuItem></li>
          <li><MenuItem to="/admin/settings">Settings</MenuItem></li>
        </SidebarMenu>
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}

export default AdminLayout; 