import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import useAuth hook

/**
 * ProtectedRoute Component
 * Controls access to routes based on user authentication status and roles.
 * It now consumes the global authentication state from AuthContext.
 */
const ProtectedRoute = ({ allowedRoles, redirectPath = '/signin' }) => {
  // Use the useAuth hook to get the current authentication state and user role
  const { isAuthenticated, userRole } = useAuth();

  // If not authenticated, redirect to the sign-in page
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If allowedRoles are specified, check if the user's role is included
  if (allowedRoles && allowedRoles.length > 0) {
    // If user has no role or their role is not in the allowedRoles list, redirect
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
