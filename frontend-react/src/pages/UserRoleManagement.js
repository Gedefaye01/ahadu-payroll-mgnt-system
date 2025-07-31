import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/Card'; // Assuming you have a Card component

/**
 * UserRoleManagement Component
 * Allows administrators to view all users and update their roles.
 * It fetches user data from the backend and sends role updates.
 */
function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableRoles, setAvailableRoles] = useState(['USER', 'ADMIN']); // Hardcoded for now, but could fetch from backend

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  /**
   * Fetches all users from the backend API.
   * Memoized with useCallback.
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Changed endpoint to match UserRoleController: GET /api/user-roles
      const response = await fetch(`${API_BASE_URL}/api/user-roles`, {
        headers: authHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data); // Assuming data is an array of user objects
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load user list. Please try again.");
      toast.error("Failed to load user list.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handles changing a user's role.
   * Sends a PUT request to the backend to update the user's roles.
   * @param {string} userId - The ID of the user whose roles are being updated.
   * @param {string} newRole - The new single role to assign (e.g., 'USER' or 'ADMIN').
   */
  const handleRoleChange = async (userId, newRole) => {
    // In a real application, you might want a confirmation modal here
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setLoading(true); // Indicate loading while updating
    try {
      // Construct the payload as expected by UserRoleUpdateRequest DTO
      const payload = {
        userId: userId,
        roles: [newRole] // Send as an array, even if it's a single role
      };

      // Changed endpoint to match UserRoleController: PUT /api/user-roles/update
      const response = await fetch(`${API_BASE_URL}/api/user-roles/update`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update role for user ${userId}.`);
      }

      toast.success(`Role updated successfully for user ${userId}!`);
      fetchUsers(); // Re-fetch users to update the table with new roles
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error(err.message || "Failed to update user role.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading user roles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <h1 className="page-header">User Role Management</h1>
      <div className="table-container">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No users found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Current Roles</th>
                <th>Change Role To</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.roles && user.roles.length > 0
                      ? user.roles.join(', ')
                      : 'No Roles'}
                  </td>
                  <td>
                    <select
                      value={user.roles && user.roles.length > 0 ? user.roles[0] : ''} // Display first role, or empty
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="form-group select" // Apply existing form styles
                    >
                      {/* Option to clear role or select a default, if applicable */}
                      <option value="">Select Role</option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export default UserRoleManagement;
