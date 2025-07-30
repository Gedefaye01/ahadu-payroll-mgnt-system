import React, { useState } from 'react';
import Card from '../components/Card';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const validRoles = ['USER', 'ADMIN'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validRoles.includes(role)) {
      toast.error('Please select a valid role', { position: 'top-center', autoClose: 3000 });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { position: 'top-center', autoClose: 3000 });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        roles: [role.trim()],
      };

      console.log('[DEBUG] Signup payload:', payload);

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      const responseBody = contentType && contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (res.ok) {
        toast.success(
          responseBody.message || `User registered successfully with role: ${role}`,
          { position: 'top-center', autoClose: 3000 }
        );

        // Reset form on success
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('');
      } else {
        toast.error(responseBody.message || responseBody || 'Signup failed', {
          position: 'top-center',
          autoClose: 4000,
        });
      }
    } catch (err) {
      toast.error(`Error: ${err.message}`, { position: 'top-center', autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: 400, margin: 'auto' }}>
      <Card title="Create a New Account">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">-- Select Role --</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default SignUp;
