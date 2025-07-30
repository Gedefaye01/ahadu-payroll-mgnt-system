import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Camera } from 'lucide-react'; // For the camera icon on the photo upload

/**
 * EmployeeProfileUpdate Component
 * Allows employees to update their personal profile information and upload a profile photo.
 */
function EmployeeProfileUpdate() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    profilePictureUrl: '', // New field for profile picture URL
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
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

      const response = await fetch(`${API_BASE_URL}/api/my-profile`, {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProfile({
        fullName: data.username || '', // Assuming 'username' from backend corresponds to 'fullName'
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        profilePictureUrl: data.profilePictureUrl || '', // Set the existing URL
      });
      setFilePreview(data.profilePictureUrl || null); // Set preview to existing URL
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load your profile. Please try again.");
      toast.error("Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  /**
   * Handles changes to form input fields.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles file selection for profile picture.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file)); // Create a local URL for preview
    } else {
      setSelectedFile(null);
      setFilePreview(profile.profilePictureUrl || null); // Revert to existing or clear
    }
  };

  /**
   * Uploads the selected profile picture.
   * This is a separate function as file uploads often require a different Content-Type.
   */
  const uploadProfilePicture = async () => {
    if (!selectedFile) return null; // No file to upload

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile); // 'profilePicture' is the field name your backend expects

      const response = await fetch(`${API_BASE_URL}/api/my-profile/upload-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT set 'Content-Type': 'multipart/form-data' here. The browser does it automatically with FormData.
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile picture.');
      }

      const result = await response.json();
      toast.success('Profile picture uploaded successfully!');
      // Update the profile with the new URL received from the backend
      setProfile(prev => ({ ...prev, profilePictureUrl: result.profilePictureUrl }));
      setFilePreview(result.profilePictureUrl); // Update preview with actual URL
      setSelectedFile(null); // Clear selected file after successful upload
      return result.profilePictureUrl; // Return the new URL
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      toast.error(err.message || "Failed to upload profile picture.");
      setError("Failed to upload profile picture.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the form submission for profile data.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // First, handle photo upload if a new file is selected
    if (selectedFile) {
      const uploadedUrl = await uploadProfilePicture();
      if (!uploadedUrl) {
        // If photo upload failed, stop the process
        setLoading(false);
        return;
      }
      // If photo uploaded successfully, the profile state is already updated.
    }

    // Now, send the rest of the profile data (excluding profilePictureUrl from payload,
    // as it's managed by the separate upload or already in profile state)
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
      // Do NOT send profilePictureUrl here if it's updated via a separate endpoint.
      // Or, if your backend PUT endpoint can handle it, send the updated URL.
      // For this example, we assume it's handled by the separate upload.
      // If your PUT endpoint needs it: profilePictureUrl: profile.profilePictureUrl
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/my-profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile details.');
      }

      toast.success('Profile details updated successfully!');
      fetchUserProfile(); // Re-fetch to ensure latest data
    } catch (err) {
      console.error("Error updating profile details:", err);
      toast.error(err.message || "Failed to update profile details.");
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
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-200 flex items-center justify-center text-gray-500 relative cursor-pointer group"
            onClick={() => fileInputRef.current.click()}
          >
            {filePreview ? (
              <img src={filePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-center">No Photo</span>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" // Hide the default file input
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-200"
          >
            Upload Photo
          </button>
        </div>


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