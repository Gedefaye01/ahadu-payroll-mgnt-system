import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * ChangePassword Component
 * Allows an authenticated user to change their password.
 */
function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/my-profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Password changed successfully! Please log in with your new password.");
        setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        const data = await response.json();
        toast.error(data || "Failed to change password.");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10 mb-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Change Password</h2>

      <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <div className="form-group mb-4">
          <label htmlFor="oldPassword" className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="form-group mb-6">
          <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out transform hover:scale-105"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
