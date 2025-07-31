import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Ensure react-toastify is installed and configured

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(false);
  // Removed successMessage and errorMessage states as toast will handle messages
  // const [successMessage, setSuccessMessage] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // No need to clear messages here, toast handles its own display
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('New passwords do not match.'); // Use toast for error
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // Adjust based on your storage
      const response = await fetch(
        `${API_BASE_URL}/api/users/change-password`, // Use fetch and API_BASE_URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password.');
      }

      toast.success('Password changed successfully.'); // Use toast for success
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(
        error.message || 'Failed to change password.' // Use error.message directly
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10 mb-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Change Password</h2> {/* Updated styling */}

      <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg bg-gray-50"> {/* Applied form-container like styling */}
        <div className="form-group">
          <label htmlFor="oldPassword">Current Password</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" // Applied form input styling
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" // Applied form input styling
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" // Applied form input styling
          />
        </div>

        {/* Removed direct message display, toast handles it */}
        {/* {errorMessage && <p className="error-text">{errorMessage}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>} */}

        <button
          type="submit"
          className="btn btn-primary w-full" // Applied btn btn-primary classes for consistent styling
          disabled={loading}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
