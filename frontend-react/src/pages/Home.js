import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Card from '../components/Card'; // Assuming Card component exists
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

/**
 * CustomArrow Component
 * Provides custom styling for the react-slick carousel navigation arrows.
 * Styles are defined in app.css.
 */
function CustomArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} slick-arrow-custom`} // Apply custom class for styling
      style={{ ...style, display: 'block' }} // Keep display block for functionality
      onClick={onClick}
    />
  );
}

/**
 * Home Component
 * Represents the landing page of the application, featuring an image carousel,
 * key features, and calls to action.
 */
function Home() {
  const images = [
    '/ahadu1.jpg',
    '/ahadu2.jpg',
    '/ahadu3.jpg',
    '/ahadu4.jpg',
    '/ahadu4.jpg', // Duplicate, consider unique images
    '/ahadu6.jpg',
    '/ahadu7.jpeg',
    '/ahadu9.jpg',
    '/ahadu10.jpg',
    '/ahadu1.jpg', // Duplicate
    '/ahadu1.jpg', // Duplicate
    '/ahadu9.jpg', // Duplicate
  ]; // All these images should be placed in your /public folder

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    nextArrow: <CustomArrow />,
    prevArrow: <CustomArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="page-container p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Page Title */}
      <h1 className="home-page-title text-center mb-8">
        Welcome to Ahadu Bank's Modern HRMS Portal
      </h1>

      {/* Auto-Scroll Image Carousel */}
      <div className="carousel-container mb-12"> {/* Added a container for consistency */}
        <Slider {...settings}>
          {images.map((imgSrc, index) => (
            <div key={index} className="carousel-slide-item"> {/* Added class for padding */}
              <img
                src={imgSrc}
                alt={`slide-${index}`}
                className="carousel-image" // Custom class for image styling
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/cccccc/333333?text=Image+Not+Found"; }} // Fallback
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Features Section */}
      <section className="features-section mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Key Features</h2>
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <Card title="Manage Employees">
            <p>Easily add, view, and update employee information in a centralized database.</p>
          </Card>
          {/* Feature Card 2 */}
          <Card title="Process Payroll">
            <p>Run payroll accurately and on time with our automated calculation engine.</p>
          </Card>
          {/* Feature Card 3 */}
          <Card title="Generate Reports">
            <p>Get insightful reports, including payslips and summary documents, at the click of a button.</p>
          </Card>
          {/* Feature Card 4 */}
          <Card title="Employee Self-Service">
            <p>Access your payslips, apply for leave, and update personal information anytime, anywhere.</p>
          </Card>
          {/* Feature Card 5 */}
          <Card title="Secure & Scalable">
            <p>Robust security features and a scalable architecture to grow with your organization.</p>
          </Card>
          {/* Feature Card 6 */}
          <Card title="Announcements & Communication">
            <p>Keep employees informed with company-wide announcements and internal communications.</p>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section text-center p-12 bg-indigo-100 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Optimize Your HR?</h2>
        <p className="text-lg text-gray-700 max-w-xl mx-auto mb-8">
          Join Ahadu Bank HR Portal today and transform your human resource management.
        </p>
        <Link to="/signup" className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-md shadow-lg">
          Get Started Now
        </Link>
      </section>
    </div>
  );
}

export default Home;
