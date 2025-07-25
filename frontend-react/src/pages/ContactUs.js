import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Import toast for notifications

/**
 * ContactUs Component
 * Provides a form for users to send inquiries or feedback,
 * and displays company contact information (P.O. Box, telephone).
 * It uses mock state to simulate form submission.
 */
function ContactUs() {
  // State to hold the form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  /**
   * Handles changes to form input fields.
   * Updates the `formData` state based on the input's name and value.
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the form submission.
   * Prevents default form submission, logs the form data,
   * and simulates a successful submission with a toast notification.
   * In a real application, this would trigger an an API call to send the message.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // In a real application, you would send 'formData' to your backend API.
    console.log('Contact form submitted:', formData);
    toast.success('Your message has been sent successfully!'); // Use toast
    // Reset the form fields after submission
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Contact Us</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Grid for responsive layout */}
        {/* Company Contact Information Section */}
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-center items-center text-center">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Our Contact Details</h3>
          <p className="text-lg text-gray-700 mb-2">
            <strong>P.O. Box:</strong> 12345, Addis Ababa, Ethiopia
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Telephone:</strong> +251 11 234 5678
          </p>
          <p className="text-lg text-gray-700">
            <strong>Fax:</strong> +251 11 234 5679
          </p>
          <p className="text-md text-gray-600 mt-4">
            Feel free to reach out to us through the form or directly via the contact details provided.
          </p>
        </div>

        {/* Contact Form Section */}
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-lg text-gray-700 mb-6 text-center">
            Have questions or feedback? Please fill out the form below, and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            {/* Subject Input */}
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Inquiry about payroll"
                required
              />
            </div>
            {/* Message Textarea */}
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5" // Sets the visible number of lines
                placeholder="Type your message here..."
                required
              ></textarea>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
