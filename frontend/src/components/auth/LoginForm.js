import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/authSlice';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to documents page if already authenticated
    if (isAuthenticated) {
      navigate('/documents');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with username:', username);
      const resultAction = await dispatch(login({ username, password }));
      console.log('Login result:', resultAction);

      if (login.fulfilled.match(resultAction)) {
        console.log('Login successful, redirecting to documents page');
      } else if (login.rejected.match(resultAction)) {
        console.error('Login failed:', resultAction.payload);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-form">
      <h2>Login to AuraRead</h2>
      {error && (
        <div className="error-message">
          <p><strong>Error:</strong> {error}</p>
          <p className="error-help">Please check your username and password and try again.</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;