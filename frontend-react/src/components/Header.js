import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Header Component
 * Displays the application's header with navigation links.
 * Dynamically adjusts links based on user authentication status and role (Admin/User).
 * Removes dropdown menus and provides direct links to relevant pages when logged in.
 */
function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Effect to check authentication status and user role from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(!!token); // Set isAuthenticated based on token presence
      setUserRole(role); // Set userRole
    };

    // Initial check
    checkAuth();

    // Set up a storage event listener to react to changes in other tabs/windows
    // or direct localStorage modifications (e.g., after login/logout)
    window.addEventListener('storage', checkAuth);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  /**
   * Handles the logout action.
   * Clears authentication data from localStorage and redirects to the sign-in page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId'); // Also remove userId if stored
    setIsAuthenticated(false);
    setUserRole(null);
    toast.info("You have been logged out.");
    navigate('/signin'); // Redirect to sign-in page
  };

  // Determine the dashboard path based on user role
  const dashboardPath = userRole === 'ADMIN' ? '/admin-dashboard' : '/employee-profile';

  return (
    <header className="app-header">
      <div className="header-logo">
        {/* Link logo to home or dashboard based on login status */}
        <Link to={isAuthenticated ? dashboardPath : '/'}>
          <img src="/logo1.jpg" alt="Ahadu Bank Logo" /> {/* Ensure logo is in public folder */}
        </Link>
      </div>
      <div className="header-nav">
        <nav>
          {isAuthenticated ? (
            <>
              {/* Links for authenticated users */}
              <Link to={dashboardPath}>Dashboard</Link>
              <Link to="/company-announcements">Announcements</Link>
              <Link to="/change-password">Change Password</Link>
              {/* Logout button */}
              <button onClick={handleLogout} className="btn btn-secondary ml-4">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Links for unauthenticated users */}
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/signin" className="btn btn-primary">Sign In</Link>
              <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
