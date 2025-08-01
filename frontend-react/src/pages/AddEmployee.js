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

  // Define the API_BASE_URL using the environment variable
  // This will be 'http://localhost:8080' in development (from your local .env)
  // and 'https://ahadu-payroll-mgnt-system.onrender.com' in production (from Render's env)
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <--- ADD THIS LINE

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
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/employees`, { // <--- MODIFIED
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
  }, [API_BASE_URL, token]); // Add API_BASE_URL to dependencies and remove toast (not a dependency)

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
    // Special handling for roles: convert string value to an array for the backend Set<String>
    if (name === "roles") {
      setEmployeeForm(prev => ({ ...prev, [name]: [value] })); // Wrap single role in array
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

    // Basic validation
    if (!employeeForm.username || !employeeForm.email || (editingId === null && !employeeForm.password)) {
      toast.error("Username, email, and password (for new employees) are required.");
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    // Use API_BASE_URL instead of hardcoded localhost
    const url = editingId
      ? `${API_BASE_URL}/api/employees/${editingId}` // <--- MODIFIED
      : `${API_BASE_URL}/api/employees`;            // <--- MODIFIED

    // Prepare payload: exclude password for PUT requests unless it's explicitly a password reset
    const payload = { ...employeeForm };
    if (editingId && !payload.password) {
      delete payload.password; // Don't send empty password on update
    } else if (editingId && payload.password) {
      // If password is provided during edit, it means admin wants to reset it
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
      // Clear form and refetch employees
      setEmployeeForm({ username: '', email: '', password: '', roles: ['USER'], employeeStatus: 'Active' });
      setEditingId(null); // Reset editing mode
      fetchEmployees(); // Refetch updated list
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
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, { // <--- MODIFIED
        method: 'DELETE',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete employee.");
      }

      toast.info('Employee deleted successfully!');
      fetchEmployees(); // Refetch updated list
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error(err.message || "Failed to delete employee.");
    }
  };

  /**
   * Handles initiating a password reset for a specific employee.
   * @param {string} employeeId - The ID of the employee whose password needs to be reset.
   */
  const handlePasswordReset = async (employeeId) => {
    if (!window.confirm('Are you sure you want to reset this employee\'s password? A new password will be generated.')) {
      return;
    }

    try {
      // Assuming a backend endpoint for password reset exists
      const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}/reset-password`, {
        method: 'PUT', // Or POST, depending on your backend design
        headers: authHeaders,
        // You might send a body here if your backend requires specific data for reset,
        // but for a simple admin-initiated reset, an empty body or a flag might suffice.
        // body: JSON.stringify({}) // Example if a body is needed
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }

      // If your backend returns the new password, you can display it here.
      // For security, it's often better to send it via email or a secure channel.
      // For this example, we'll assume a success message.
      toast.success('Employee password reset successfully! (New password generated on backend)');
    } catch (err) {
      console.error("Error resetting password:", err);
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
                  <td className="table-actions text-center">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900 mr-3" // Added mr-3 for spacing
                    >
                      Delete
                    </button>
                    {/* NEW: Password Reset Button */}
                    <button
                      onClick={() => handlePasswordReset(employee.id)}
                      className="btn btn-primary" // Using btn-primary for styling
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AddEmployee;
