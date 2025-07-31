import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { FaEdit, FaTrash, FaPlusCircle, FaBullhorn } from 'react-icons/fa'; // Import icons

function CompanyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firebase config and initialization (using global variables)
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user is admin (assuming roles are stored in Firestore 'users' collection)
        const userDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile/data`);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.roles && userData.roles.includes('admin')) {
              setIsAdmin(true);
            }
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setError("Failed to load user roles.");
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    const announcementsCollectionRef = collection(db, `artifacts/${appId}/public/data/announcements`);
    const q = query(announcementsCollectionRef, orderBy('publishDate', 'desc'));

    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData);
    }, (err) => {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements.");
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [db, auth, appId]);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      alert('Title and content cannot be empty.'); // Using alert for simplicity, consider a modal
      return;
    }
    if (!user) {
      alert('You must be logged in to add an announcement.');
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/announcements`), {
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        publishDate: serverTimestamp(),
        authorId: user.uid,
        authorUsername: user.displayName || user.email, // Use display name or email
      });
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
    } catch (err) {
      console.error("Error adding announcement:", err);
      setError("Failed to add announcement.");
    }
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncementTitle(announcement.title);
    setNewAnnouncementContent(announcement.content);
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      alert('Title and content cannot be empty.');
      return;
    }
    if (!editingAnnouncement) return;

    try {
      const announcementRef = doc(db, `artifacts/${appId}/public/data/announcements`, editingAnnouncement.id);
      await updateDoc(announcementRef, {
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        lastEdited: serverTimestamp(),
        editorId: user.uid,
        editorUsername: user.displayName || user.email,
      });
      setEditingAnnouncement(null);
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError("Failed to update announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) { // Using confirm for simplicity
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/announcements`, id));
      } catch (err) {
        console.error("Error deleting announcement:", err);
        setError("Failed to delete announcement.");
      }
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 mt-8">Loading announcements...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  return (
    <div className="page-container">
      <h2 className="page-header">Company Announcements</h2>

      {/* Add/Edit Announcement Form */}
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
                Published: {announcement.publishDate?.toDate().toLocaleDateString() || 'N/A'}
                {announcement.authorUsername && ` by ${announcement.authorUsername}`}
              </p>
              <p className="announcement-card-content">{announcement.content}</p>

              {isAdmin && (
                <div className="announcement-actions">
                  <button
                    onClick={() => handleEditClick(announcement)}
                    className="btn-edit" // ONLY use this custom class
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="btn-delete" // ONLY use this custom class
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
