import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EmployeeProfile Component
 * Lists employee tasks with navigation links.
 */
function EmployeeProfile() {
  const navigate = useNavigate();

  const tasks = [
    { label: 'View Payroll Details & Payslips', path: '/payroll-details' },
    { label: 'Apply for Leave', path: '/leave-application' },
    { label: 'View Attendance Records', path: '/attendance-record' },
    { label: 'Daily Clock In/Out', path: '/clock-in-out' },
    { label: 'Update Personal Profile', path: '/employee-profile-update' },
    { label: 'View Company Announcements', path: '/company-announcements' },
    { label: 'Change Password', path: '/change-password' },
  ];

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Employee Dashboard</h2>
      <ul className="list-none p-0 space-y-3">
        {tasks.map(({ label, path }) => (
          <li
            key={path}
            onClick={() => navigate(path)}
            className="cursor-pointer list-item-card p-4 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeeProfile;
