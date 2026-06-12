import { useState } from 'react';
import Particles3D from './Particles3D';

export default function Hero({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError(false);
    setPasswordError(false);

    if (!email.trim()) {
      setEmailError(true);
      showError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError(true);
      showError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setPasswordError(true);
      showError('Please enter your password.');
      return;
    }
    if (password.trim().length < 3) {
      setPasswordError(true);
      showError('Password must be at least 3 characters.');
      return;
    }

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        showError(data.message || 'Authentication failed.');
        return;
      }

      // Store token and trigger parent login success
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.user);
    } catch (err) {
      console.error('Auth request error:', err);
      showError('Connection to server failed. Please ensure the backend is running.');
    }
  };

  const showError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 550);
  };

  return (
    <section id="hero" aria-label="Hero">
      {/* 3D background particles field */}
      <div className="hero-bg-canvas">
        <Particles3D count={65} />
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className={`login-card ${shake ? 'shake' : ''}`}>
          <div className="login-brand">DUNNAGE<span>PRO</span></div>
          <h1>Smarter Protection For Modern Logistics</h1>
          <p className="hero-subtitle">Engineered Dunnage Pallet Solutions For Safer, Faster, And More Efficient Warehousing.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className={`login-field ${emailError ? 'error' : ''}`}>
              <label htmlFor="login-email">Email Address</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <input
                  type="email"
                  id="login-email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(false); setError(''); }}
                  required
                />
              </div>
            </div>

            <div className={`login-field ${passwordError ? 'error' : ''}`}>
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type="password"
                  id="login-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(false); setError(''); }}
                  required
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" id="remember-me" />
                  <span className="checkmark"></span>
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            )}

            <p className={`login-error ${error ? 'visible' : ''}`} role="alert">{error}</p>

            <button type="submit" className="enter-btn" aria-label={isRegistering ? "Register and enter the warehouse" : "Log in and enter the warehouse"}>
              {isRegistering ? 'Register Account' : 'Enter Warehouse'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>

          {/* Login / Register Toggle */}
          <div style={{ marginTop: '20px', fontSize: 'var(--fs-small)', color: 'var(--color-off-white)' }}>
            {isRegistering ? (
              <>
                Already have an account?{' '}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsRegistering(false); setError(''); }} 
                  style={{ color: 'var(--color-orange)', fontWeight: 'bold' }}
                >
                  Log In
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsRegistering(true); setError(''); }} 
                  style={{ color: 'var(--color-orange)', fontWeight: 'bold' }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
