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
  LayoutDashboard // For the main dashboard icon
} from 'lucide-react';

/**
 * AdminDashboard Component
 * Provides a central hub for administrators, displaying a welcome message
 * and a grid of cards for various administrative activities.
 */
function AdminDashboard() {
  const navigate = useNavigate();

  // Get admin username from localStorage, default to 'Admin' if not found
  const adminUsername = localStorage.getItem('username') || 'Admin';

  // Define dashboard activities with their details
  const dashboardActivities = [
    {
      title: 'Manage Employees',
      description: 'Add, edit, and remove employee records.',
      icon: Users,
      path: '/manage-employees',
    },
    {
      title: 'Payroll Processing',
      description: 'Run payroll, generate payslips, and manage payroll cycles.',
      icon: DollarSign,
      path: '/process-payroll',
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
      path: '/manage-roles',
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
  ];

  return (
    <div className="page-container p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md min-h-screen">
      {/* Welcome Section */}
      <div className="admin-welcome-section"> {/* Corrected: Removed curly braces around string */}
        <LayoutDashboard className="admin-welcome-icon" /> {/* Corrected: Removed curly braces around string */}
        <h2 className="admin-welcome-title">Welcome, {adminUsername}!</h2>
        <p className="admin-welcome-text">Your central hub for managing Ahadu Payroll System.</p>
      </div>

      {/* Activities Grid */}
      <div className="admin-activities-grid"> {/* Corrected: Removed curly braces around string */}
        {dashboardActivities.map((activity, index) => (
          <div
            key={index}
            className="admin-activity-card" // Corrected: Removed curly braces around string
            onClick={() => navigate(activity.path)}
          >
            {activity.icon && (
              <activity.icon className="admin-activity-icon" /> // Corrected: Removed curly braces around string
            )}
            <h3 className="admin-activity-title">{activity.title}</h3>
            <p className="admin-activity-description">{activity.description}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(activity.path);
              }}
              className="btn btn-primary admin-activity-button" // Corrected: Removed curly braces around string
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