import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your AuthProvider
import { AuthProvider } from './AuthContext'; // Adjust path if AuthContext.js is in a different directory

import Header from './components/Header';
import Footer from './components/Footer';
import useHeaderScroll from './hooks/useHeaderScroll'; // Assuming this hook exists

import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AddEmployee from './pages/AddEmployee';
import AdminPayrollManagement from './pages/AdminPayrollManagement';
import UserRoleManagement from './pages/UserRoleManagement';
import SystemSettings from './pages/SystemSettings';
import GenerateReports from './pages/GenerateReports';
import AttendanceLeaveApproval from './pages/AttendanceLeaveApproval';
import SalaryStructure from './pages/SalaryStructure';

// Employee pages
import EmployeeProfile from './pages/EmployeeProfile';
import PayrollDetails from './pages/PayrollDetails';
import LeaveApplication from './pages/LeaveApplication';
import AttendanceRecord from './pages/AttendanceRecord';
import EmployeeProfileUpdate from './pages/EmployeeProfileUpdate';
import CompanyAnnouncements from './pages/CompanyAnnouncements';
import ClockInOut from './pages/ClockInOut';
import ChangePassword from './pages/ChangePassword';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import ProtectedRoute from './components/ProtectedRoute'; // Ensure this path is correct
import { useAuth } from './AuthContext'; // Import useAuth to use within App for conditional redirects

export default function App() {
  useHeaderScroll(); // Call the custom hook

  // Use the useAuth hook to get the current authentication state
  const { isAuthenticated, userRole } = useAuth(); // Destructure from useAuth

  return (
    // Wrap your entire application with AuthProvider
    <AuthProvider> {/* The AuthProvider should wrap the Router, not be inside App itself */}
      <div className="flex flex-col min-h-screen font-inter">
        <Header /> {/* Header will now consume AuthContext */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            {/* Conditional rendering for the root path:
                If authenticated, redirect to the appropriate dashboard.
                Otherwise, show the public Home page. */}
            <Route
              path="/"
              element={
                isAuthenticated ? ( // Use isAuthenticated from AuthContext
                  userRole === 'ADMIN' ? ( // Use userRole from AuthContext
                    <Navigate to="/admin-dashboard" replace />
                  ) : (
                    <Navigate to="/employee-profile" replace />
                  )
                ) : (
                  <Home /> // This line explicitly renders the Home component when not authenticated
                )
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Dashboard Redirect: Redirects to the appropriate dashboard based on stored role */}
            {/* This route is still useful if someone directly navigates to /dashboard */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? ( // Use isAuthenticated from AuthContext
                  userRole === 'ADMIN' ? ( // Use userRole from AuthContext
                    <Navigate to="/admin-dashboard" replace />
                  ) : userRole === 'USER' ? (
                    <Navigate to="/employee-profile" replace />
                  ) : (
                    <Navigate to="/signin" replace />
                  )
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />

            {/* Protected Routes for Users and Admins (shared access) */}
            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/company-announcements" element={<CompanyAnnouncements />} />
              <Route path="/payslip" element={<div className="page-container">User Payslip Placeholder</div>} />
              <Route path="/profile" element={<div className="page-container">User Profile Placeholder</div>} />
            </Route>

            {/* Protected Routes specifically for Employees */}
            <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
              <Route path="/employee-profile" element={<EmployeeProfile />} />
              <Route path="/payroll-details" element={<PayrollDetails />} />
              <Route path="/leave-application" element={<LeaveApplication />} />
              <Route path="/attendance-record" element={<AttendanceRecord />} />
              <Route path="/employee-profile-update" element={<EmployeeProfileUpdate />} />
              <Route path="/clock-in-out" element={<ClockInOut />} />
            </Route>

            {/* Protected Routes specifically for Admins */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/add-employee" element={<AddEmployee />} />
              <Route path="/admin-payroll-management" element={<AdminPayrollManagement />} />
              <Route path="/user-role-management" element={<UserRoleManagement />} />
              <Route path="/system-settings" element={<SystemSettings />} />
              <Route path="/generate-reports" element={<GenerateReports />} />
              <Route path="/attendance-leave-approval" element={<AttendanceLeaveApproval />} />
              <Route path="/salary-structure" element={<SalaryStructure />} />
            </Route>

            {/* Catch-all fallback: Redirects any unmatched routes to the home page. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </AuthProvider>
  );
}
