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
  const [attendanceStats, setAttendanceStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    absentToday: 0,
  });
  const [selectedLeaveRequests, setSelectedLeaveRequests] = useState([]);
  const [selectedAttendanceRecords, setSelectedAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchAllLeaveRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/all`, { headers: authHeaders });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllLeaveRequests(data);
    } catch (err) {
      console.error("Failed to fetch all leave requests:", err);
      toast.error("Failed to load all leave requests.");
      setError("Failed to load leave requests. Please try again.");
    }
  }, [API_BASE_URL, token]);

  const fetchAllAttendanceRecords = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/all`, { headers: authHeaders });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllAttendanceRecords(data);
    } catch (err) {
      console.error("Failed to fetch all attendance records:", err);
      toast.error("Failed to load all attendance records.");
      setError("Failed to load attendance records. Please try again.");
    }
  }, [API_BASE_URL, token]);

  const fetchAttendanceStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/admin/overview`, { headers: authHeaders });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAttendanceStats(data);
    } catch (err) {
      console.error("Failed to fetch attendance overview:", err);
      toast.error("Failed to load attendance overview.");
      setError("Failed to load attendance overview. Please try again.");
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAllLeaveRequests(),
        fetchAllAttendanceRecords(),
        fetchAttendanceStats()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchAllLeaveRequests, fetchAllAttendanceRecords, fetchAttendanceStats]);

  const handleApproveReject = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this leave request?`)) return;
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

  // --- NEW: Selection and Deletion Handlers ---

  const handleSelectLeaveRequest = (id) => {
    setSelectedLeaveRequests(prev =>
      prev.includes(id) ? prev.filter(requestId => requestId !== id) : [...prev, id]
    );
  };

  const handleSelectAllLeaveRequests = () => {
    if (selectedLeaveRequests.length === allLeaveRequests.length) {
      setSelectedLeaveRequests([]);
    } else {
      setSelectedLeaveRequests(allLeaveRequests.map(req => req.id));
    }
  };

  const handleDeleteSelectedLeaveRequests = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLeaveRequests.length} leave request(s)?`)) return;

    try {
      await Promise.all(selectedLeaveRequests.map(id => 
        fetch(`${API_BASE_URL}/api/leave-requests/${id}`, {
          method: 'DELETE',
          headers: authHeaders
        })
      ));
      toast.success(`${selectedLeaveRequests.length} leave request(s) deleted successfully!`);
      setSelectedLeaveRequests([]);
      fetchAllLeaveRequests(); // Re-fetch to update the table
    } catch (err) {
      console.error("Failed to delete leave requests:", err);
      toast.error("Failed to delete one or more leave requests.");
    }
  };

  const handleSelectAttendanceRecord = (id) => {
    setSelectedAttendanceRecords(prev =>
      prev.includes(id) ? prev.filter(recordId => recordId !== id) : [...prev, id]
    );
  };

  const handleSelectAllAttendanceRecords = () => {
    if (selectedAttendanceRecords.length === allAttendanceRecords.length) {
      setSelectedAttendanceRecords([]);
    } else {
      setSelectedAttendanceRecords(allAttendanceRecords.map(rec => rec.id));
    }
  };

  const handleDeleteSelectedAttendanceRecords = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedAttendanceRecords.length} attendance record(s)?`)) return;

    try {
      await Promise.all(selectedAttendanceRecords.map(id =>
        fetch(`${API_BASE_URL}/api/attendance/${id}`, {
          method: 'DELETE',
          headers: authHeaders
        })
      ));
      toast.success(`${selectedAttendanceRecords.length} attendance record(s) deleted successfully!`);
      setSelectedAttendanceRecords([]);
      fetchAllAttendanceRecords(); // Re-fetch to update the table
    } catch (err) {
      console.error("Failed to delete attendance records:", err);
      toast.error("Failed to delete one or more attendance records.");
    }
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
          <p><strong>Total Employees:</strong> {attendanceStats.totalEmployees}</p>
          <p><strong>Present:</strong> <span className="text-green-600 font-bold">{attendanceStats.presentToday}</span></p>
          <p><strong>Late:</strong> <span className="text-yellow-600 font-bold">{attendanceStats.lateToday}</span></p>
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
      <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4 flex justify-between items-center">
        All Leave Requests
        <button
          onClick={handleDeleteSelectedLeaveRequests}
          disabled={selectedLeaveRequests.length === 0}
          className={`btn bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-md ${selectedLeaveRequests.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
        >
          Delete Selected ({selectedLeaveRequests.length})
        </button>
      </h3>
      {allLeaveRequests.length === 0 ? (
        <p className="text-center text-gray-500">No leave requests.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedLeaveRequests.length === allLeaveRequests.length}
                    onChange={handleSelectAllLeaveRequests}
                  />
                </th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedLeaveRequests.includes(req.id)}
                      onChange={() => handleSelectLeaveRequest(req.id)}
                    />
                  </td>
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
      <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4 flex justify-between items-center">
        All Attendance Records
        <button
          onClick={handleDeleteSelectedAttendanceRecords}
          disabled={selectedAttendanceRecords.length === 0}
          className={`btn bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-md ${selectedAttendanceRecords.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
        >
          Delete Selected ({selectedAttendanceRecords.length})
        </button>
      </h3>
      {allAttendanceRecords.length === 0 ? (
        <p className="text-center text-gray-500">No attendance records.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedAttendanceRecords.length === allAttendanceRecords.length}
                    onChange={handleSelectAllAttendanceRecords}
                  />
                </th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedAttendanceRecords.includes(rec.id)}
                      onChange={() => handleSelectAttendanceRecord(rec.id)}
                    />
                  </td>
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