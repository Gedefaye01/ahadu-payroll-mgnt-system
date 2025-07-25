import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback and useState
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * CompanyAnnouncements Component
 * Displays a list of company-wide announcements for employees.
 * For ADMIN users, it also provides functionality to add, edit, and delete announcements.
 * It interacts with the backend API for CRUD operations.
 */
function CompanyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]); // State for announcements list
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages
  const [isAdding, setIsAdding] = useState(false); // State to control visibility of add form
  const [editingAnnouncement, setEditingAnnouncement] = useState(null); // State for announcement being edited
  const [formTitle, setFormTitle] = useState(''); // State for form title input
  const [formContent, setFormContent] = useState(''); // State for form content input (corrected)

  // Determine if the current user is an admin based on localStorage
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
  const token = localStorage.getItem('token'); // Get JWT token from localStorage

  // Memoize fetchAnnouncements using useCallback to prevent unnecessary re-creations
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Headers for authenticated requests, dependent on 'token'
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('http://localhost:8080/api/announcements', {
        headers: authHeaders // Include auth headers for fetching
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
  }, [token]); // 'toast' dependency removed as it's a stable object.

  // Fetch announcements on component mount and whenever fetchAnnouncements changes
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  /**
   * Handles submission of the add/edit announcement form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    const method = editingAnnouncement ? 'PUT' : 'POST';
    const url = editingAnnouncement
      ? `http://localhost:8080/api/announcements/${editingAnnouncement.id}`
      : 'http://localhost:8080/api/announcements';

    // Headers for authenticated requests
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify({ title: formTitle, content: formContent })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingAnnouncement ? 'update' : 'add'} announcement.`);
      }

      toast.success(`Announcement ${editingAnnouncement ? 'updated' : 'added'} successfully!`);
      // Clear form and refetch announcements
      setFormTitle('');
      setFormContent('');
      setIsAdding(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      console.error(`Error ${editingAnnouncement ? 'updating' : 'add'} announcement:`, err);
      toast.error(err.message || `Failed to ${editingAnnouncement ? 'update' : 'add'} announcement.`);
    }
  };

  /**
   * Handles initiating the edit process for an announcement.
   * @param {Object} announcement The announcement object to edit.
   */
  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormTitle(announcement.title);
    setFormContent(announcement.content);
    setIsAdding(true); // Open the form in edit mode
  };

  /**
   * Handles deleting an announcement.
   * @param {string} id The ID of the announcement to delete.
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    // Headers for authenticated requests
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(`http://localhost:8080/api/announcements/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete announcement.");
      }

      toast.success("Announcement deleted successfully!");
      fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error(err.message || "Failed to delete announcement.");
    }
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading announcements...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Company Announcements</h2>

      {/* Admin: Add New Announcement Button & Form */}
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

      {/* Announcements List */}
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

              {/* Admin Actions for each announcement */}
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
