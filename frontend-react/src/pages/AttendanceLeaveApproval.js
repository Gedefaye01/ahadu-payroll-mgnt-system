import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

/**
 * AttendanceLeaveApproval Component
 * Allows administrators to oversee attendance records and approve/reject leave requests.
 * It interacts with the backend API for fetching all attendance and leave requests,
 * for updating leave request statuses, and now for fetching real-time attendance overview statistics.
 */
function AttendanceLeaveApproval() {
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ // Updated state for aggregated attendance stats
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0, // NEW: Added state for late employees
    onLeaveToday: 0,
    absentToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
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
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/all`, {
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
  }, [API_BASE_URL, token]);

  /**
   * Fetches all attendance records from the backend API.
   * Memoized with useCallback.
   */
  const fetchAllAttendanceRecords = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/all`, {
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
  }, [API_BASE_URL, token]);

  /**
   * Fetches aggregated attendance statistics from the backend API.
   * This is a NEW function to get the overview directly from the server.
   * Memoized with useCallback.
   */
  const fetchAttendanceStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/admin/overview`, {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAttendanceStats(data); // Assuming backend returns { totalEmployees, presentToday, lateToday, onLeaveToday, absentToday }
    } catch (err) {
      console.error("Failed to fetch attendance overview:", err);
      toast.error("Failed to load attendance overview.");
      setError("Failed to load attendance overview. Please try again.");
    }
  }, [API_BASE_URL, token]);

  // Fetch all data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Fetch all three sets of data concurrently
      await Promise.all([
        fetchAllLeaveRequests(),
        fetchAllAttendanceRecords(),
        fetchAttendanceStats()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchAllLeaveRequests, fetchAllAttendanceRecords, fetchAttendanceStats]);

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
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/${requestId}/${status}`, {
        method: 'PUT',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${status} leave request.`);
      }

      toast.success(`Leave request ${status}d successfully!`);
      fetchAllLeaveRequests();
      fetchAttendanceStats();
    } catch (err) {
      console.error(`Error ${status}ing leave request:`, err);
      toast.error(err.message || `Failed to ${status} leave request.`);
    }
  };

  const pendingLeaveRequests = allLeaveRequests.filter(req => req.status === 'Pending');

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
          <p><strong>Total Employees:</strong> {attendanceStats.totalEmployees}</p>
          <p><strong>Present:</strong> <span className="text-green-600 font-bold">{attendanceStats.presentToday}</span></p>
          <p><strong>Late:</strong> <span className="text-yellow-600 font-bold">{attendanceStats.lateToday}</span></p> {/* NEW: Added display for lateToday */}
          <p><strong>On Leave:</strong> <span className="text-yellow-600 font-bold">{attendanceStats.onLeaveToday}</span></p>
          <p><strong>Absent:</strong> <span className="text-red-600 font-bold">{attendanceStats.absentToday}</span></p>
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
                  <td>{format(new Date(req.startDate), 'PP')} to {format(new Date(req.endDate), 'PP')}</td>
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
                  <td>{format(new Date(req.startDate), 'PP')} to {format(new Date(req.endDate), 'PP')}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{format(new Date(req.requestDate), 'PP')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Attendance Records Table */}
      <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">All Attendance Records</h3>
      {allAttendanceRecords.length === 0 ? (
        <p className="text-center text-gray-500">No attendance records.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allAttendanceRecords.map(rec => (
                <tr key={rec.id}>
                  <td>{rec.id}</td>
                  <td>{rec.employeeUsername}</td>
                  <td>{format(new Date(rec.date), 'PP')}</td>
                  <td>{rec.clockInTime || 'N/A'}</td>
                  <td>{rec.clockOutTime || 'N/A'}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rec.status === 'Present' ? 'bg-green-100 text-green-800' :
                      rec.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
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