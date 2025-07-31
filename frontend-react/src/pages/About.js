import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card'; // Assuming Card component exists

/**
 * About Component
 * Provides comprehensive information about Ahadu Bank's HR Portal and Payroll Management System,
 * including its mission, values, key offerings, and links to legal documents.
 */
function About() {
  const navigate = useNavigate();

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="page-header text-3xl font-bold text-center text-gray-800 mb-8">
        About Ahadu Bank HRMS Portal
      </h1>

      {/* Main Introduction Card */}
      <Card>
        <p className="text-lg leading-relaxed text-gray-700">
          Ahadu Bank's Payroll Management System is a secure, efficient, and user-friendly solution designed to handle all aspects of payroll operations.
          It simplifies employee management, automates salary calculations, ensures compliance with local regulations, and provides easy payslip access.
          Our goal is to support financial clarity and operational excellence for Ethiopian businesses through smart payroll technology.
        </p>
      </Card>

      {/* Our Mission Section */}
      <section className="mt-8 mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Our Mission</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          At Ahadu Bank, Our purpose is to Pioneer avant-garde financial services for promoting the economic welfare of Ethiopians.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Our vision is to take a lead role in the financial sector, in 2025 E.C , in support of the aspirations of the citizenry and the country.
        </p>
      </section>

      {/* Our Values Section */}
      <section className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Our Values</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>Fear of God :-</strong> Respecting divine principles in all actions.</li>
          <li><strong>Passion for Serving :-</strong> Committed to helping others with energy and care.</li>
          <li><strong>Honesty :-</strong> Always being truthful and transparent.</li>
          <li><strong>Organizational Learning :-</strong> Continuously improving through learning and innovation.</li>
          <li><strong>Proactive Accountability :-</strong> Taking responsibility and acting before problems arise.</li>
          <li><strong>Humaneness :-</strong> Treating everyone with kindness and dignity.</li>
        </ul>
      </section>

      {/* What We Offer Section */}
      <section className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">What We Offer</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          This portal offers a comprehensive suite of HRMS services, including:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Personalized Payroll Details & Payslip Access</li>
          <li>Streamlined Leave Application & Tracking</li>
          <li>Accurate Attendance Record Management</li>
          <li>Easy Personal Profile Updates</li>
          <li>Timely Company Announcements</li>
          <li>Robust Admin Tools for Payroll, Employee, and Role Management</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          We are dedicated to fostering a productive and positive work environment for all Ahadu Bank employees.
        </p>
      </section>

      {/* Legal Section */}
      <Card className="mt-10 text-center">
        {/* <h3 className="text-2xl font-semibold text-gray-700 mb-4">Legal</h3> */}
        <div className="flex justify-center gap-6">
          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="btn btn-primary"
            aria-label="Navigate to Privacy Policy"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => navigate('/terms')}
            className="btn btn-primary"
            aria-label="Navigate to Terms of Service"
          >
            Terms of Service
          </button>
        </div>
      </Card>
    </div>
  );
}

export default About;
