import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Import toast for notifications
import { format } from 'date-fns'; // Import format for date formatting

/**
 * PayrollDetails Component
 * Allows employees to view their payroll details and payslips.
 * It fetches payslip records from the backend API and displays them in a table.
 */
function PayrollDetails() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token');

  /**
   * Fetches the current employee's payslips from the backend API.
   * Memoized with useCallback to prevent unnecessary re-creations.
   */
  const fetchMyPayslips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/payroll/my-payslips`, {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Sort payslips by end date in descending order to show most recent first
      const sortedPayslips = data.sort((a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd));
      setPayslips(sortedPayslips);
    } catch (err) {
      console.error("Failed to fetch payslips:", err);
      setError("Failed to load your payslips. Please try again.");
      toast.error("Failed to load your payslips.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]); // Add API_BASE_URL to dependencies

  // Fetch payslips on component mount
  useEffect(() => {
    fetchMyPayslips();
  }, [fetchMyPayslips]);

  /**
   * Handles the download action for a specific payslip.
   * In a real application, this would trigger an API call to download the payslip file
   * based on its ID. For now, it's a placeholder.
   * @param {string} payslipId - The ID of the payslip to download.
   */
  const handleDownloadPayslip = (payslipId) => {
    toast.info(`Simulating download for payslip ID: ${payslipId}`);
    // Example: Triggering a backend endpoint for download
    // window.open(`${API_BASE_URL}/api/payroll/payslips/${payslipId}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading payroll details...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">My Payroll Details & Payslips</h2>

      {payslips.length === 0 ? (
        <p className="text-center text-gray-500">No payslip records available.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Gross Pay</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map(payslip => (
                <tr key={payslip.id}>
                  {/* Format dates using date-fns for consistent display */}
                  <td>{format(new Date(payslip.payPeriodStart), 'PP')} to {format(new Date(payslip.payPeriodEnd), 'PP')}</td>
                  {/* Use toFixed(2) for consistent decimal places and toLocaleString for formatting */}
                  <td>${payslip.grossPay ? payslip.grossPay.toFixed(2).toLocaleString() : '0.00'}</td>
                  <td>${payslip.totalDeductions ? payslip.totalDeductions.toFixed(2).toLocaleString() : '0.00'}</td>
                  <td>${payslip.netPay ? payslip.netPay.toFixed(2).toLocaleString() : '0.00'}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payslip.status === 'Processed' ? 'bg-green-100 text-green-800' :
                      payslip.status === 'Completed' ? 'bg-blue-100 text-blue-800' : // Aligning with AdminPayrollManagement
                      'bg-yellow-100 text-yellow-800' // Fallback for other statuses
                    }`}>
                      {payslip.status}
                    </span>
                  </td>
                  <td className="table-actions text-center">
                    <button
                      onClick={() => handleDownloadPayslip(payslip.id)}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-md"
                    >
                      Download Payslip
                    </button>
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

export default PayrollDetails;
