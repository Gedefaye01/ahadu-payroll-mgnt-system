import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * EmployeeProfileUpdate Component
 * Allows employees to update their personal profile information.
 * It fetches the current user's profile data from the backend,
 * provides a form for updates, and sends changes back to the backend.
 */
function EmployeeProfileUpdate() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <--- ADD THIS LINE

  const token = localStorage.getItem('token');

  /**
   * Fetches the current user's profile data from the backend API.
   * Memoized with useCallback.
   */
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/my-profile`, { // <--- MODIFIED
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProfile({
        fullName: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
      });
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load your profile. Please try again.");
      toast.error("Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]); // Add API_BASE_URL to dependencies

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  /**
   * Handles changes to form input fields.
   * Updates the corresponding state property based on the input's name and value.
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the form submission.
   * Sends the updated profile data to the backend.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const payload = {
      username: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
    };

    try {
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/my-profile`, { // <--- MODIFIED
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      toast.success('Profile updated successfully!');
      fetchUserProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center mt-10 mb-10">
        <p className="text-gray-600">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center mt-10 mb-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-10 mb-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Update Personal Profile</h2>

      <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="form-group">
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <textarea
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              rows="2"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Emergency Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label htmlFor="emergencyContactName" className="block text-gray-700 text-sm font-bold mb-2">Contact Name</label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={profile.emergencyContactName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="form-group">
            <label htmlFor="emergencyContactPhone" className="block text-gray-700 text-sm font-bold mb-2">Contact Phone</label>
            <input
              type="tel"
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              value={profile.emergencyContactPhone}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-200 ease-in-out transform hover:scale-105"
          disabled={loading}
        >
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EmployeeProfileUpdate;