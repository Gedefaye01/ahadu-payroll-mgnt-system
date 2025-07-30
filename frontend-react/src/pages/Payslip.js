import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card'; // Assuming this path is correct for your Card component
import { toast } from 'react-toastify'; // Make sure you have react-toastify installed and configured

/**
 * PaySlip Component
 * Displays detailed information for a single payslip for the current employee.
 * It fetches the latest payslip data for the logged-in user from the backend.
 * In a real scenario, you might pass a specific payslip ID as a prop or through URL params
 * if you want to display an arbitrary payslip. For simplicity, this fetches the latest.
 */
function PaySlip() {
  const [payslip, setPayslip] = useState(null); // State to store the fetched payslip data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // IMPORTANT: Ensure this is correctly set up

  const token = localStorage.getItem('token'); // Get JWT token for authentication

  /**
   * Fetches the latest payslip for the current user from the backend API.
   * This is a simplified approach. In a more complete system, you might fetch
   * a payslip by a specific ID (e.g., from URL parameters).
   * Memoized with useCallback.
   */
  const fetchLatestPayslip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Assuming your backend has an endpoint to get the latest payslip for the authenticated user.
      // If not, you might need to adjust this endpoint (e.g., fetching all and picking the latest)
      const response = await fetch(`${API_BASE_URL}/api/payroll/my-payslips/latest`, { // Adjust endpoint as needed
        headers: authHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPayslip(data); // Assuming the backend returns a single payslip object
    } catch (err) {
      console.error("Failed to fetch payslip:", err);
      setError("Failed to load payslip details. Please try again.");
      toast.error("Failed to load payslip details.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch payslip data on component mount
  useEffect(() => {
    fetchLatestPayslip();
  }, [fetchLatestPayslip]);

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center mt-10 mb-10">
        <p className="text-gray-600">Loading payslip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center mt-10 mb-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // If no payslip data is found after loading
  if (!payslip) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center mt-10 mb-10">
        <p className="text-gray-600">No payslip found for this period.</p>
      </div>
    );
  }

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    return amount ? `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'ETB 0.00';
  };

  return (
    <Card title={`Payslip for ${payslip.payPeriodStart} - ${payslip.payPeriodEnd}`}>
      <h3>Employee Details</h3>
      <p><strong>Name:</strong> {payslip.employeeName || 'N/A'}</p> {/* Assuming employeeName is part of payslip DTO */}
      <p><strong>Position:</strong> {payslip.position || 'N/A'}</p> {/* Assuming position is part of payslip DTO */}
      <hr />
      <h3>Earnings</h3>
      <p><strong>Basic Salary:</strong> {formatCurrency(payslip.basicSalary)}</p>
      {/* Assuming other earnings like allowances are structured in the payslip DTO */}
      {payslip.allowances && Object.entries(payslip.allowances).map(([key, value]) => (
        <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {formatCurrency(value)}</p>
      ))}
      <p><strong>Total Earnings:</strong> {formatCurrency(payslip.grossPay)}</p>
      <hr />
      <h3>Deductions</h3>
      <p><strong>Income Tax:</strong> {formatCurrency(payslip.incomeTax)}</p>
      <p><strong>Pension (7%):</strong> {formatCurrency(payslip.pensionDeduction)}</p>
      {/* Assuming other deductions are structured in the payslip DTO */}
      {payslip.otherDeductions && Object.entries(payslip.otherDeductions).map(([key, value]) => (
        <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {formatCurrency(value)}</p>
      ))}
      <p><strong>Total Deductions:</strong> {formatCurrency(payslip.totalDeductions)}</p>
      <hr />
      <h3><strong>Net Pay: {formatCurrency(payslip.netPay)}</strong></h3>
    </Card>
  );
}

export default PaySlip;