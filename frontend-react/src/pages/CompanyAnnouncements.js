import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth'; // Added signInWithCustomToken, signInAnonymously
import { initializeApp } from 'firebase/app';
import { FaEdit, FaTrash, FaPlusCircle, FaBullhorn } from 'react-icons/fa'; // Import icons
import { toast } from 'react-toastify'; // Import toast for notifications

function CompanyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = '';
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false); // New state for Firebase init status
  const [error, setError] = useState(null);

  // Firebase config and initialization (using global variables)
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  let firebaseConfig = {};
  try {
    // Attempt to parse the firebase config. Handle potential errors if it's not valid JSON.
    firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : {};
  } catch (e) {
    console.error("Error parsing __firebase_config:", e);
    setError("Invalid Firebase configuration provided. Please check your environment variables (e.g., __firebase_config).");
  }

  // Check if firebaseConfig has projectId before attempting to initialize Firebase app
  if (!firebaseConfig.projectId && !error) { // Only set error if not already set by parse
    setError("Firebase projectId is missing in the configuration. Please ensure __firebase_config environment variable is correctly set and contains your Firebase project ID.");
  }

  // Initialize Firebase app, db, and auth only if config is valid
  const app = firebaseConfig.projectId ? initializeApp(firebaseConfig) : null;
  const db = app ? getFirestore(app) : null;
  const auth = app ? getAuth(app) : null;

  useEffect(() => {
    // If there's a configuration error, stop loading and don't proceed with Firebase operations
    if (error) {
      setLoading(false);
      return;
    }

    // If Firebase app, db, or auth could not be initialized due to missing config, show error
    if (!app || !db || !auth) {
      console.error("Firebase app, db, or auth not initialized due to missing or invalid config.");
      setError("Firebase is not configured. Please contact support or check deployment settings (e.g., __firebase_config).");
      setLoading(false);
      return;
    }

    setFirebaseInitialized(true); // Mark Firebase as initialized successfully

    const setupAuthAndFirestore = async () => {
      try {
        // Attempt to sign in with custom token if available, otherwise anonymously
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (authError) {
        console.error("Firebase authentication failed:", authError);
        setError("Failed to authenticate with Firebase. Please try again.");
        setLoading(false);
        return;
      }

      // Set up authentication state listener
      const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          // Fetch user role from Firestore
          const userDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile/data`); // Assuming private user profile
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (userData.roles && userData.roles.includes('ADMIN')) { // Ensure role string matches backend
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
        setLoading(false); // Stop loading once auth state is checked
      });

      // Set up real-time listener for announcements
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

      // Cleanup function for useEffect
      return () => {
        unsubscribeAuth();
        unsubscribeSnapshot();
      };
    };

    // Only run setup if Firebase is successfully initialized (no initial errors)
    if (firebaseInitialized) {
      setupAuthAndFirestore();
    }

  }, [app, db, auth, appId, firebaseInitialized, error]); // Add app, db, auth, and error to dependencies

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      toast.error('Title and content cannot be empty.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to add an announcement.');
      return;
    }
    if (!db) { // Check if db is initialized before attempting operations
      toast.error('Firebase database not initialized. Please check configuration.');
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/announcements`), {
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        publishDate: serverTimestamp(),
        authorId: user.uid,
        authorUsername: user.displayName || user.email,
      });
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      toast.success('Announcement added successfully!');
    } catch (err) {
      console.error("Error adding announcement:", err);
      toast.error("Failed to add announcement.");
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
      toast.error('Title and content cannot be empty.');
      return;
    }
    if (!editingAnnouncement) return;
    if (!db) { // Check if db is initialized before attempting operations
      toast.error('Firebase database not initialized. Please check configuration.');
      return;
    }

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
      toast.success('Announcement updated successfully!');
    } catch (err) {
      console.error("Error updating announcement:", err);
      toast.error("Failed to update announcement.");
      setError("Failed to update announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!db) { // Check if db is initialized before attempting operations
      toast.error('Firebase database not initialized. Please check configuration.');
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
              try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/announcements`, id));
                toast.success('Announcement deleted successfully!');
              } catch (err) {
                console.error("Error deleting announcement:", err);
                toast.error("Failed to delete announcement.");
                setError("Failed to delete announcement.");
              } finally {
                closeToast();
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

  // Display error message if there's a configuration or Firebase initialization issue
  if (error) {
    return <div className="page-container text-center text-red-500 mt-8">Error: {error}</div>;
  }

  // Show loading until Firebase is initialized and authentication state is checked
  if (loading || !firebaseInitialized) {
    return <div className="text-center text-gray-600 mt-8">Loading announcements...</div>;
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
