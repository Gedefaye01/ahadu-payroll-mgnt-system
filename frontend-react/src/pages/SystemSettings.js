import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS

/**
 * SystemSettings Component
 * Allows administrators to configure system-wide settings with a form.
 * It now includes password policy, login attempt limits, and session timeout settings.
 * Simulates API calls for fetching and saving settings.
 * All styling is now handled via external CSS classes (e.g., in App.css).
 */
function SystemSettings() {
  // State to hold the current system settings
  const [settings, setSettings] = useState({
    payrollCycle: 'Monthly',
    taxRate: 15,
    emailNotifications: true,
    dataRetentionDays: 365,
    // New security-related settings with updated defaults
    minPasswordLength: 6, // Updated default
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecialChar: false,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 10, // Updated default
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching settings from a backend API on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real application, replace this with an actual fetch call:
        // const response = await fetch('/api/settings', {
        //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        // });
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // setSettings(data);

        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Mock data if no real API is connected yet
        const mockData = {
          payrollCycle: 'Monthly',
          taxRate: 15,
          emailNotifications: true,
          dataRetentionDays: 365,
          minPasswordLength: 6, // Updated default in mock data
          requireUppercase: true,
          requireLowercase: true,
          requireDigit: true,
          requireSpecialChar: false,
          maxLoginAttempts: 5,
          lockoutDurationMinutes: 30,
          sessionTimeoutMinutes: 10, // Updated default in mock data
        };
        setSettings(mockData);
        toast.info('Settings loaded successfully!');
      } catch (err) {
        setError('Failed to load settings: ' + err.message);
        toast.error('Failed to load settings!');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /**
   * Handles changes to form input fields.
   * Updates the `settings` state based on the input's name, value, and type (for checkboxes).
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Handles saving the system settings.
   * Simulates an API call to persist the settings.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSaveSettings = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(null);
    try {
      // In a real application, you would send 'settings' data to your backend API:
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(settings),
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving settings:', settings);
      toast.success('System settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
      toast.error('Failed to save settings!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container loading-state">
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container error-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <h2 className="heading-primary">Configure System Settings</h2>

      {/* System Settings Form */}
      <form onSubmit={handleSaveSettings} className="settings-form">
        <div className="form-grid">
          {/* Payroll Cycle Select */}
          <div className="form-group">
            <label htmlFor="payrollCycle">Payroll Cycle</label>
            <select
              id="payrollCycle"
              name="payrollCycle"
              value={settings.payrollCycle}
              onChange={handleChange}
              className="input-field select-field"
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
              className="input-field"
            />
          </div>
          {/* Email Notifications Checkbox */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor="emailNotifications" className="checkbox-label">
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
              className="input-field"
            />
          </div>
        </div>

        {/* --- Password Policy Enforcement --- */}
        <h3 className="heading-secondary">Password Policy</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="minPasswordLength">Minimum Password Length</label>
            <input
              type="number"
              id="minPasswordLength"
              name="minPasswordLength"
              value={settings.minPasswordLength}
              onChange={handleChange}
              min="6"
              max="30"
              className="input-field"
            />
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="requireUppercase"
              name="requireUppercase"
              checked={settings.requireUppercase}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor="requireUppercase" className="checkbox-label">
              Require Uppercase Character
            </label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="requireLowercase"
              name="requireLowercase"
              checked={settings.requireLowercase}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor="requireLowercase" className="checkbox-label">
              Require Lowercase Character
            </label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="requireDigit"
              name="requireDigit"
              checked={settings.requireDigit}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor="requireDigit" className="checkbox-label">
              Require Digit
            </label>
          </div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="requireSpecialChar"
              name="requireSpecialChar"
              checked={settings.requireSpecialChar}
              onChange={handleChange}
              className="checkbox-input"
            />
            <label htmlFor="requireSpecialChar" className="checkbox-label">
              Require Special Character
            </label>
          </div>
        </div>

        {/* --- Login Attempt Limits --- */}
        <h3 className="heading-secondary">Login Security</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="maxLoginAttempts">Max Login Attempts (before lockout)</label>
            <input
              type="number"
              id="maxLoginAttempts"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
              min="1"
              max="10"
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lockoutDurationMinutes">Account Lockout Duration (minutes)</label>
            <input
              type="number"
              id="lockoutDurationMinutes"
              name="lockoutDurationMinutes"
              value={settings.lockoutDurationMinutes}
              onChange={handleChange}
              min="1"
              max="1440" // Max 24 hours
              className="input-field"
            />
          </div>
        </div>

        {/* --- Session Timeout Configuration --- */}
        <h3 className="heading-secondary">Session Management</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</label>
            <input
              type="number"
              id="sessionTimeoutMinutes"
              name="sessionTimeoutMinutes"
              value={settings.sessionTimeoutMinutes}
              onChange={handleChange}
              min="10"
              max="480" // Max 8 hours
              className="input-field"
            />
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          type="submit"
          className="button-primary"
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default SystemSettings;
