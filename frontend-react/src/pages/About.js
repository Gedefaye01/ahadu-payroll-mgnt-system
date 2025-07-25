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
        About Ahadu Bank HR Portal & Payroll System
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
          At Ahadu Bank, our mission is to empower our employees by providing a seamless, efficient,
          and transparent Human Resources experience. We believe that our people are our greatest asset,
          and this HR portal is designed to support their professional growth and well-being.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We strive to create an environment where every employee feels valued, supported, and equipped
          with the tools they need to succeed, contributing to the overall success of Ahadu Bank.
        </p>
      </section>

      {/* Our Values Section */}
      <section className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Our Values</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>Integrity:</strong> Upholding the highest ethical standards in all HR practices.</li>
          <li><strong>Transparency:</strong> Ensuring clear and open communication regarding policies and procedures.</li>
          <li><strong>Employee-Centric:</strong> Prioritizing the needs and development of our employees.</li>
          <li><strong>Innovation:</strong> Continuously improving our HR systems and services.</li>
          <li><strong>Excellence:</strong> Committing to superior service delivery and operational efficiency.</li>
        </ul>
      </section>

      {/* What We Offer Section */}
      <section className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">What We Offer</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          This portal offers a comprehensive suite of HR services, including:
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
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Legal</h3>
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
