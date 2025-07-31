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
 * Provides a central hub for administrators, displaying a welcome message,
 * the user's profile photo, and a grid of cards for various administrative activities.
 */
function AdminDashboard() {
  const navigate = useNavigate();

  // Get admin username and photo URL from localStorage.
  // Default to 'Admin' and a placeholder image if not found.
  const adminUsername = localStorage.getItem('username') || 'Admin';
  const userPhotoUrl = localStorage.getItem('userPhotoUrl') || 'https://placehold.co/100x100/E0F2F7/000000?text=User';

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
    <div className="page-container"> {/* Removed inline styling classes */}
      {/* Welcome Section */}
      <div className="admin-welcome-section">
        {/* User Profile Photo */}
        <img
          src={userPhotoUrl}
          alt="User Profile"
          className="admin-profile-photo" // Class for the photo, consistent with employee-profile
          // Fallback for broken image links
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/E0F2F7/000000?text=User'; }}
        />
        <LayoutDashboard className="admin-welcome-icon" />
        <h2 className="admin-welcome-title">Welcome, {adminUsername}!</h2>
        <p className="admin-welcome-text">Your Are Resposible For Managing Ahadu Bank's HR System.</p>
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
                e.stopPropagation();
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
