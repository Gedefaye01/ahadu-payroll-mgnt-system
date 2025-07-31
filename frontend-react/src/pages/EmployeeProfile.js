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
 * Provides a personalized dashboard for employees, displaying a welcome message,
 * the user's profile photo, and a grid of cards for various employee-specific activities.
 */
function EmployeeProfile() {
  const navigate = useNavigate();

  // Get employee username and photo URL from localStorage.
  // Default to 'Employee' and a fallback image if not found.
  const employeeUsername = localStorage.getItem('username') || 'Employee';
  // Fallback to a default image in the public folder if userPhotoUrl is not set or invalid
  const userPhotoUrl = localStorage.getItem('userPhotoUrl') || '/default-user-avatar.png'; // Assuming a default avatar exists in your public folder

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
    <div className="page-container">
      {/* Welcome Section */}
      <div className="employee-welcome-section">
        {/* User Profile Photo */}
        <img
          src={userPhotoUrl}
          alt="User Profile"
          className="employee-profile-photo"
          // Fallback for broken image links or if userPhotoUrl is not a valid image
          onError={(e) => { e.target.onerror = null; e.target.src = '/icon.jpg'; }}
        />
        <LayoutDashboard className="employee-welcome-icon" />
        <h2 className="employee-welcome-title">Hello, {employeeUsername}!</h2>
        <p className="employee-welcome-text">Your personal dashboard for Ahadu Bank Payroll System.</p>
      </div>

      {/* Activities Grid */}
      <div className="employee-activities-grid">
        {employeeActivities.map((activity, index) => (
          <div
            key={index}
            className="employee-activity-card"
            onClick={() => navigate(activity.path)}
          >
            {activity.icon && (
              <activity.icon className="employee-activity-icon" />
            )}
            <h3 className="employee-activity-title">{activity.title}</h3>
            <p className="employee-activity-description">{activity.description}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(activity.path);
              }}
              className="btn btn-primary employee-activity-button"
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
