import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Ensure react-toastify is installed and configured

/**
 * AttendanceRecord Component
 * Allows employees to view their attendance records, now with date filtering.
 * It fetches attendance data from the backend API and displays them in a table.
 */
function AttendanceRecord() {
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for date filters (start and end date for filtering records)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Get JWT token from localStorage for authenticated requests
  const token = localStorage.getItem('token');

  /**
   * Fetches the current employee's attendance records from the backend API.
   * Memoized with useCallback to prevent unnecessary re-creations.
   */
  const fetchMyAttendanceRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Define authHeaders inside useCallback to ensure 'token' is captured correctly
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/attendance/my`, {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllAttendance(data); // Set the fetched data
    } catch (err) {
      console.error("Failed to fetch attendance records:", err);
      setError("Failed to load your attendance records. Please try again.");
      toast.error("Failed to load your attendance records.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]); // Add API_BASE_URL to dependencies.

  // Effect hook to fetch attendance records on component mount
  useEffect(() => {
    fetchMyAttendanceRecords();
  }, [fetchMyAttendanceRecords]); // Dependency array: re-run effect if fetchMyAttendanceRecords changes

  /**
   * Filters the `allAttendance` records based on the `startDate` and `endDate` state.
   * This is a computed value that re-evaluates whenever `allAttendance`, `startDate`, or `endDate` changes.
   */
  const filteredAttendance = allAttendance.filter(record => {
    const recordDate = new Date(record.date); // Convert record date string to Date object
    const filterStartDate = startDate ? new Date(startDate) : null; // Convert filter start date string to Date object
    const filterEndDate = endDate ? new Date(endDate) : null; // Convert filter end date string to Date object

    // Apply filtering logic:
    // If both dates are set, check if recordDate is within the range [filterStartDate, filterEndDate]
    if (filterStartDate && filterEndDate) {
      // Set hours to 0 to ensure comparison is purely date-based
      filterStartDate.setHours(0, 0, 0, 0);
      filterEndDate.setHours(0, 0, 0, 0);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate >= filterStartDate && recordDate <= filterEndDate;
    }
    // If only start date is set, filter records from start date onwards
    if (filterStartDate) {
      filterStartDate.setHours(0, 0, 0, 0);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate >= filterStartDate;
    }
    // If only end date is set, filter records up to end date
    if (filterEndDate) {
      filterEndDate.setHours(0, 0, 0, 0);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate <= filterEndDate;
    }
    // If no dates are set, return all records
    return true;
  });

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading attendance records...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">My Attendance Records</h2>

      {/* Date Filter Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:flex-row items-center justify-center gap-4">
        <label htmlFor="startDate" className="text-sm font-medium text-gray-700">From:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <label htmlFor="endDate" className="text-sm font-medium text-gray-700">To:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Attendance Records Table */}
      {filteredAttendance.length === 0 ? (
        <p className="text-center text-gray-500">No attendance records available for the selected period.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.clockInTime || '-'}</td>
                  <td>{record.clockOutTime || '-'}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' :
                      record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'On Leave' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceRecord;
