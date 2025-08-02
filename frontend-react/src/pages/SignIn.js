import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext'; // Corrected import path: SignIn.js is in src/pages/, AuthContext.js is in src/context/

/**
 * SignIn Component
 * Handles user authentication, including sending credentials to the backend,
 * updating global authentication state via AuthContext,
 * and redirecting to the appropriate dashboard based on their role.
 */
function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from AuthContext
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const payload = {
      username: formData.email.trim(),
      password: formData.password,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };

      if (res.ok) {
        const backendRoles = new Set((data.roles || []).map((r) => r.toUpperCase()));
        let assignedRole = 'USER';
        if (backendRoles.has('ADMIN')) {
          assignedRole = 'ADMIN';
        }

        // Call the login function from AuthContext to update global state and localStorage
        login(data.token, assignedRole, data.id, data.username || formData.email.split('@')[0], data.profilePictureUrl);

        toast.success('Sign in successful!', {
          autoClose: 2000,
          position: 'top-center',
        });

        setTimeout(() => {
          if (assignedRole === 'ADMIN') {
            navigate('/admin-dashboard');
          } else {
            navigate('/employee-profile');
          }
        }, 300);

      } else {
        toast.error(data.message || 'Sign in failed. Check credentials.', {
          autoClose: 4000,
          position: 'top-center',
        });
      }
    } catch (err) {
      toast.error(`Network error: ${err.message}`, {
        autoClose: 3000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: 400, margin: 'auto' }}>
      <Card title="Sign In to Your Account">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SignIn;
