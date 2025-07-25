import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h2>Admin Dashboard</h2>
      <ul>
        <li onClick={() => navigate('/manage-employees')}>Add/Edit/Delete Employees</li>
        <li onClick={() => navigate('/process-payroll')}>Manage Payroll Processing</li>
        <li onClick={() => navigate('/system-settings')}>Configure System Settings</li>
        <li onClick={() => navigate('/generate-reports')}>Generate Reports</li>
        <li onClick={() => navigate('/manage-roles')}>Manage User Roles & Permissions</li>
        <li onClick={() => navigate('/attendance-leave-approval')}>Oversee Attendance & Leave Approvals</li>
        <li onClick={() => navigate('/salary-structure')}>Manage Salary, Taxes & Deductions</li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
