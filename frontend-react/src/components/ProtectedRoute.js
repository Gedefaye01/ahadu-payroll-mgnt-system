import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Corrected import path

/**
 * ProtectedRoute Component
 * Controls access to routes based on user authentication status and roles.
 * It now consistently consumes the global authentication state from AuthContext,
 * and waits for the authentication context to finish loading.
 */
const ProtectedRoute = ({ allowedRoles, redirectPath = '/signin' }) => {
  // Use the useAuth hook to get the current authentication state, user role, AND loading status
  const { isAuthenticated, userRole, loading } = useAuth(); // IMPORTANT: Destructure 'loading' here

  // If authentication is still loading, render a loading indicator (or null)
  // This prevents redirects before the auth state is fully determined on refresh.
  if (loading) {
    return <div>Loading authentication...</div>; // You can replace this with a spinner or null
  }

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
