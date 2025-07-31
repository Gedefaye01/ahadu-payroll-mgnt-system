import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Card from '../components/Card'; // Assuming this component exists and is correctly imported

/**
 * EmployeeList Component
 * Displays a list of employees fetched from the backend.
 * Allows navigation to add a new employee, view an employee's payslips,
 * and includes placeholder actions for editing and deleting employees.
 */
function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem('token'); // Get the authentication token

  /**
   * Fetches the list of all employees from the backend API.
   * Memoized with useCallback to prevent unnecessary re-creations.
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Assuming a backend endpoint to fetch all users/employees
      const response = await fetch(`${API_BASE_URL}/api/users`, { // Adjust endpoint if different (e.g., /api/employees)
        headers: authHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Filter to only show users with 'USER' role if this list is specifically for employees
      // Or display all users if it's a general user management list
      const filteredEmployees = data.filter(user => user.roles && user.roles.includes('USER')); // Assuming roles are strings like "USER" or "ADMIN"
      setEmployees(filteredEmployees); // Or setEmployees(data) if you want all users
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employee list. Please try again.");
      toast.error("Failed to load employee list.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /**
   * Navigates to the Add Employee page.
   */
  const handleAddEmployee = () => {
    navigate('/add-employee'); // Assuming this is the route for adding an employee
  };

  /**
   * Navigates to the Payroll Details page for a specific employee.
   * @param {string} employeeId - The ID of the employee.
   */
  const handleViewPayslips = (employeeId) => {
    // Navigate to PayrollDetails page, passing employeeId as a query parameter
    navigate(`/payroll-details?employeeId=${employeeId}`);
  };

  /**
   * Placeholder for editing an employee.
   * In a real app, this would navigate to an edit form or open a modal.
   * @param {string} employeeId - The ID of the employee to edit.
   */
  const handleEditEmployee = (employeeId) => {
    toast.info(`Simulating edit for employee ID: ${employeeId}`);
    // navigate(`/edit-employee/${employeeId}`); // Example navigation to an edit page
  };

  /**
   * Placeholder for deleting an employee.
   * In a real app, this would trigger an API call to delete the employee
   * and then refresh the list.
   * @param {string} employeeId - The ID of the employee to delete.
   */
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm(`Are you sure you want to delete employee ID: ${employeeId}?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${employeeId}`, { // Assuming DELETE /api/users/{id}
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success(`Employee ID: ${employeeId} deleted successfully.`);
        fetchEmployees(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete employee:", err);
        toast.error(`Failed to delete employee: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading employee list...</p>
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
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-header" style={{ marginBottom: '0' }}>Employee List</h1>
        <button className="btn btn-primary" onClick={handleAddEmployee}>Add Employee</button>
      </div>
      <div className="table-container">
        {employees.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No employees found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th> {/* Added Email column */}
                <th>Position</th> {/* Assuming 'position' can be derived or stored */}
                <th>Monthly Salary</th> {/* Assuming 'baseSalary' from User model */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.username}</td> {/* Displaying username from backend */}
                  <td>{emp.email}</td>
                  <td>{emp.position || 'N/A'}</td> {/* You might need to add 'position' to your User model */}
                  <td>{emp.baseSalary ? `ETB ${emp.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</td>
                  <td className="table-actions">
                    <button
                      className="btn btn-secondary text-indigo-600"
                      onClick={() => handleViewPayslips(emp.id)}
                    >
                      Payslips
                    </button>
                    <button
                      className="btn btn-secondary text-indigo-600"
                      onClick={() => handleEditEmployee(emp.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary text-red-600"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export default EmployeeList;
