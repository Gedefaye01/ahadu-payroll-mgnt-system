import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * ClockInOut Component
 * Allows employees to record their daily clock-in and clock-out times.
 * It fetches the current day's attendance record (if any) and provides buttons
 * to clock in, clock out, or update remarks.
 * It interacts with the backend API for saving attendance records.
 */
function ClockInOut() {
  const [currentAttendance, setCurrentAttendance] = useState(null); // State for today's attendance record
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages
  const [remarks, setRemarks] = useState(''); // State for remarks input

  // Get JWT token and current user ID from localStorage for authenticated requests
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage

  /**
   * Fetches today's attendance record for the current user.
   * Memoized with useCallback.
   */
  const fetchTodayAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Define authHeaders inside useCallback to ensure 'token' is captured correctly
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // The backend endpoint /api/attendance/my returns all attendance for the user.
      // We'll filter for today's record on the frontend.
      const response = await fetch('http://localhost:8080/api/attendance/my', {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
      const recordToday = data.find(record => record.date === today);

      if (recordToday) {
        setCurrentAttendance(recordToday);
        setRemarks(recordToday.remarks || ''); // Pre-fill remarks if they exist
      } else {
        setCurrentAttendance(null);
        setRemarks('');
      }
    } catch (err) {
      console.error("Failed to fetch today's attendance:", err);
      setError("Failed to load today's attendance. Please try again.");
      toast.error("Failed to load today's attendance.");
    } finally {
      setLoading(false);
    }
  }, [token]); // 'token' is a dependency. 'toast' is removed as it's stable.

  // Fetch today's attendance on component mount and after actions
  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  /**
   * Handles clock-in action.
   */
  const handleClockIn = async () => {
    if (currentAttendance && currentAttendance.clockInTime) {
      toast.info("You have already clocked in today.");
      return;
    }

    const now = new Date();
    const payload = {
      employeeId: userId,
      date: now.toISOString().slice(0, 10), // YYYY-MM-DD
      clockInTime: now.toTimeString().slice(0, 8), // HH:MM:SS
      status: 'Present',
      remarks: remarks,
    };

    // Define authHeaders here as well, as it's used in this async function
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch('http://localhost:8080/api/attendance', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clock in.");
      }

      toast.success("Clock-in successful!");
      fetchTodayAttendance(); // Re-fetch to update UI with new record
    } catch (err) {
      console.error("Error clocking in:", err);
      toast.error(err.message || "Failed to clock in.");
    }
  };

  /**
   * Handles clock-out action.
   */
  const handleClockOut = async () => {
    if (!currentAttendance || !currentAttendance.clockInTime) {
      toast.warn("You need to clock in first.");
      return;
    }
    if (currentAttendance.clockOutTime) {
      toast.info("You have already clocked out today.");
      return;
    }

    const now = new Date();
    const payload = {
      ...currentAttendance, // Use existing record data
      clockOutTime: now.toTimeString().slice(0, 8), // HH:MM:SS
      // Status might remain 'Present' or change based on company policy (e.g., 'Completed')
      remarks: remarks, // Update remarks if changed
    };

    // Define authHeaders here as well, as it's used in this async function
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      // Use PUT to update the existing attendance record
      const response = await fetch(`http://localhost:8080/api/attendance/${currentAttendance.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clock out.");
      }

      toast.success("Clock-out successful!");
      fetchTodayAttendance(); // Re-fetch to update UI
    } catch (err) {
      console.error("Error clocking out:", err);
      toast.error(err.message || "Failed to clock out.");
    }
  };

  /**
   * Handles updating remarks for the current attendance record.
   */
  const handleUpdateRemarks = async () => {
    if (!currentAttendance) {
      toast.warn("No attendance record for today to update remarks.");
      return;
    }

    const payload = {
      ...currentAttendance,
      remarks: remarks,
    };

    // Define authHeaders here as well, as it's used in this async function
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(`http://localhost:8080/api/attendance/${currentAttendance.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update remarks.");
      }

      toast.success("Remarks updated successfully!");
      fetchTodayAttendance(); // Re-fetch to update UI
    } catch (err) {
      console.error("Error updating remarks:", err);
      toast.error(err.message || "Failed to update remarks.");
    }
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading today's attendance...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Daily Clock In/Out</h2>

      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Today's Attendance ({new Date().toLocaleDateString()})</h3>
        {currentAttendance ? (
          <div>
            <p className="text-gray-700 text-lg mb-2">
              <strong>Clock In:</strong> {currentAttendance.clockInTime || 'N/A'}
            </p>
            <p className="text-gray-700 text-lg mb-4">
              <strong>Clock Out:</strong> {currentAttendance.clockOutTime || 'N/A'}
            </p>
            <p className="text-gray-700 text-lg mb-4">
              <strong>Status:</strong> <span className={`px-2 inline-flex text-base leading-5 font-semibold rounded-full ${
                currentAttendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                currentAttendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentAttendance.status}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">No attendance record for today.</p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          {!currentAttendance || !currentAttendance.clockInTime ? (
            <button
              onClick={handleClockIn}
              className="btn btn-primary bg-green-600 hover:bg-green-700 text-white shadow-md"
              disabled={loading}
            >
              Clock In
            </button>
          ) : (
            <button
              onClick={handleClockOut}
              className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              disabled={loading || currentAttendance.clockOutTime}
            >
              Clock Out
            </button>
          )}
        </div>

        {/* Remarks Section */}
        <div className="mt-8">
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 text-left mb-2">Remarks (Optional):</label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows="3"
            placeholder="Add any notes about your attendance (e.g., reason for late arrival)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
          <button
            onClick={handleUpdateRemarks}
            className="btn btn-secondary mt-4 w-full sm:w-auto"
            disabled={loading || !currentAttendance}
          >
            Update Remarks
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClockInOut;
