import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import '../../styles/Auth.css';

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.94 10.94 0 0112 19.5C5.5 19.5 1.5 12 1.5 12a19.1 19.1 0 014.56-5.94M9.9 4.74A10.5 10.5 0 0112 4.5c6.5 0 10.5 7.5 10.5 7.5a19.18 19.18 0 01-2.56 3.56M3 3l18 18" />
    </svg>
  );

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const role = response.data.user.role;
      switch (role) {
        case 'admin': navigate('/admin'); break;
        case 'hr_officer': navigate('/hr'); break;
        case 'payroll_officer': navigate('/payroll'); break;
        case 'employee': navigate('/employee'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <aside className="auth-aside">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-mark">E</div>
          EmPay HRMS
        </Link>

        <div className="auth-aside-content">
          <h1 className="auth-tagline">
            Smart HR &<br />Payroll, <span className="accent">simplified</span>.
          </h1>
          <p className="auth-aside-desc">
            One platform for your people, payroll, attendance, taxes, and performance.
            Built for modern teams who value time.
          </p>
          <div className="auth-aside-features">
            <div className="auth-aside-feature">Auto-generated login IDs</div>
            <div className="auth-aside-feature">One-click attendance</div>
            <div className="auth-aside-feature">Resume-to-employee parser</div>
            <div className="auth-aside-feature">Built-in income tax engine</div>
          </div>
        </div>

        <div className="auth-aside-foot">© 2026 EmPay HRMS. Built with care.</div>
      </aside>

      <div className="auth-pane">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Sign in to continue to your dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="auth-footer">
            <p>New here? <Link to="/register">Register your company</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
