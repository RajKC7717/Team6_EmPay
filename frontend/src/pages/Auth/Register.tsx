import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import { fileToDataUrl, setCompanyLogo, setCompanyName } from '../../utils/companyBranding';
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', companyName: '', companyCode: '', phone: '', address: '',
  });
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setLogoError('File exceeds 2MB limit.'); return; }
    if (!/(image\/png|image\/jpeg|image\/svg\+xml)/.test(file.type)) {
      setLogoError('Only PNG, JPG or SVG accepted.');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoDataUrl(dataUrl);
    } catch {
      setLogoError('Could not read the image.');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      // Persist branding locally so dashboards can show it.
      if (logoDataUrl) setCompanyLogo(logoDataUrl);
      setCompanyName(formData.companyName);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    setError('');
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) { setError('All fields are required'); return; }
      if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    }
    if (step === 2) {
      if (!formData.companyName || !formData.companyCode) { setError('Company name and code are required'); return; }
    }
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const goBack = () => setStep((s) => Math.max(1, (s as number) - 1) as 1 | 2 | 3);

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
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: step >= s ? 'var(--primary)' : 'var(--gray-200)',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>
            <h1>{step === 1 ? 'Your account' : step === 2 ? 'Company details' : 'Branding'}</h1>
            <p>{step === 1 ? 'You\'ll become the Admin' : step === 2 ? 'Tell us about your company' : 'Optional — add a logo'}</p>
          </div>

          {error && <div className="error-message" style={{ marginBottom: 14 }}>{error}</div>}

          {step === 1 && (
            <div className="auth-form">
              <div className="form-group">
                <label>Your Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Priya Sharma"
                />
              </div>
              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
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
              <button className="btn-primary btn-block btn-lg" onClick={goNext}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Odoo India Pvt Ltd"
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
                  />
                  <span className="form-hint">Used in employee login IDs (e.g. OI…)</span>
                </div>
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label>Address (optional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Bangalore, India"
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={goBack}>← Back</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={goNext}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="auth-form">
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 14,
                padding: 28,
                textAlign: 'center',
                background: 'var(--gray-50)',
              }}>
                {logoDataUrl ? (
                  <>
                    <img src={logoDataUrl} alt="Logo preview" style={{ maxHeight: 100, maxWidth: 200, marginBottom: 14 }} />
                    <div>
                      <button className="btn-secondary btn-sm" onClick={() => setLogoDataUrl(null)}>Remove</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 38, marginBottom: 8 }}>📤</div>
                    <label style={{ display: 'inline-block', cursor: 'pointer' }}>
                      <input type="file" accept="image/png,image/jpeg,image/svg+xml" hidden onChange={handleLogoChange} />
                      <span className="btn-primary btn-sm">Choose Logo</span>
                    </label>
                    <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>
                      PNG, JPG or SVG · Recommended 200×200 · Max 2MB
                    </p>
                  </>
                )}
                {logoError && <div className="alert alert-error" style={{ marginTop: 14 }}>{logoError}</div>}
              </div>
              <div className="form-hint" style={{ textAlign: 'center', marginTop: 8 }}>
                You can skip this and add a logo later from Settings.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button className="btn-secondary" onClick={goBack}>← Back</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit()} disabled={loading}>
                  {loading ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
