import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * LeaveApplication Component
 * Allows employees to apply for leave and view their past applications.
 * It includes a form for new applications and a table for historical records.
 * It interacts with the backend API for submitting and fetching leave requests.
 */
function LeaveApplication() {
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <--- ADD THIS LINE

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  /**
   * Fetches the current user's leave applications from the backend API.
   * Memoized with useCallback.
   */
  const fetchMyLeaveApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/my`, { // <--- MODIFIED
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
  }, [API_BASE_URL, token]); // Add API_BASE_URL to dependencies

  // Fetch applications on component mount
  useEffect(() => {
    fetchMyLeaveApplications();
  }, [fetchMyLeaveApplications]);

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
    e.preventDefault();

    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const payload = {
      employeeId: userId,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
    };

    try {
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/leave-requests`, { // <--- MODIFIED
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit leave application.');
      }

      toast.success('Leave application submitted successfully!');
      setLeaveForm({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      fetchMyLeaveApplications();
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
          <div className="form-group md:col-span-2">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              value={leaveForm.reason}
              onChange={handleChange}
              rows="3"
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
                <th>Request Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.leaveType}</td>
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
                  <td>{new Date(app.requestDate).toLocaleDateString()}</td>
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