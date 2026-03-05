import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// ── Animations ────────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Shell ─────────────────────────────────────────────────────────────────────

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
`;

// ── Header ────────────────────────────────────────────────────────────────────

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid #e8edf2;
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

// ── Logo ──────────────────────────────────────────────────────────────────────

const Logo = styled(Link)`
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--primary-blue);
  text-decoration: none;
  letter-spacing: -0.02em;
  flex-shrink: 0;

  span { color: var(--primary-teal); }
`;

// ── Desktop nav links ─────────────────────────────────────────────────────────

const DesktopLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 700px) { display: none; }
`;

const NavLink = styled(Link)`
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  color: ${p => p.active ? 'var(--primary-teal)' : 'var(--text-dark)'};
  background: ${p => p.active ? '#edfafa' : 'transparent'};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--bg-light);
    color: var(--primary-teal);
  }
`;

const AdminPill = styled(Link)`
  padding: 0.35rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  background: #ebf4ff;
  color: #2b6cb0;
  transition: background 0.15s;

  &:hover { background: #bee3f8; }
`;

// ── Right side ────────────────────────────────────────────────────────────────

const RightSide = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// ── Avatar dropdown ───────────────────────────────────────────────────────────

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-teal));
  color: var(--white);
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: 0 0 0 3px rgba(44,122,123,0.25);
    transform: scale(1.05);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14);
  border: 1px solid #e8edf2;
  overflow: hidden;
  animation: ${fadeIn} 0.15s ease;
  z-index: 200;
`;

const DropdownTop = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f0f4f8;
`;

const DropEmail = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropRole = styled.div`
  font-size: 0.72rem;
  color: var(--text-light);
  margin-top: 0.15rem;
`;

const DropItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  font-size: 0.875rem;
  color: var(--text-dark);
  text-decoration: none;
  transition: background 0.12s;

  &:hover { background: var(--bg-light); }
`;

const DropButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 0.875rem;
  color: var(--error);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.12s;
  border-top: 1px solid #f0f4f8;

  &:hover { background: #fff5f5; }
`;

// ── Auth links (logged out) ───────────────────────────────────────────────────

const LoginLink = styled(Link)`
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-dark);
  text-decoration: none;
  transition: background 0.15s;

  &:hover { background: var(--bg-light); }
`;

const SignupLink = styled(Link)`
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--primary-teal);
  color: var(--white);
  text-decoration: none;
  transition: background 0.2s;

  &:hover { background: #235f60; }
`;

// ── Mobile hamburger ──────────────────────────────────────────────────────────

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-dark);
  font-size: 1.2rem;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover { background: var(--bg-light); }

  @media (max-width: 700px) { display: flex; }
`;

// ── Mobile drawer ─────────────────────────────────────────────────────────────

const MobileDrawer = styled.div`
  display: none;

  @media (max-width: 700px) {
    display: block;
    background: var(--white);
    border-bottom: 1px solid #e8edf2;
    animation: ${slideDown} 0.2s ease;
  }
`;

const DrawerInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DrawerLink = styled(Link)`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${p => p.active ? 'var(--primary-teal)' : 'var(--text-dark)'};
  background: ${p => p.active ? '#edfafa' : 'transparent'};
  text-decoration: none;
  transition: background 0.15s;

  &:hover { background: var(--bg-light); }
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: #f0f4f8;
  margin: 0.4rem 0;
`;

const DrawerUserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
`;

const DrawerAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-teal));
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DrawerEmail = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DrawerLogout = styled.button`
  margin: 0 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fff5f5;
  border: none;
  color: var(--error);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover { background: #fed7d7; }
`;

// ── Component ─────────────────────────────────────────────────────────────────

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const initial = user?.email?.[0]?.toUpperCase() || '?';
  const isAdmin = user?.is_admin || user?.role === 'admin';
  const isActive = (path) => location.pathname === path ? 1 : 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Shell>
      <Header>
        <Nav>
          <Logo to="/">Job<span>Trackr</span></Logo>

          {/* Desktop nav */}
          {user && (
            <DesktopLinks>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink to="/urls"      active={isActive('/urls')}>Sources</NavLink>
              <NavLink to="/jobs"      active={isActive('/jobs')}>Jobs</NavLink>
              {isAdmin && <AdminPill to="/admin">Admin</AdminPill>}
            </DesktopLinks>
          )}

          <RightSide>
            {user ? (
              <>
                {/* Avatar + dropdown */}
                <AvatarWrap ref={dropRef}>
                  <AvatarBtn onClick={() => setDropOpen(o => !o)} title={user.email}>
                    {initial}
                  </AvatarBtn>
                  {dropOpen && (
                    <Dropdown>
                      <DropdownTop>
                        <DropEmail>{user.email}</DropEmail>
                        <DropRole>{isAdmin ? 'Administrator' : 'Member'}</DropRole>
                      </DropdownTop>
                      <DropItem to="/profile" onClick={() => setDropOpen(false)}>
                        👤 Profile
                      </DropItem>
                      {isAdmin && (
                        <DropItem to="/admin" onClick={() => setDropOpen(false)}>
                          ⚙️ Admin panel
                        </DropItem>
                      )}
                      <DropButton onClick={handleLogout}>
                        🚪 Sign out
                      </DropButton>
                    </Dropdown>
                  )}
                </AvatarWrap>

                {/* Mobile hamburger */}
                <HamburgerBtn onClick={() => setMenuOpen(o => !o)}>
                  {menuOpen ? '✕' : '☰'}
                </HamburgerBtn>
              </>
            ) : (
              <>
                <LoginLink to="/login">Sign in</LoginLink>
                <SignupLink to="/signup">Get started</SignupLink>
              </>
            )}
          </RightSide>
        </Nav>

        {/* Mobile drawer */}
        {menuOpen && user && (
          <MobileDrawer>
            <DrawerInner>
              <DrawerUserRow>
                <DrawerAvatar>{initial}</DrawerAvatar>
                <DrawerEmail>{user.email}</DrawerEmail>
              </DrawerUserRow>
              <DrawerDivider />
              <DrawerLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</DrawerLink>
              <DrawerLink to="/urls"      active={isActive('/urls')}>Sources</DrawerLink>
              <DrawerLink to="/jobs"      active={isActive('/jobs')}>Jobs</DrawerLink>
              <DrawerLink to="/profile"   active={isActive('/profile')}>Profile</DrawerLink>
              {isAdmin && <DrawerLink to="/admin" active={isActive('/admin')}>Admin</DrawerLink>}
              <DrawerDivider />
              <DrawerLogout onClick={handleLogout}>Sign out</DrawerLogout>
            </DrawerInner>
          </MobileDrawer>
        )}
      </Header>

      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
}

export default MainLayout;
