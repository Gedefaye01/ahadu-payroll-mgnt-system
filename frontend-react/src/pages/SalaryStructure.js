import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * SalaryStructure Component
 * Allows administrators to manage salary components, taxes, and deductions.
 * It provides a form to add/edit components and displays them in a table.
 * It interacts with the backend API for CRUD operations on salary components.
 */
function SalaryStructure() {
  const [newComponent, setNewComponent] = useState({
    name: '',
    type: 'Earning',
    amount: '',
    isPercentage: false,
  });
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the API_BASE_URL using the environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // <--- ADD THIS LINE

  const token = localStorage.getItem('token');

  /**
   * Fetches the list of salary components from the backend API.
   * Memoized with useCallback to prevent unnecessary re-creations.
   */
  const fetchSalaryComponents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/salary-components`, { // <--- MODIFIED
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSalaryComponents(data);
    } catch (err) {
      console.error("Failed to fetch salary components:", err);
      setError("Failed to load salary components. Please try again.");
      toast.error("Failed to load salary components.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]); // Add API_BASE_URL to dependencies

  // Fetch components on component mount
  useEffect(() => {
    fetchSalaryComponents();
  }, [fetchSalaryComponents]);

  /**
   * Handles changes to form input fields.
   * Updates the `newComponent` state based on the input's name, value, and type.
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewComponent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Handles the submission of the salary component form (add or update).
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComponent.name || !newComponent.amount) {
      toast.error("Component name and amount/rate are required.");
      return;
    }

    // Use API_BASE_URL instead of hardcoded localhost
    const url = editingId
      ? `${API_BASE_URL}/api/salary-components/${editingId}` // <--- MODIFIED
      : `${API_BASE_URL}/api/salary-components`; // <--- MODIFIED

    const method = editingId ? 'PUT' : 'POST';

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify({
          ...newComponent,
          amount: String(newComponent.amount)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingId ? 'update' : 'add'} component.`);
      }

      toast.success(`Component ${editingId ? 'updated' : 'added'} successfully!`);
      setNewComponent({ name: '', type: 'Earning', amount: '', isPercentage: false });
      setEditingId(null);
      fetchSalaryComponents();
    } catch (err) {
      console.error(`Error ${editingId ? 'updating' : 'add'} component:`, err);
      toast.error(err.message || `Failed to ${editingId ? 'update' : 'add'} component.`);
    }
  };

  /**
   * Handles deleting a salary component.
   * @param {string} id - The ID of the component to delete.
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      // Use API_BASE_URL instead of hardcoded localhost
      const response = await fetch(`${API_BASE_URL}/api/salary-components/${id}`, { // <--- MODIFIED
        method: 'DELETE',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete component.");
      }

      toast.info('Component deleted successfully!');
      fetchSalaryComponents();
    } catch (err) {
      console.error("Error deleting component:", err);
      toast.error(err.message || "Failed to delete component.");
    }
  };

  /**
   * Handles initiating the edit process for a salary component.
   * Pre-fills the form with the selected component's data.
   * @param {Object} component - The component object to edit.
   */
  const handleEdit = (component) => {
    setNewComponent({
      ...component,
      amount: String(component.amount)
    });
    setEditingId(component.id);
  };

  if (loading) {
    return (
      <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading salary components...</p>
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
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Manage Salary, Taxes & Deductions</h2>

      <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{editingId ? 'Edit Component' : 'Add New Component'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="name">Component Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newComponent.name}
              onChange={handleChange}
              placeholder="e.g., Base Salary, HRA, Provident Fund"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={newComponent.type}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Earning">Earning</option>
              <option value="Deduction">Deduction</option>
              <option value="Tax">Tax</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount/Rate</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={newComponent.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPercentage"
              name="isPercentage"
              checked={newComponent.isPercentage}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isPercentage" className="ml-2 block text-sm font-medium text-gray-700">
              Is Percentage (%)
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          {editingId ? 'Update Component' : 'Add Component'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setNewComponent({ name: '', type: 'Earning', amount: '', isPercentage: false });
            }}
            className="btn btn-secondary w-full mt-2"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h3 className="text-xl font-semibold text-gray-700 mb-4">Defined Salary Components</h3>
      {salaryComponents.length === 0 ? (
        <p className="text-center text-gray-500">No salary components defined yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Amount/Rate</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaryComponents.map(comp => (
                <tr key={comp.id}>
                  <td>{comp.id}</td>
                  <td>{comp.name}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      comp.type === 'Earning' ? 'bg-green-100 text-green-800' :
                      comp.type === 'Deduction' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {comp.type}
                    </span>
                  </td>
                  <td>
                    {comp.amount} {comp.isPercentage ? '%' : ''}
                  </td>
                  <td className="table-actions text-center">
                    <button
                      onClick={() => handleEdit(comp)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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

export default SalaryStructure;