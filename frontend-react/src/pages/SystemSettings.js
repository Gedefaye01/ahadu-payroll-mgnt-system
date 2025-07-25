import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * SystemSettings Component
 * Allows administrators to configure system-wide settings with a form.
 * It uses mock state to simulate saving settings.
 */
function SystemSettings() {
  // State to hold the current system settings
  const [settings, setSettings] = useState({
    payrollCycle: 'Monthly',
    taxRate: 15,
    emailNotifications: true,
    dataRetentionDays: 365
  });

  /**
   * Handles changes to form input fields.
   * Updates the `settings` state based on the input's name, value, and type (for checkboxes).
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Handle checkbox 'checked' property
    }));
  };

  /**
   * Handles saving the system settings.
   * Simulates an API call to persist the settings.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSaveSettings = (e) => {
    e.preventDefault(); // Prevent default form submission
    // In a real application, you would send 'settings' data to your backend API.
    console.log('Saving settings:', settings);
    toast.success('System settings saved successfully!'); // Use toast
  };

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Configure System Settings</h2>

      {/* System Settings Form */}
      <form onSubmit={handleSaveSettings} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Payroll Cycle Select */}
          <div className="form-group">
            <label htmlFor="payrollCycle">Payroll Cycle</label>
            <select
              id="payrollCycle"
              name="payrollCycle"
              value={settings.payrollCycle}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Monthly">Monthly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          {/* Default Tax Rate Input */}
          <div className="form-group">
            <label htmlFor="taxRate">Default Tax Rate (%)</label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={settings.taxRate}
              onChange={handleChange}
              min="0" // Minimum value
              max="100" // Maximum value
            />
          </div>
          {/* Email Notifications Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm font-medium text-gray-700">
              Enable Email Notifications
            </label>
          </div>
          {/* Data Retention Days Input */}
          <div className="form-group">
            <label htmlFor="dataRetentionDays">Data Retention (Days)</label>
            <input
              type="number"
              id="dataRetentionDays"
              name="dataRetentionDays"
              value={settings.dataRetentionDays}
              onChange={handleChange}
              min="30" // Minimum retention days
            />
          </div>
        </div>
        {/* Save Settings Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default SystemSettings;
