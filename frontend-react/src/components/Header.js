import React from 'react'; // Removed useState, useEffect, useRef as they are no longer needed for dropdowns
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

/**
 * Header Component
 * Displays the application's header with navigation links.
 * Dynamically adjusts links based on user authentication status and role (Admin/User)
 * obtained from AuthContext.
 */
function Header() {
  const navigate = useNavigate();
  // Use the useAuth hook to get authentication state and logout function
  const { isAuthenticated, userRole, logout } = useAuth(); // Destructure isAuthenticated, userRole, and logout from useAuth

  /**
   * Handles the logout action.
   * Calls the logout function from AuthContext and redirects to the sign-in page.
   */
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext to clear state and localStorage
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
          <img src="/Ahadu-logo.PNG" alt="Ahadu Bank Logo" /> {/* Ensure logo is in public folder */}
        </Link>
      </div>
      <div className="header-nav">
        <nav>
          {isAuthenticated ? (
            <>
              {/* Links for authenticated users */}
              <Link to={dashboardPath}>Dashboard</Link> {/* This is the primary "home" for logged-in users */}
              <Link to="/about">About Us</Link> {/* Keep About Us for logged-in users */}
              <Link to="/contact">Contact Us</Link> {/* Keep Contact Us for logged-in users */}
              {/* Logout button */}
              <button onClick={handleLogout} className="btn btn-secondary ml-4">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Links for unauthenticated users */}
              <Link to="/">Home</Link> {/* Public Home link */}
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
