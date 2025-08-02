import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../components/Card'; // Assuming this component exists and is correctly imported

/**
 * SignIn Component
 * Handles user authentication, including sending credentials to the backend,
 * storing user data (token, role, userId, username, photo URL) in localStorage,
 * and redirecting to the appropriate dashboard based on their role.
 * The login screen is now unified, without separate Admin/User toggles.
 */
function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any existing auth info BEFORE attempting new login
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userPhotoUrl');

    setLoading(true);

    const payload = {
      username: formData.email.trim(), // Assuming backend expects email as 'username' for signin
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

        // Store token, role, userId, username, and profilePictureUrl
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', assignedRole);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('username', data.username || formData.email.split('@')[0]);
        localStorage.setItem('userPhotoUrl', data.profilePictureUrl || '');

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
        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label> {/* Simplified label */}
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
            {loading ? 'Signing In...' : 'Sign In'} {/* Simplified button text */}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SignIn;
