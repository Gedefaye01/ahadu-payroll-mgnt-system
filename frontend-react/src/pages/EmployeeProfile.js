import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  CalendarPlus,
  ClipboardCheck,
  Clock,
  UserCog,
  Megaphone,
  KeyRound,
  LayoutDashboard
} from 'lucide-react';

/**
 * EmployeeProfile Component
 * Provides a personalized dashboard for employees, displaying a welcome message
 * and a grid of cards for various employee-specific activities.
 */
function EmployeeProfile() {
  const navigate = useNavigate();

  // Get employee username from localStorage, default to 'Employee' if not found
  const employeeUsername = localStorage.getItem('username') || 'Employee';

  // Define employee activities with their details
  const employeeActivities = [
    {
      title: 'View Payroll Details',
      description: 'Access your payslips and detailed payroll information.',
      icon: Wallet,
      path: '/payroll-details',
    },
    {
      title: 'Apply for Leave',
      description: 'Submit new leave requests and track their status.',
      icon: CalendarPlus,
      path: '/leave-application',
    },
    {
      title: 'View Attendance',
      description: 'Review your historical attendance records.',
      icon: ClipboardCheck,
      path: '/attendance-record',
    },
    {
      title: 'Daily Clock In/Out',
      description: 'Record your daily work attendance times.',
      icon: Clock,
      path: '/clock-in-out',
    },
    {
      title: 'Update Profile',
      description: 'Edit your personal and emergency contact information.',
      icon: UserCog,
      path: '/employee-profile-update',
    },
    {
      title: 'Company Announcements',
      description: 'Stay updated with the latest company news and notices.',
      icon: Megaphone,
      path: '/company-announcements',
    },
    {
      title: 'Change Password',
      description: 'Update your account password for security.',
      icon: KeyRound,
      path: '/change-password',
    },
  ];

  return (
    <div className="page-container p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md min-h-screen">
      {/* Welcome Section */}
      <div className="employee-welcome-section"> {/* Corrected: Removed curly braces around string */}
        <LayoutDashboard className="employee-welcome-icon" /> {/* Corrected: Removed curly braces around string */}
        <h2 className="employee-welcome-title">Hello, {employeeUsername}!</h2>
        <p className="employee-welcome-text">Your personal dashboard for Ahadu Payroll System.</p>
      </div>

      {/* Activities Grid */}
      <div className="employee-activities-grid"> {/* Corrected: Removed curly braces around string */}
        {employeeActivities.map((activity, index) => (
          <div
            key={index}
            className="employee-activity-card" // Corrected: Removed curly braces around string
            onClick={() => navigate(activity.path)}
          >
            {activity.icon && (
              <activity.icon className="employee-activity-icon" /> // Corrected: Removed curly braces around string
            )}
            <h3 className="employee-activity-title">{activity.title}</h3>
            <p className="employee-activity-description">{activity.description}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(activity.path);
              }}
              className="btn btn-primary employee-activity-button" // Corrected: Removed curly braces around string
            >
              Go to {activity.title.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeProfile;