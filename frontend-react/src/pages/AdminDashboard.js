import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Settings,
  FileText,
  Shield,
  CalendarCheck,
  Briefcase,
  LayoutDashboard, // For the main dashboard icon
  Megaphone, // Added for Company Announcements
  KeyRound // Added for Change Password
} from 'lucide-react';

/**
 * AdminDashboard Component
 * Provides a central hub for administrators, displaying a welcome message,
 * the user's profile photo, and a grid of cards for various administrative activities.
 */
function AdminDashboard() {
  const navigate = useNavigate();

  // Get admin username and photo URL from localStorage.
  // Default to 'Admin' and a fallback image if not found.
  const adminUsername = localStorage.getItem('username') || 'Admin';
  // Fallback to a default image in the public folder if userPhotoUrl is not set or invalid
  const userPhotoUrl = localStorage.getItem('userPhotoUrl') || '/default-user-avatar.png'; // Assuming a default avatar exists in your public folder

  // Define dashboard activities with their details
  const dashboardActivities = [
    {
      title: 'Manage Employees',
      description: 'Add, edit, and remove employee records.',
      icon: Users,
      path: '/add-employee', // Corrected path based on App.js routes
    },
    {
      title: 'Payroll Processing',
      description: 'Run payroll, generate payslips, and manage payroll cycles.',
      icon: DollarSign,
      path: '/admin-payroll-management', // Corrected path
    },
    {
      title: 'System Settings',
      description: 'Configure application-wide settings and preferences.',
      icon: Settings,
      path: '/system-settings',
    },
    {
      title: 'Generate Reports',
      description: 'Create and download various HR and payroll reports.',
      icon: FileText,
      path: '/generate-reports',
    },
    {
      title: 'User Roles & Permissions',
      description: 'Define and assign roles, manage access controls.',
      icon: Shield,
      path: '/user-role-management', // Corrected path
    },
    {
      title: 'Attendance & Leave Approvals',
      description: 'Review and approve employee attendance and leave requests.',
      icon: CalendarCheck,
      path: '/attendance-leave-approval',
    },
    {
      title: 'Salary Structure',
      description: 'Define and manage salary components, taxes, and deductions.',
      icon: Briefcase,
      path: '/salary-structure',
    },
    // Adding Change Password and Company Announcements as they were removed from Header
    {
      title: 'Company Announcements',
      description: 'View and manage company-wide announcements.',
      icon: Megaphone,
      path: '/company-announcements',
    },
    {
      title: 'Change Password',
      description: 'Change your administrator account password.',
      icon: KeyRound,
      path: '/change-password',
    },
  ];

  return (
    <div className="page-container"> {/* Uses page-container from App.css */}
      {/* Welcome Section */}
      <div className="admin-welcome-section">
        {/* User Profile Photo */}
        <img
          src={userPhotoUrl}
          alt="User Profile"
          className="admin-profile-photo"
          // Fallback for broken image links or if userPhotoUrl is not a valid image
          onError={(e) => { e.target.onerror = null; e.target.src = '/icon.jpg'; }}
        />
        <LayoutDashboard className="admin-welcome-icon" />
        <h2 className="admin-welcome-title">Welcome, {adminUsername}!</h2>
        <p className="admin-welcome-text">Your Are Responsible For Managing Ahadu Bank's
          HRMS.</p>
      </div>

      {/* Activities Grid */}
      <div className="admin-activities-grid">
        {dashboardActivities.map((activity, index) => (
          <div
            key={index}
            className="admin-activity-card"
            onClick={() => navigate(activity.path)}
          >
            {activity.icon && (
              <activity.icon className="admin-activity-icon" />
            )}
            <h3 className="admin-activity-title">{activity.title}</h3>
            <p className="admin-activity-description">{activity.description}</p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card's onClick from firing
                navigate(activity.path);
              }}
              className="btn btn-primary admin-activity-button"
            >
              Go to {activity.title.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
