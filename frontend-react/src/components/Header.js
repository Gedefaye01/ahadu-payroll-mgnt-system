import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Header Component
 * Displays the application's header with navigation links.
 * Dynamically adjusts links based on user authentication status and role (Admin/User).
 * Includes dropdown menus for Admin and Employee activities and a logout functionality.
 */
function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false); // State for Admin dropdown visibility
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false); // State for Employee dropdown visibility

  // Refs for dropdown menus to handle clicks outside
  const adminDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  // Define admin dashboard items with their paths
  const adminDashboardItems = [
    { title: 'Manage Employees', path: '/add-employee' },
    { title: 'Manage Payroll', path: '/admin-payroll-management' },
    { title: 'System Settings', path: '/system-settings' },
    { title: 'Generate Reports', path: '/generate-reports' },
    { title: 'User Roles', path: '/user-role-management' },
    { title: 'Attendance & Leave', path: '/attendance-leave-approval' },
    { title: 'Salary Structure', path: '/salary-structure' },
    { title: 'Change Password', path: '/change-password-admin' }, // Added Change Password for Admin
  ];

  // Define employee dashboard items with their paths
  const employeeDashboardItems = [
    { title: 'Payroll Details', path: '/payroll-details' },
    { title: 'Apply Leave', path: '/leave-application' },
    { title: 'Attendance Records', path: '/attendance-record' },
    { title: 'Clock In/Out', path: '/clock-in-out' },
    { title: 'Update Profile', path: '/employee-profile-update' },
    { title: 'Announcements', path: '/company-announcements' },
    { title: 'Change Password', path: '/change-password' }, // Employee Change Password
  ];

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

  // Effect to handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setShowAdminDropdown(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <header className="app-header">
      <div className="header-logo">
        {/* Link logo to home or dashboard based on login status */}
        <Link to={isAuthenticated ? (userRole === 'ADMIN' ? '/admin-dashboard' : '/employee-profile') : '/'}>
          <img src="/footer-logo.png" alt="Ahadu Bank Logo" /> {/* Ensure logo is in public folder */}
        </Link>
      </div>
      <div className="header-nav">
        <nav>
          {/* Always visible links */}
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>

          {/* Conditional links based on authentication and role */}
          {isAuthenticated ? (
            <>
              {/* Admin Activities Dropdown */}
              {userRole === 'ADMIN' && (
                <div className="dropdown" ref={adminDropdownRef}>
                  <button
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className="dropbtn"
                  >
                    Admin Activities
                  </button>
                  {showAdminDropdown && (
                    <div className="dropdown-content">
                      {adminDashboardItems.map((item, index) => (
                        <Link
                          key={`admin-link-${index}`}
                          to={item.path}
                          onClick={() => setShowAdminDropdown(false)} // Close dropdown on link click
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Employee Activities Dropdown */}
              {userRole === 'USER' && (
                <div className="dropdown" ref={employeeDropdownRef}>
                  <button
                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                    className="dropbtn"
                  >
                    Employee Activities
                  </button>
                  {showEmployeeDropdown && (
                    <div className="dropdown-content">
                      {employeeDashboardItems.map((item, index) => (
                        <Link
                          key={`employee-link-${index}`}
                          to={item.path}
                          onClick={() => setShowEmployeeDropdown(false)} // Close dropdown on link click
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Logout button */}
              <button onClick={handleLogout} className="btn btn-secondary ml-4">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Links for unauthenticated users */}
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
