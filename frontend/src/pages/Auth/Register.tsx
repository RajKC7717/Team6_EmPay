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

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', companyName: '', companyCode: '', phone: '', address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
            Start managing your<br />team in <span className="accent">minutes</span>.
          </h1>
          <p className="auth-aside-desc">
            Register your company and become the Admin with full control.
            Add HR, Payroll, and employees as you grow.
          </p>
          <div className="auth-aside-features">
            <div className="auth-aside-feature">No credit card required</div>
            <div className="auth-aside-feature">Free during early access</div>
            <div className="auth-aside-feature">Setup in under 2 minutes</div>
          </div>
        </div>

        <div className="auth-aside-foot">© 2026 EmPay HRMS. Built with care.</div>
      </aside>

      <div className="auth-pane">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create your company</h1>
            <p>You'll become the Admin for this workspace</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Your Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Priya Sharma"
                required
              />
            </div>
            <div className="form-group">
              <label>Work Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  minLength={8}
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
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Odoo India Pvt Ltd"
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Code</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.companyCode}
                  onChange={(e) => setFormData({ ...formData, companyCode: e.target.value.toUpperCase() })}
                  placeholder="OI"
                  required
                />
                <span className="form-hint">Used in employee login IDs (e.g. OI…)</span>
              </div>
            </div>
            <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
