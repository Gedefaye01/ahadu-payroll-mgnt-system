// ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const getUserRole = () => {
  const role = localStorage.getItem('userRole');
  console.log("DEBUG ProtectedRoute: userRole from localStorage:", role); // ADDED DEBUG LOG
  return role;
};

const ProtectedRoute = ({ allowedRoles, redirectPath = '/signin' }) => {
  const userRole = getUserRole();
  const isAuthenticated = !!localStorage.getItem('token');
  console.log("DEBUG ProtectedRoute: isAuthenticated:", isAuthenticated); // ADDED DEBUG LOG
  console.log("DEBUG ProtectedRoute: allowedRoles:", allowedRoles); // ADDED DEBUG LOG

  if (!isAuthenticated) {
    console.log("DEBUG ProtectedRoute: Not authenticated. Redirecting to:", redirectPath); // ADDED DEBUG LOG
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log("DEBUG ProtectedRoute: Not authorized. userRole:", userRole, "allowedRoles:", allowedRoles, "Redirecting to:", redirectPath); // ADDED DEBUG LOG
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log("DEBUG ProtectedRoute: Authenticated and Authorized. Rendering Outlet."); // ADDED DEBUG LOG
  return <Outlet />;
};

export default ProtectedRoute;
