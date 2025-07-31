import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * CompanyAnnouncements Component
 * Displays a list of company-wide announcements for employees.
 * For ADMIN users, it also provides functionality to add, edit, and delete announcements.
 * It interacts with the backend API for CRUD operations.
 */
function CompanyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Determine if the current user is an ADMIN based on localStorage
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  // Memoize fetchAnnouncements using useCallback to prevent unnecessary re-creations
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Ensure token is included
      };

      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        headers: authHeaders
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error fetching announcements: ${response.status} - ${response.statusText}`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError("Failed to load announcements. Please try again.");
      toast.error("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]); // Dependencies: API_BASE_URL, token

  /**
   * Handles submission of the add/edit announcement form.
   * Only accessible by ADMINs due to backend authorization.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    const method = editingAnnouncement ? 'PUT' : 'POST';
    const url = editingAnnouncement
      ? `${API_BASE_URL}/api/announcements/${editingAnnouncement.id}`
      : `${API_BASE_URL}/api/announcements`;

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const payload = { title: formTitle, content: formContent };

    // --- DEBUGGING LOGS FOR SUBMIT ---
    console.log("DEBUG: Submitting announcement...");
    console.log("DEBUG: Method:", method);
    console.log("DEBUG: URL:", url);
    console.log("DEBUG: Payload being sent:", JSON.stringify(payload));
    // --- END DEBUGGING LOGS ---

    try {
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to parse error response
        console.error(`HTTP Error during announcement ${method}: ${response.status} - ${response.statusText}`, errorData);
        throw new Error(errorData.message || `Failed to ${editingAnnouncement ? 'update' : 'add'} announcement.`);
      }

      toast.success(`Announcement ${editingAnnouncement ? 'updated' : 'added'} successfully!`);
      setFormTitle('');
      setFormContent('');
      setIsAdding(false);
      setEditingAnnouncement(null);
      fetchAnnouncements(); // Re-fetch announcements to show the latest list
    } catch (err) {
      console.error(`Error ${editingAnnouncement ? 'updating' : 'add'} announcement:`, err);
      toast.error(err.message || `Failed to ${editingAnnouncement ? 'update' : 'add'} announcement.`);
    } finally {
      setLoading(false); // Ensure loading is turned off even on error
    }
  };

  /**
   * Handles initiating the edit process for an announcement.
   * Only visible to ADMINs.
   * @param {Object} announcement The announcement object to edit.
   */
  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormTitle(announcement.title);
    setFormContent(announcement.content);
    setIsAdding(true);
  };

  /**
   * Handles deleting an announcement.
   * Only visible to ADMINs.
   * @param {string} id The ID of the announcement to delete.
   */
  const handleDelete = async (id) => {
    // IMPORTANT: Replace window.confirm with a custom modal for better UX
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`HTTP Error deleting announcement: ${response.status} - ${response.statusText}`, errorData);
        throw new Error(errorData.message || "Failed to delete announcement.");
      }

      toast.success("Announcement deleted successfully!");
      fetchAnnouncements(); // Re-fetch announcements to update the list
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error(err.message || "Failed to delete announcement.");
    }
  };

  // Effect hook to fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center mt-10 mb-10">
        <p className="text-gray-600">Loading announcements...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Company Announcements</h2>

      {/* Admin-only section for adding/editing announcements */}
      {isAdmin && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingAnnouncement(null); // Clear editing state when toggling add form
              setFormTitle('');
              setFormContent('');
            }}
            className="btn btn-primary w-full mb-4"
          >
            {isAdding ? 'Cancel' : 'Add New Announcement'}
          </button>

          {isAdding && (
            <form onSubmit={handleSubmit} className="mt-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h3>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Announcement Title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows="5"
                  placeholder="Announcement content..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">
                {editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Display all announcements (visible to all authenticated users) */}
      {announcements.length === 0 ? (
        <p className="text-center text-gray-500">No announcements available at this time.</p>
      ) : (
        <div className="space-y-6">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{announcement.title}</h3>
              <p className="text-sm text-gray-500 mb-3">
                Published: {new Date(announcement.publishDate).toLocaleDateString()}
                {announcement.authorUsername && ` by ${announcement.authorUsername}`}
              </p>
              <p className="text-gray-700 leading-relaxed">{announcement.content}</p>

              {/* Admin-only action buttons for each announcement */}
              {isAdmin && (
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleEditClick(announcement)}
                    className="btn bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="btn bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyAnnouncements;
