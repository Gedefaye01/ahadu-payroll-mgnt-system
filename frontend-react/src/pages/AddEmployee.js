import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * AddEmployee Component
 * Allows administrators to add, edit, or delete employee records.
 * It interacts with the backend API for CRUD operations on employee (User) data.
 */
function AddEmployee() {
  // State for the new/edited employee form inputs
  const [employeeForm, setEmployeeForm] = useState({
    username: '',
    email: '',
    password: '',
    roles: ['USER'],
    employeeStatus: 'Active'
  });
  // State for the list of employees fetched from the API
  const [employees, setEmployees] = useState([]);
  // State for tracking which employee is currently being edited (null if adding new)
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW STATES for Password Reset Modal
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [currentEmployeeForReset, setCurrentEmployeeForReset] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordResetError, setPasswordResetError] = useState('');


  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Get JWT token from localStorage for authenticated requests
  const token = localStorage.getItem('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  /**
   * Fetches the list of employees from the backend API.
   * Memoized with useCallback to prevent unnecessary re-creations.
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees. Please try again.");
      toast.error("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /**
   * Handles changes to form input fields.
   * Updates the `employeeForm` state.
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "roles") {
      setEmployeeForm(prev => ({ ...prev, [name]: [value] }));
    } else {
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handles the submission of the employee form (either adding a new employee or updating an existing one).
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeForm.username || !employeeForm.email || (editingId === null && !employeeForm.password)) {
      toast.error("Username, email, and password (for new employees) are required.");
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${API_BASE_URL}/api/employees/${editingId}`
      : `${API_BASE_URL}/api/employees`;

    const payload = { ...employeeForm };
    if (editingId && !payload.password) {
      delete payload.password;
    } else if (editingId && payload.password) {
      console.warn("Admin is updating password for existing user. Ensure this is intended behavior.");
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingId ? 'update' : 'add'} employee.`);
      }

      toast.success(`Employee ${editingId ? 'updated' : 'added'} successfully!`);
      setEmployeeForm({ username: '', email: '', password: '', roles: ['USER'], employeeStatus: 'Active' });
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      console.error(`Error ${editingId ? 'updating' : 'add'} employee:`, err);
      toast.error(err.message || `Failed to ${editingId ? 'update' : 'add'} employee.`);
    }
  };

  /**
   * Handles deleting an employee from the list.
   * @param {string} id - The ID of the employee to delete.
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete employee.");
      }

      toast.info('Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(err.message || "Failed to delete employee.");
    }
  };

  /**
   * Opens the password reset modal for a specific employee.
   * @param {Object} employee - The employee object for whom to reset the password.
   */
  const openPasswordResetModal = (employee) => {
    setCurrentEmployeeForReset(employee);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordResetError('');
    setShowPasswordResetModal(true);
  };

  /**
   * Handles the submission of the password reset form in the modal.
   */
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setPasswordResetError('');

    if (!newPassword || !confirmNewPassword) {
      setPasswordResetError("Both password fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordResetError("New password and confirmation do not match.");
      return;
    }
    // Basic client-side length check, backend will do full policy validation
    if (newPassword.length < 6) { // Assuming a minimum of 6 for basic check
        setPasswordResetError("Password must be at least 6 characters long.");
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${currentEmployeeForReset.id}/reset-password`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ newPassword: newPassword }) // Send the new password in the body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }

      toast.success(`Password for ${currentEmployeeForReset.username} reset successfully!`);
      setShowPasswordResetModal(false); // Close modal on success
      setCurrentEmployeeForReset(null);
    } catch (err) {
      console.error("Error resetting password:", err);
      setPasswordResetError(err.message || "Failed to reset password.");
      toast.error(err.message || "Failed to reset password.");
    }
  };


  /**
   * Handles initiating the edit process for an employee.
   * Pre-fills the form with the selected employee's data.
   * @param {Object} employee - The employee object to edit.
   */
  const handleEdit = (employee) => {
    setEmployeeForm({
      username: employee.username,
      email: employee.email,
      password: '', // Always clear password when editing to prevent accidental changes
      roles: employee.roles,
      employeeStatus: employee.employeeStatus
    });
    setEditingId(employee.id);
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading employees...</p>
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
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Manage Employees</h2>

      {/* Employee Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={employeeForm.username}
              onChange={handleChange}
              placeholder="Employee Username"
              required
            />
          </div>
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={employeeForm.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              required
            />
          </div>
          {/* Password Input (only required for new employees) */}
          <div className="form-group">
            <label htmlFor="password">Password {editingId ? '(Leave blank to keep current)' : '*'}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={employeeForm.password}
              onChange={handleChange}
              placeholder={editingId ? 'Leave blank to keep current' : 'Set initial password'}
              required={editingId === null}
            />
          </div>
          {/* Role Select */}
          <div className="form-group">
            <label htmlFor="roles">Role</label>
            <select
              id="roles"
              name="roles"
              value={employeeForm.roles[0] || 'USER'}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {/* Status Select */}
          <div className="form-group">
            <label htmlFor="employeeStatus">Status</label>
            <select
              id="employeeStatus"
              name="employeeStatus"
              value={employeeForm.employeeStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          {editingId ? 'Update Employee' : 'Add Employee'}
        </button>
        {/* Cancel Edit Button (only visible when editing) */}
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setEmployeeForm({ username: '', email: '', password: '', roles: ['USER'], employeeStatus: 'Active' });
            }}
            className="btn btn-secondary w-full mt-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Employee List Table */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Employees</h3>
      {employees.length === 0 ? (
        <p className="text-center text-gray-500">No employees added yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role(s)</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.username}</td>
                  <td>{employee.email}</td>
                  <td>{employee.roles ? employee.roles.join(', ') : 'N/A'}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.employeeStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.employeeStatus}
                    </span>
                  </td>
                  {/* Applied direct Tailwind classes for styling the action buttons */}
                  <td className="table-actions text-center" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="bg-primary-color text-white px-3 py-1.5 rounded-md font-semibold hover:bg-dark-primary text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="bg-primary-color text-white px-3 py-1.5 rounded-md font-semibold hover:bg-dark-primary text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => openPasswordResetModal(employee)}
                      className="bg-primary-color text-white px-3 py-1.5 rounded-md font-semibold hover:bg-dark-primary text-xs"
                    >
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && currentEmployeeForReset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password for {currentEmployeeForReset.username}</h3>
            <form onSubmit={handlePasswordResetSubmit}>
              <div className="form-group mb-4">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group mb-6">
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {passwordResetError && (
                <p className="text-red-500 text-sm text-center mb-4">{passwordResetError}</p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordResetModal(false)}
                  className="btn btn-secondary" // Uses btn-secondary
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary" // Uses btn-primary
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddEmployee;
