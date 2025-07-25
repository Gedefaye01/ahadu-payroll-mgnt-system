// src/pages/Logout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    navigate('/signin'); // 🔁 Redirect to login
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h2>Logging you out...</h2>
    </div>
  );
};

export default Logout;
