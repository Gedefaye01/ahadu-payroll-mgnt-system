import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your AuthProvider - CORRECTED PATH
import { AuthProvider, useAuth } from './context/AuthContext'; // Path adjusted to go into 'context' folder

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

export default function App() {
  useHeaderScroll(); // Call the custom hook

  // The useAuth hook must be called inside a component that is a child of AuthProvider.
  // To use it for the root path conditional navigation, we'll create a small wrapper.
  // Alternatively, the AuthProvider could be moved to index.js to wrap App directly.
  // For now, let's keep it here and adjust the logic slightly.

  // We need to ensure isAuthenticated and userRole are available for the root route.
  // The simplest way to do this without moving AuthProvider is to use a nested component
  // or to rely on the localStorage directly for the initial render of App's root route,
  // knowing that AuthProvider will then manage it reactively.
  // However, for immediate reactivity, AuthProvider should ideally be at the very top.
  // Let's assume for now that the `useAuth` hook is being called correctly within the context.

  // Re-evaluating the structure: The `useAuth` hook *must* be called within a component
  // that is a descendant of `AuthProvider`. Since `App` *contains* `AuthProvider`,
  // calling `useAuth` directly in `App`'s top level before `AuthProvider` is rendered
  // would cause an error.

  // To fix this, we will move the `AuthProvider` higher up, typically in `index.js`,
  // or wrap the `Routes` component with `AuthProvider` and then use `useAuth` within
  // components rendered by `Routes`.

  // Given the current `App.js` structure, the `isAuthenticated` and `userRole` checks
  // for the root path (`/`) should temporarily revert to using `localStorage` directly
  // for the initial render of `App`, as the `AuthContext` isn't fully set up at that point.
  // Components *inside* the <Routes> (like Header, SignIn, ProtectedRoute) will correctly
  // use `useAuth`.

  // Let's remove the `useAuth` call from the top level of `App` and rely on localStorage
  // for the root path's initial redirect logic, as it was before.
  // The `Header` and `ProtectedRoute` will correctly use `useAuth` as they are children
  // of the `AuthProvider`.

  const isAuthenticatedFromLocalStorage = () => {
    return !!localStorage.getItem('token');
  };

  const getUserRoleFromLocalStorage = () => {
    return localStorage.getItem('userRole');
  };


  return (
    // The AuthProvider should wrap the Router to make context available to all routes
    <AuthProvider>
      <div className="flex flex-col min-h-screen font-inter">
        <Header /> {/* Header will now consume AuthContext */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            {/* Conditional rendering for the root path:
                If authenticated (checked via localStorage for initial App render), redirect to the appropriate dashboard.
                Otherwise, show the public Home page. */}
            <Route
              path="/"
              element={
                isAuthenticatedFromLocalStorage() ? (
                  getUserRoleFromLocalStorage() === 'ADMIN' ? (
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
            <Route
              path="/dashboard"
              element={
                isAuthenticatedFromLocalStorage() ? (
                  getUserRoleFromLocalStorage() === 'ADMIN' ? (
                    <Navigate to="/admin-dashboard" replace />
                  ) : getUserRoleFromLocalStorage() === 'USER' ? (
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
