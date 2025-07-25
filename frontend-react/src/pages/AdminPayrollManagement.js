import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * AdminPayrollManagement Component
 * Allows administrators to simulate payroll processing and view recent runs.
 * It uses mock data for payroll runs.
 */
function AdminPayrollManagement() {
  const [processing, setProcessing] = useState(false); // State to indicate if payroll is currently processing
  const [lastProcessed, setLastProcessed] = useState(null); // State to store the timestamp of the last processing
  // State for the list of payroll runs (mock data). In a real app, this would be fetched from an API.
  const [payrollRuns, setPayrollRuns] = useState([
    { id: 1, date: '2024-06-30', status: 'Completed', totalAmount: '150,000 USD' },
    { id: 2, date: '2024-05-31', status: 'Completed', totalAmount: '145,000 USD' },
  ]);

  /**
   * Handles the action to process payroll.
   * Simulates an asynchronous operation and updates the UI accordingly.
   */
  const handleProcessPayroll = () => {
    setProcessing(true); // Set processing state to true
    // Simulate API call or background task for payroll processing
    setTimeout(() => {
      const now = new Date();
      const newRun = {
        id: payrollRuns.length + 1, // Simple ID generation
        date: now.toISOString().slice(0, 10), // Get current date in YYYY-MM-DD format
        status: 'Completed',
        totalAmount: '160,000 USD' // Mock amount for the new run
      };
      setLastProcessed(now.toLocaleString()); // Update last processed timestamp
      setPayrollRuns([newRun, ...payrollRuns]); // Add the new run to the beginning of the list
      setProcessing(false); // Set processing state back to false
      toast.success('Payroll processing completed successfully!'); // Use toast
    }, 2000); // Simulate 2-second processing time
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
        <button
          onClick={handleProcessPayroll}
          disabled={processing} // Disable button while processing
          className={`btn ${processing ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary bg-green-600 hover:bg-green-700 text-white shadow-md'}`}
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
                <th>Date</th>
                <th>Status</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {payrollRuns.map(run => (
                <tr key={run.id}>
                  <td>{run.id}</td>
                  <td>{run.date}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      run.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {run.status}
                    </span>
                  </td>
                  <td>{run.totalAmount}</td>
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
