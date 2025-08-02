import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages the global authentication state (isAuthenticated, userRole, userId, username, userPhotoUrl).
 * Provides functions to log in and log out.
 * Reads initial state from localStorage and updates it on changes.
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);

  // Effect to read initial authentication state from localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedUserPhotoUrl = localStorage.getItem('userPhotoUrl');

    if (token) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      setUserId(storedUserId);
      setUsername(storedUsername);
      setUserPhotoUrl(storedUserPhotoUrl);
    }
  }, []);

  /**
   * Logs in a user by setting authentication details in state and localStorage.
   * @param {string} token - The JWT token.
   * @param {string} role - The user's role (e.g., 'ADMIN', 'USER').
   * @param {string} id - The user's ID.
   * @param {string} name - The user's username.
   * @param {string} photoUrl - The user's profile picture URL.
   */
  const login = (token, role, id, name, photoUrl) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', id);
    localStorage.setItem('username', name);
    localStorage.setItem('userPhotoUrl', photoUrl || ''); // Store photo URL, or empty string if not provided

    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
    setUsername(name);
    setUserPhotoUrl(photoUrl);
  };

  /**
   * Logs out the current user by clearing state and localStorage.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userPhotoUrl');

    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUsername(null);
    setUserPhotoUrl(null);
  };

  // The value provided to consumers of the context
  const authContextValue = {
    isAuthenticated,
    userRole,
    userId,
    username,
    userPhotoUrl,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily consume the AuthContext.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
