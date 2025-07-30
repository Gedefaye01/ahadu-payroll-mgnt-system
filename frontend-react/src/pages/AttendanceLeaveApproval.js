import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * AttendanceLeaveApproval Component
 * Allows administrators to oversee attendance records and approve/reject leave requests.
 * It interacts with the backend API for fetching all attendance and leave requests,
 * and for updating leave request statuses.
 */
function AttendanceLeaveApproval() {
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <--- ADD THIS LINE

  // Get JWT token from localStorage for authenticated requests
  const token = localStorage.getItem('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  /**
   * Fetches all leave requests from the backend API.
   * Memoized with useCallback.
   */
  const fetchAllLeaveRequests = useCallback(async () => {
    try {
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/all`, { // <--- MODIFIED
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllLeaveRequests(data);
    } catch (err) {
      console.error("Failed to fetch all leave requests:", err);
      toast.error("Failed to load all leave requests.");
      setError("Failed to load leave requests. Please try again.");
    }
  }, [API_BASE_URL, token, toast]); // Add API_BASE_URL to dependencies

  /**
   * Fetches all attendance records from the backend API.
   * Memoized with useCallback.
   */
  const fetchAllAttendanceRecords = useCallback(async () => {
    try {
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/attendance/all`, { // <--- MODIFIED
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllAttendanceRecords(data);
    } catch (err) {
      console.error("Failed to fetch all attendance records:", err);
      toast.error("Failed to load all attendance records.");
      setError("Failed to load attendance records. Please try again.");
    }
  }, [API_BASE_URL, token, toast]); // Add API_BASE_URL to dependencies

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllLeaveRequests(), fetchAllAttendanceRecords()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAllLeaveRequests, fetchAllAttendanceRecords]);

  /**
   * Handles approving or rejecting a leave request.
   * @param {string} requestId - The ID of the leave request to update.
   * @param {string} status - The new status ('approve' or 'reject').
   */
  const handleApproveReject = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this leave request?`)) {
      return;
    }

    try {
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/${requestId}/${status}`, { // <--- MODIFIED
        method: 'PUT',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${status} leave request.`);
      }

      toast.success(`Leave request ${status}d successfully!`);
      fetchAllLeaveRequests(); // Re-fetch all leave requests to update the list
    } catch (err) {
      console.error(`Error ${status}ing leave request:`, err);
      toast.error(err.message || `Failed to ${status} leave request.`);
    }
  };

  const pendingLeaveRequests = allLeaveRequests.filter(req => req.status === 'Pending');

  // Simple attendance overview calculation from fetched data
  const attendanceOverview = {
    totalEmployees: new Set(allAttendanceRecords.map(rec => rec.employeeId)).size,
    // These would need more sophisticated logic based on current date and clock-in/out times
    // For now, these are placeholders or based on simplified logic.
    // To get accurate "today" stats, you'd filter `allAttendanceRecords` by `LocalDate.now()`
    presentToday: allAttendanceRecords.filter(rec => rec.status === 'Present' && new Date(rec.date).toDateString() === new Date().toDateString()).length,
    onLeaveToday: allLeaveRequests.filter(req => req.status === 'Approved' && new Date(req.startDate) <= new Date() && new Date(req.endDate) >= new Date()).length,
    absentToday: allAttendanceRecords.filter(rec => rec.status === 'Absent' && new Date(rec.date).toDateString() === new Date().toDateString()).length,
  };


  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading data...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Oversee Attendance & Leave Approvals</h2>

      {/* Attendance Overview Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Attendance Overview (Today)</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>Total Employees:</strong> {attendanceOverview.totalEmployees}</p>
          <p><strong>Present:</strong> <span className="text-green-600 font-bold">{attendanceOverview.presentToday}</span></p>
          <p><strong>On Leave:</strong> <span className="text-yellow-600 font-bold">{attendanceOverview.onLeaveToday}</span></p>
          <p><strong>Absent:</strong> <span className="text-red-600 font-bold">{attendanceOverview.absentToday}</span></p>
        </div>
      </div>

      {/* Pending Leave Requests Table */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Pending Leave Requests</h3>
      {pendingLeaveRequests.length === 0 ? (
        <p className="text-center text-gray-500">No pending leave requests.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Period</th>
                <th>Reason</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaveRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.employeeUsername}</td>
                  <td>{req.leaveType}</td>
                  <td>{req.startDate} to {req.endDate}</td>
                  <td>{req.reason}</td>
                  <td className="table-actions text-center">
                    <button
                      onClick={() => handleApproveReject(req.id, 'approve')}
                      className="btn bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-md mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveReject(req.id, 'reject')}
                      className="btn bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Leave Requests Table (including Approved/Rejected) */}
      <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">All Leave Requests</h3>
      {allLeaveRequests.length === 0 ? (
        <p className="text-center text-gray-500">No leave requests.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Period</th>
                <th>Status</th>
                <th>Request Date</th>
              </tr>
            </thead>
            <tbody>
              {allLeaveRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.employeeUsername}</td>
                  <td>{req.leaveType}</td>
                  <td>{req.startDate} to {req.endDate}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{new Date(req.requestDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceLeaveApproval;