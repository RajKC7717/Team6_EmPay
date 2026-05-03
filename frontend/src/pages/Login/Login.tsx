import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import api from '../../api';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.login-card', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.login-header > *', {
      y: 15,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2')
    .from('.form-group', {
      x: -15,
      opacity: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2')
    .from('.login-btn', {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      ease: 'back.out(1.5)'
    }, '-=0.1');
  }, { scope: containerRef });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
      // Shake animation on error
      gsap.fromTo('.login-card', 
        { x: -10 },
        { x: 10, duration: 0.1, yoyo: true, repeat: 5, clearProps: 'x' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" ref={containerRef}>
      <div className="login-card card-minimal">
        <div className="login-header">
          <div className="login-logo">EmPay</div>
          <h2>Welcome Back</h2>
          <p>Enter your email or Login ID to access your account.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="loginId">Email or Login ID</label>
            <input
              type="text"
              id="loginId"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com or TCNV01ABCD20260001"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-minimal btn-primary-minimal login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
