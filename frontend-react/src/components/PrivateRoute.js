import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Optional: check token expiration (if exp exists)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      // Token expired
      localStorage.removeItem('token');
      return <Navigate to="/signin" replace />;
    }

    // Authorized, render children components
    return children;
  } catch (error) {
    // Invalid token or decode failed
    localStorage.removeItem('token');
    return <Navigate to="/signin" replace />;
  }
}

export default PrivateRoute;
