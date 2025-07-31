import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Import toast for notifications
import { format } from 'date-fns'; // Import format for date formatting

/**
 * AdminPayrollManagement Component
 * Allows administrators to process payroll for real employee data
 * and view recent payroll runs fetched from the backend.
 */
function AdminPayrollManagement() {
  const [processing, setProcessing] = useState(false); // State to indicate if payroll is currently processing
  const [payrollRuns, setPayrollRuns] = useState([]); // State for the list of payroll runs from API
  const [payPeriodStart, setPayPeriodStart] = useState(''); // State for start date input
  const [payPeriodEnd, setPayPeriodEnd] = useState(''); // State for end date input
  const [lastProcessed, setLastProcessed] = useState(null); // State to store the timestamp of the last processing

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token'); // Get the authentication token

  /**
   * Fetches the list of all payroll runs from the backend.
   */
  const fetchPayrollRuns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payroll/runs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Assuming data is a list of payroll objects
      // Sort by date descending to show most recent first
      const sortedData = data.sort((a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd));
      setPayrollRuns(sortedData);

      // Update last processed time if there are any runs
      if (sortedData.length > 0) {
        setLastProcessed(format(new Date(sortedData[0].payPeriodEnd), 'PPP HH:mm')); // Format date for display
      } else {
        setLastProcessed(null);
      }

    } catch (error) {
      console.error("Failed to fetch payroll runs:", error);
      toast.error("Failed to load payroll history.");
    }
  };

  // Effect hook to fetch payroll runs on component mount
  useEffect(() => {
    fetchPayrollRuns();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Handles the action to process payroll.
   * Sends the pay period dates to the backend API.
   */
  const handleProcessPayroll = async () => {
    if (!payPeriodStart || !payPeriodEnd) {
      toast.error("Please select both start and end dates for the payroll period.");
      return;
    }

    setProcessing(true); // Set processing state to true

    try {
      const response = await fetch(`${API_BASE_URL}/api/payroll/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payPeriodStart: payPeriodStart,
          payPeriodEnd: payPeriodEnd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Payroll processing failed with status: ${response.status}`);
      }

      // Assuming the backend returns the newly generated payrolls or a success message
      toast.success('Payroll processing completed successfully!');
      setPayPeriodStart(''); // Clear dates after successful processing
      setPayPeriodEnd('');
      fetchPayrollRuns(); // Re-fetch payroll runs to update the table
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast.error(error.message || "An error occurred during payroll processing.");
    } finally {
      setProcessing(false); // Set processing state back to false
    }
  };

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Manage Payroll Processing</h2>

      {/* Payroll Actions Section */}
      <div className="text-center mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Payroll Actions</h3>
        <p className="text-gray-600 mb-4">
          Last Payroll Processed: {lastProcessed || 'Never'}
        </p>
        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-center">
          <div className="form-group flex-1">
            <label htmlFor="payPeriodStart" className="block text-gray-700 text-sm font-bold mb-2">Pay Period Start Date</label>
            <input
              type="date"
              id="payPeriodStart"
              value={payPeriodStart}
              onChange={(e) => setPayPeriodStart(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="form-group flex-1">
            <label htmlFor="payPeriodEnd" className="block text-gray-700 text-sm font-bold mb-2">Pay Period End Date</label>
            <input
              type="date"
              id="payPeriodEnd"
              value={payPeriodEnd}
              onChange={(e) => setPayPeriodEnd(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <button
          onClick={handleProcessPayroll}
          disabled={processing || !payPeriodStart || !payPeriodEnd} // Disable if processing or dates are not selected
          className={`btn ${processing || !payPeriodStart || !payPeriodEnd ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary bg-green-600 hover:bg-green-700 text-white shadow-md'}`}
        >
          {processing ? 'Processing Payroll...' : 'Process Payroll Now'}
        </button>
      </div>

      {/* Recent Payroll Runs Table */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Payroll Runs</h3>
      {payrollRuns.length === 0 ? (
        <p className="text-center text-gray-500">No payroll runs recorded yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Employee ID</th> {/* Added Employee ID column */}
                <th>Pay Period</th>
                <th>Gross Pay</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payrollRuns.map(run => (
                <tr key={run.id}>
                  <td>{run.id}</td>
                  <td>{run.employeeId}</td> {/* Display Employee ID */}
                  <td>{format(new Date(run.payPeriodStart), 'PP')} - {format(new Date(run.payPeriodEnd), 'PP')}</td>
                  <td>{run.grossPay ? `$${run.grossPay.toFixed(2)}` : 'N/A'}</td>
                  <td>{run.totalDeductions ? `$${run.totalDeductions.toFixed(2)}` : 'N/A'}</td>
                  <td>{run.netPay ? `$${run.netPay.toFixed(2)}` : 'N/A'}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      run.status === 'Processed' ? 'bg-green-100 text-green-800' :
                      run.status === 'Completed' ? 'bg-blue-100 text-blue-800' : // Assuming 'Completed' is also a valid status
                      'bg-yellow-100 text-yellow-800' // For other statuses like 'Pending'
                    }`}>
                      {run.status}
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

export default AdminPayrollManagement;
