import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: var(--white);
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: var(--primary-blue);
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: none;
    
    &.active {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 70px;
      left: 0;
      right: 0;
      background: var(--white);
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: ${slideDown} 0.3s ease forwards;
    }
  }
`;

const NavLink = styled(Link)`
  color: var(--text-dark);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-light);
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 1rem;
    animation: ${fadeIn} 0.3s ease forwards;
    animation-delay: ${props => props.index * 0.1}s;
    opacity: 0;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const UserName = styled.span`
  color: var(--text-dark);
  font-weight: 500;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--error);
  color: var(--white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-dark);
  transition: transform 0.3s ease;

  &.active {
    transform: rotate(180deg);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const ProfileButton = styled(Link)`
  padding: 0.5rem 1rem;
  background: var(--primary-teal);
  color: var(--white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const AdminButton = styled(Link)`
  padding: 0.5rem 1rem;
  background: var(--primary-blue);
  color: var(--white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log('Current user:', user); // Temporary debug log

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <LayoutContainer>
      <Header>
        <Nav>
          <Logo to="/">JobTrackr</Logo>
          <MenuButton 
            onClick={toggleMenu}
            className={isMenuOpen ? 'active' : ''}
          >
            {isMenuOpen ? '✕' : '☰'}
          </MenuButton>
          <NavLinks className={isMenuOpen ? 'active' : ''}>
            {user ? (
              <>
                <NavLink to="/dashboard" index={0}>Dashboard</NavLink>
                <NavLink to="/urls" index={1}>URLs</NavLink>
                <NavLink to="/jobs" index={2}>Jobs</NavLink>
                <UserInfo>
                  <ProfileButton 
                    to="/profile" 
                    index={3}
                  >
                    Profile
                  </ProfileButton>
                  {user.role === 'admin' && (
                    <AdminButton 
                      to="/admin"
                      index={4}
                    >
                      Admin
                    </AdminButton>
                  )}
                  <LogoutButton 
                    index={5} 
                    onClick={handleLogout}
                  >
                    Logout
                  </LogoutButton>
                </UserInfo>
              </>
            ) : (
              <>
                <NavLink to="/login" index={0}>Login</NavLink>
                <NavLink to="/signup" index={1}>Sign Up</NavLink>
              </>
            )}
          </NavLinks>
        </Nav>
      </Header>
      <Outlet />
    </LayoutContainer>
  );
}

export default MainLayout; 