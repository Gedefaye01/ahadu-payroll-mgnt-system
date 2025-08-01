// src/pages/TermsOfService.js
import React from 'react';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#75073d', marginBottom: '24px' }}>Terms of Service</h1>

      <Card>
        <h3>1. Terms</h3>
        <p>By accessing the website at [Your Website URL], you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        <h3>2. Use License</h3>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Ahadu Bank's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title...</p>
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

export default TermsOfService;
