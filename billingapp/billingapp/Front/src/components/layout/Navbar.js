import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { FaCalculator, FaUser, FaSignOutAlt, FaBars, FaTimes, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/#about');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Navbar 
      expand="lg" 
      className="navbar-custom py-3"
      fixed="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="navbar-brand-custom">
          <FaCalculator className="me-2" />
          Billing System
        </Navbar.Brand>

        {/* Mobile Menu Button */}
        <Button
          variant="link"
          className="d-lg-none p-0 border-0"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </Button>

        <Navbar.Collapse 
          id="basic-navbar-nav" 
          className={`${isMenuOpen ? 'show' : ''}`}
        >
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/dashboard"
              className={`nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Dashboard
            </Nav.Link>
            
            <Nav.Link
              as={Link}
              to="/bills"
              className={`nav-link-custom ${isActive('/bills') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Bills
            </Nav.Link>
            
            <Nav.Link
              as={Link}
              to="/items"
              className={`nav-link-custom ${isActive('/items') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Items
            </Nav.Link>
            
            <Nav.Link
              as={Link}
              to="/help"
              className={`nav-link-custom ${isActive('/help') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Help
            </Nav.Link>

            {/* Admin Menu */}
            {isAdmin() && (
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link} className="nav-link-custom">
                  Admin
                </Dropdown.Toggle>
                <Dropdown.Menu className="border-radius-custom shadow-custom">
                  <Dropdown.Item 
                    as={Link} 
                    to="/admin/dashboard"
                    onClick={closeMenu}
                  >
                    Admin Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item 
                    as={Link} 
                    to="/admin/users"
                    onClick={closeMenu}
                  >
                    Manage Users
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    as={Link} 
                    to="/help"
                    onClick={() => {
                      closeMenu();
                      // Scroll to User Guide section
                      setTimeout(() => {
                        const userGuideSection = document.getElementById('user-guide-section');
                        if (userGuideSection) {
                          userGuideSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    User Guide
                  </Dropdown.Item>
                  <Dropdown.Item 
                    as={Link} 
                    to="/help"
                    onClick={() => {
                      closeMenu();
                      // Scroll to Admin Guide section
                      setTimeout(() => {
                        const adminGuideSection = document.getElementById('admin-guide-section');
                        if (adminGuideSection) {
                          adminGuideSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    Admin Guide
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>

          {/* User Menu */}
          <Nav className="ms-auto">
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="nav-link-custom d-flex align-items-center">
                <FaUser className="me-2" />
                {user?.fullName || user?.username}
                {isAdmin() && (
                  <span className="badge badge-admin ms-2">ADMIN</span>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-radius-custom shadow-custom">
                <Dropdown.Item 
                  as={Link} 
                  to="/profile"
                  onClick={closeMenu}
                >
                  <FaUser className="me-2" />
                  My Profile
                </Dropdown.Item>
                {isAdmin() && (
                  <Dropdown.Item 
                    as={Link} 
                    to="/admin/profile"
                    onClick={closeMenu}
                  >
                    <FaUserShield className="me-2" />
                    Admin Profile
                  </Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={handleLogout}
                  className="text-danger"
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
