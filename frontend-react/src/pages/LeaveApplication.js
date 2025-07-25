import React, { useState, useEffect, useCallback } from 'react'; // Import useEffect and useCallback
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * LeaveApplication Component
 * Allows employees to apply for leave and view their past applications.
 * It includes a form for new applications and a table for historical records.
 * It interacts with the backend API for submitting and fetching leave requests.
 */
function LeaveApplication() {
  // State for the leave application form inputs
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Sick Leave', // Corresponds to 'leaveType' in backend LeaveRequest model
    startDate: '',
    endDate: '',
    reason: '',
  });
  // State for storing leave applications fetched from the API
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages

  // Get JWT token and current user ID from localStorage for authenticated requests
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage

  /**
   * Fetches the current user's leave applications from the backend API.
   * Memoized with useCallback.
   */
  const fetchMyLeaveApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Define authHeaders inside useCallback to ensure 'token' is captured correctly
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('http://localhost:8080/api/leave-requests/my', {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch my leave applications:", err);
      setError("Failed to load your leave applications. Please try again.");
      toast.error("Failed to load your leave applications.");
    } finally {
      setLoading(false);
    }
  }, [token]); // 'token' is a dependency. 'toast' is removed as it's stable.

  // Fetch applications on component mount
  useEffect(() => {
    fetchMyLeaveApplications();
  }, [fetchMyLeaveApplications]); // fetchMyLeaveApplications is now a dependency

  /**
   * Handles changes to the leave application form input fields.
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the submission of a new leave application.
   * Performs basic validation and sends the application to the backend.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Basic form validation
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error('Please fill in all required fields.');
      return;
    }
    // Simple date order validation
    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    // Define authHeaders here as well, as it's used in this async function
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Prepare payload for backend
    const payload = {
      employeeId: userId, // Set employeeId from current user
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      // Backend will set requestDate and status to "Pending"
    };

    try {
      const response = await fetch('http://localhost:8080/api/leave-requests', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave application.');
      }

      toast.success('Leave application submitted successfully!');
      setLeaveForm({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' }); // Reset form
      fetchMyLeaveApplications(); // Re-fetch to update the list
    } catch (err) {
      console.error("Error submitting leave application:", err);
      toast.error(err.message || "Failed to submit leave application.");
    }
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading leave applications...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Apply for Leave</h2>

      {/* Leave Application Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">New Leave Application</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Leave Type Selection */}
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type</label>
            <select
              id="leaveType"
              name="leaveType"
              value={leaveForm.leaveType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation">Vacation</option>
              <option value="Personal Leave">Personal Leave</option>
            </select>
          </div>
          {/* Start Date Input */}
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={leaveForm.startDate}
              onChange={handleChange}
              required
            />
          </div>
          {/* End Date Input */}
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={leaveForm.endDate}
              onChange={handleChange}
              required
            />
          </div>
          {/* Reason Textarea */}
          <div className="form-group md:col-span-2"> {/* Spans two columns on medium screens and up */}
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              value={leaveForm.reason}
              onChange={handleChange}
              rows="3" // Sets the visible number of lines
              placeholder="Briefly describe the reason for your leave..."
              required
            ></textarea>
          </div>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Submit Application
        </button>
      </form>

      {/* Past Leave Applications Table */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4">My Leave Applications</h3>
      {applications.length === 0 ? (
        <p className="text-center text-gray-500">No leave applications submitted yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Request Date</th> {/* Added Request Date */}
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.leaveType}</td> {/* Use leaveType from backend */}
                  <td>{app.startDate}</td>
                  <td>{app.endDate}</td>
                  <td>{app.reason}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{new Date(app.requestDate).toLocaleDateString()}</td> {/* Format Request Date */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveApplication;
