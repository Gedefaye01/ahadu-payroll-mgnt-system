import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlusCircle, FaBullhorn } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * CompanyAnnouncements Component
 * Manages company announcements, allowing admins to add, edit, and delete them.
 * Fetches and persists announcements via the backend API instead of Firebase.
 */
function CompanyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Environment variables for API base URL and token
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token'); // Get authentication token from localStorage

  /**
   * Fetches the list of announcements from the backend API.
   * Uses useCallback to memoize the function.
   */
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        // If no token, user is not authenticated, so no announcements to fetch (or unauthorized)
        setError("Authentication token missing. Please sign in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch announcements: ${response.status}`);
      }

      const data = await response.json();
      // Assuming announcements are returned as a list, sorted by publish date descending
      const sortedData = data.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      setAnnouncements(sortedData);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to load announcements.");
      toast.error(err.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Effect hook to fetch announcements and check admin status on component mount and token change
  useEffect(() => {
    // Check user role from localStorage for UI rendering
    const userRole = localStorage.getItem('userRole');
    setIsAdmin(userRole === 'ADMIN');

    fetchAnnouncements(); // Initial fetch of announcements
  }, [fetchAnnouncements]); // Re-run when fetchAnnouncements changes (e.g., token updates)


  /**
   * Handles adding a new announcement via the backend API.
   */
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      toast.error('Title and content cannot be empty.');
      return;
    }
    if (!token) {
      toast.error('You must be logged in to add an announcement.');
      return;
    }
    if (!isAdmin) {
      toast.error('You do not have permission to add announcements.');
      return;
    }

    setLoading(true);
    try {
      const authorUsername = localStorage.getItem('username') || 'Unknown'; // Get username from localStorage
      const payload = {
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        // Backend will typically set publishDate and authorId/username automatically
        authorUsername: authorUsername // Pass username for display if backend uses it
      };

      const response = await fetch(`${API_BASE_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add announcement: ${response.status}`);
      }

      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      toast.success('Announcement added successfully!');
      fetchAnnouncements(); // Re-fetch to update the list
    } catch (err) {
      console.error("Error adding announcement:", err);
      setError(err.message || "Failed to add announcement.");
      toast.error(err.message || "Failed to add announcement.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sets the form for editing an existing announcement.
   */
  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncementTitle(announcement.title);
    setNewAnnouncementContent(announcement.content);
  };

  /**
   * Handles updating an existing announcement via the backend API.
   */
  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      toast.error('Title and content cannot be empty.');
      return;
    }
    if (!editingAnnouncement) return;
    if (!token) {
      toast.error('You must be logged in to update announcements.');
      return;
    }
    if (!isAdmin) {
      toast.error('You do not have permission to update announcements.');
      return;
    }

    setLoading(true);
    try {
      const editorUsername = localStorage.getItem('username') || 'Unknown';
      const payload = {
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        // Backend will typically set lastEdited and editorId/username automatically
        editorUsername: editorUsername // Pass username for display if backend uses it
      };

      const response = await fetch(`${API_BASE_URL}/api/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update announcement: ${response.status}`);
      }

      setEditingAnnouncement(null);
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      toast.success('Announcement updated successfully!');
      fetchAnnouncements(); // Re-fetch to update the list
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError(err.message || "Failed to update announcement.");
      toast.error(err.message || "Failed to update announcement.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles deleting an announcement via the backend API.
   */
  const handleDelete = async (id) => {
    if (!token) {
      toast.error('You must be logged in to delete announcements.');
      return;
    }
    if (!isAdmin) {
      toast.error('You do not have permission to delete announcements.');
      return;
    }

    // Using a custom modal for confirmation instead of window.confirm
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this announcement?</p>
          <button
            className="btn btn-danger mr-2"
            onClick={async () => {
              setLoading(true); // Indicate loading for the delete operation
              try {
                const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || `Failed to delete announcement: ${response.status}`);
                }

                toast.success('Announcement deleted successfully!');
                fetchAnnouncements(); // Re-fetch to update the list
              } catch (err) {
                console.error("Error deleting announcement:", err);
                setError(err.message || "Failed to delete announcement.");
                toast.error(err.message || "Failed to delete announcement.");
              } finally {
                setLoading(false); // End loading
                closeToast(); // Close the toast notification
              }
            }}
          >
            Yes, Delete
          </button>
          <button className="btn btn-secondary" onClick={closeToast}>
            Cancel
          </button>
        </div>
      ),
      {
        autoClose: false,
        closeButton: false,
        draggable: false,
        position: 'top-center',
      }
    );
  };

  // Display error message if there's a configuration or API issue
  if (error) {
    return <div className="page-container text-center text-red-500 mt-8">Error: {error}</div>;
  }

  // Show loading until announcements are fetched
  if (loading) {
    return <div className="text-center text-gray-600 mt-8">Loading announcements...</div>;
  }

  return (
    <div className="page-container">
      <h2 className="page-header">Company Announcements</h2>

      {/* Add/Edit Announcement Form - Only visible to Admins */}
      {isAdmin && (
        <div className="form-container mb-8">
          <h3 className="card-title">
            {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
          </h3>
          <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleAddAnnouncement}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                value={newAnnouncementContent}
                onChange={(e) => setNewAnnouncementContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              {editingAnnouncement ? (
                <>
                  <FaEdit className="mr-2" /> Update Announcement
                </>
              ) : (
                <>
                  <FaPlusCircle className="mr-2" /> Add Announcement
                </>
              )}
            </button>
            {editingAnnouncement && (
              <button
                type="button"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setNewAnnouncementTitle('');
                  setNewAnnouncementContent('');
                }}
                className="btn btn-secondary w-full mt-4"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="announcements-list mt-8">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-600">No announcements published yet.</p>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <h3 className="announcement-card-title">{announcement.title}</h3>
              <p className="announcement-card-meta">
                Published: {new Date(announcement.publishDate).toLocaleDateString() || 'N/A'}
                {announcement.authorUsername && ` by ${announcement.authorUsername}`}
              </p>
              <p className="announcement-card-content">{announcement.content}</p>

              {isAdmin && (
                <div className="announcement-actions">
                  <button
                    onClick={() => handleEditClick(announcement)}
                    className="btn-edit"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="btn-delete"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CompanyAnnouncements;
