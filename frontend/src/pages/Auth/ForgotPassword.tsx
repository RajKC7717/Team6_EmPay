import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import '../../styles/Auth.css';

type Step = 'phone' | 'otp' | 'reset';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendOtp = async () => {
    setError('');
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { phone });
      setSuccess('If this number is registered, an OTP has been sent.');
      setStep('otp');
      setCooldown(60);
    } catch (err: any) {
      // Don't reveal if number exists — always show same message
      setSuccess('If this number is registered, an OTP has been sent.');
      setStep('otp');
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const verifyOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const r = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp: code });
      setResetToken(r.data.resetToken || r.data.token || 'demo-token');
      setStep('reset');
      setSuccess('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token: resetToken, newPassword, confirmPassword });
      setSuccess('Password reset successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone.length >= 10 ? `+91-XXXXXX${phone.slice(-4)}` : phone;

  return (
    <div className="auth-container">
      <aside className="auth-aside">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-mark">E</div>
          EmPay HRMS
        </Link>
        <div className="auth-aside-content">
          <h1 className="auth-tagline">Reset your<br />password <span className="accent">securely</span>.</h1>
          <p className="auth-aside-desc">
            We'll send a 6-digit verification code to your registered mobile number. Enter the code to set a new password.
          </p>
          <div className="auth-aside-features">
            <div className="auth-aside-feature">6-digit OTP verification</div>
            <div className="auth-aside-feature">15-minute expiry</div>
            <div className="auth-aside-feature">3 attempts max</div>
            <div className="auth-aside-feature">Secure bcrypt hashing</div>
          </div>
        </div>
        <div className="auth-aside-foot">© 2026 EmPay HRMS. Built with care.</div>
      </aside>

      <div className="auth-pane">
        <div className="auth-card">
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['Phone', 'Verify', 'Reset'].map((label, i) => {
              const stepIdx = { phone: 0, otp: 1, reset: 2 }[step];
              const isActive = i <= stepIdx;
              return (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                    background: isActive ? 'var(--primary)' : 'var(--gray-100)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, transition: 'all 0.3s ease',
                  }}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 11, color: isActive ? 'var(--text)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 400 }}>{label}</div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <>
              <div className="auth-header">
                <h1>Forgot Password</h1>
                <p>Enter your registered mobile number to receive a verification code</p>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Mobile Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '12px 14px', background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                </div>
              </div>
              <button className="btn-primary btn-block btn-lg" onClick={sendOtp} disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <div className="auth-header">
                <h1>Enter OTP</h1>
                <p>We sent a 6-digit code to <strong>{maskedPhone}</strong></p>
              </div>
              {error && <div className="error-message">{error}</div>}
              {success && <div style={{ background: 'var(--green-50)', color: 'var(--green-600)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{success}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                      border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 10, outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif',
                      transition: 'border-color 0.2s ease',
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                {cooldown > 0 ? (
                  <span>Resend OTP in <strong style={{ color: 'var(--primary)' }}>{Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}</strong></span>
                ) : (
                  <button onClick={() => { setOtp(['','','','','','']); sendOtp(); }} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>
                )}
              </div>
              <button className="btn-primary btn-block btn-lg" onClick={verifyOtp} disabled={loading || otp.join('').length !== 6}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </>
          )}

          {/* Step 3: Reset */}
          {step === 'reset' && (
            <>
              <div className="auth-header">
                <h1>Set New Password</h1>
                <p>Create a strong password for your account</p>
              </div>
              {error && <div className="error-message">{error}</div>}
              {success && <div style={{ background: 'var(--green-50)', color: 'var(--green-600)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{success}</div>}
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" autoFocus />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPw(!showPw)} style={{ fontSize: 12, fontWeight: 600 }}>{showPw ? 'HIDE' : 'SHOW'}</button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
                {confirmPassword && confirmPassword !== newPassword && (
                  <span style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4, display: 'block' }}>Passwords don't match</span>
                )}
              </div>
              {/* Strength indicator */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map((level) => {
                    const strength = [newPassword.length >= 8, /[A-Z]/.test(newPassword), /\d/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length;
                    const colors = ['var(--red-500)', 'var(--amber-500)', 'var(--amber-400)', 'var(--green-500)'];
                    return <div key={level} style={{ flex: 1, height: 4, borderRadius: 2, background: level <= strength ? colors[strength - 1] : 'var(--gray-100)', transition: 'background 0.3s ease' }} />;
                  })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {['Weak', 'Fair', 'Good', 'Strong'][[newPassword.length >= 8, /[A-Z]/.test(newPassword), /\d/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)].filter(Boolean).length - 1] || 'Too short'}
                </div>
              </div>
              <button className="btn-primary btn-block btn-lg" onClick={resetPassword} disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </>
          )}

          <div className="auth-footer">
            <p>Remember your password? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
