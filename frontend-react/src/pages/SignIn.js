import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from '../components/Card';

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loginType, setLoginType] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any existing auth info BEFORE attempting new login
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId'); // Ensure userId is also cleared

    setLoading(true);

    const payload = {
      username: formData.email.trim(),
      password: formData.password,
    };

    try {
      const res = await fetch('http://localhost:8080/api/auth/signin', {
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

        // Store token, role, and userId
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', assignedRole);
        localStorage.setItem('userId', data.id); // <--- THIS IS THE CRUCIAL ADDITION

        // Verify if selected login type matches assigned role
        if (
          (loginType === 'admin' && assignedRole !== 'ADMIN') ||
          (loginType === 'user' && assignedRole !== 'USER')
        ) {
          toast.warning(
            `Selected login type "${loginType}" does not match your assigned role "${assignedRole}". Please use the correct login type.`,
            { autoClose: 4000, position: 'top-center' }
          );
          // Remove incorrect token and role if mismatch
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId'); // Clear userId too on mismatch
          setLoading(false);
          return;
        }

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
        {/* Toggle Login Type Buttons */}
        <div
          style={{
            marginBottom: '1rem',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          {['user', 'admin'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleLoginTypeChange(type)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loginType === type ? '#612235' : '#e0e0e0',
                color: loginType === type ? 'white' : 'black',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              {type === 'user' ? 'End User Login' : 'Admin Login'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              {loginType === 'admin' ? 'Admin Email Address' : 'User Email Address'}
            </label>
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
            {loading ? 'Signing In...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'User'}`}
          </button>
        </form>
      </Card>
    </div>
  );
}

export default SignIn;