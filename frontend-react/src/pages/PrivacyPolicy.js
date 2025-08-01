// src/pages/PrivacyPolicy.js
import React from 'react';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#75073d', marginBottom: '24px' }}>Privacy Policy</h1>

      <Card>
        <p>Your privacy is important to us. It is Ahadu Bank's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
      </Card>

      <Card style={{ marginTop: '40px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => navigate('/about')}
          style={{
            backgroundColor: '#75073d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          aria-label="Back to About page"
        >
          ← Back to About
        </button>
      </Card>
    </div>
  );
}

export default PrivacyPolicy;
