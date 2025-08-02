import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Auth Context
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages the global authentication state (isAuthenticated, userRole, userId, username, userPhotoUrl).
 * Provides functions to log in and log out.
 * Initializes state directly from localStorage for immediate availability on refresh.
 */
export const AuthProvider = ({ children }) => {
  // Initialize state directly from localStorage
  const initialToken = localStorage.getItem('token');
  const initialRole = localStorage.getItem('userRole');
  const initialUserId = localStorage.getItem('userId');
  const initialUsername = localStorage.getItem('username');
  const initialUserPhotoUrl = localStorage.getItem('userPhotoUrl');

  const [isAuthenticated, setIsAuthenticated] = useState(!!initialToken);
  const [userRole, setUserRole] = useState(initialRole);
  const [userId, setUserId] = useState(initialUserId);
  const [username, setUsername] = useState(initialUsername);
  const [userPhotoUrl, setUserPhotoUrl] = useState(initialUserPhotoUrl);

  // This useEffect handles 'storage' events from other tabs/windows.
  // The initial state is already set during useState initialization.
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      const id = localStorage.getItem('userId');
      const name = localStorage.getItem('username');
      const photoUrl = localStorage.getItem('userPhotoUrl');

      // Only update if there's an actual change to prevent unnecessary re-renders
      if (
        !!token !== isAuthenticated ||
        role !== userRole ||
        id !== userId ||
        name !== username ||
        photoUrl !== userPhotoUrl
      ) {
        setIsAuthenticated(!!token);
        setUserRole(role);
        setUserId(id);
        setUsername(name);
        setUserPhotoUrl(photoUrl);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, userRole, userId, username, userPhotoUrl]);

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
    localStorage.setItem('userPhotoUrl', photoUrl || '');

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
