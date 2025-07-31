import React, { useState, useEffect } from 'react';
// import { NavLink } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaGlobe,
  FaArrowUp,
} from 'react-icons/fa';
import { SiTelegram } from 'react-icons/si';

const iconStyle = {
  padding: '5px',
  fontSize: '1.4rem',
  transition: 'color 0.3s ease',
  cursor: 'pointer',
};

const socialLinks = [
  {
    href: 'https://www.facebook.com/OfficialAhaduBank',
    label: 'Facebook',
    icon: <FaFacebookF />,
    color: '#3b5998',
    hoverColor: '#2d4373',
  },
  {
    href: 'https://twitter.com/AhaduBank',
    label: 'Twitter',
    icon: <FaTwitter />,
    color: '#1DA1F2',
    hoverColor: '#0d95e8',
  },
  {
    href: 'https://www.linkedin.com/company/98420836',
    label: 'LinkedIn',
    icon: <FaLinkedinIn />,
    color: '#0077b5',
    hoverColor: '#004b71',
  },
  {
    href: 'https://www.instagram.com/ahadu.bank/',
    label: 'Instagram',
    icon: <FaInstagram />,
    color: '#E4405F',
    hoverColor: '#b42a44',
  },
  {
    href: 'https://www.youtube.com/@Ahadubank',
    label: 'YouTube',
    icon: <FaYoutube />,
    color: '#FF0000',
    hoverColor: '#cc0000',
  },
  {
    href: 'https://ahadubank.com/',
    label: 'Website',
    icon: <FaGlobe />,
    color: '#0078D7',
    hoverColor: '#005a9e',
  },
  {
    href: 'https://t.me/ahadubanket',
    label: 'Telegram',
    icon: <SiTelegram />,
    color: '#0088cc',
    hoverColor: '#006699',
  },
];

function Footer() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">
          <div>
            &copy; {new Date().getFullYear()} Ahadu Bank S.C. All Rights Reserved. Developed by: Gedefaye Anteneh
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
            }}
          >
            {/* Label above social icons
            <div
              style={{
                fontWeight: '600',
                color: 'rgba(217, 225, 235, 1)',
                fontSize: '0.95rem',
                userSelect: 'none',
              }}
            >
              Follow us on our social medias:
            </div> */}

            {/* Social media icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {socialLinks.map(({ href, label, icon, color, hoverColor }, i) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  style={{
                    ...iconStyle,
                    color: hoveredIndex === i ? hoverColor : color,
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button fixed on the screen */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            ...iconStyle,
            background: '#002d5c',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            padding: '10px',
            fontSize: '1.6rem',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <FaArrowUp />
        </button>
      )}
    </>
  );
}

export default Footer;
