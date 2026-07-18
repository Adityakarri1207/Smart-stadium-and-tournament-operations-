import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLock, FiMail, FiShield, FiArrowRight, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

export const Login = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Pass the password to the mock login validator
      const success = await login(password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Password must be at least 4 characters.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Helmet>
        <title>Command Center Authentication | FIFA World Cup 2026™</title>
        <meta name="description" content="Secure login to the FIFA World Cup 2026 Smart Stadium Platform. Authenticate to access real-time stadium telemetry and tournament command center." />
      </Helmet>
      
      <div className="mesh-bg"></div>
      
      <main className="login-wrapper">
        <div className="login-card glass-panel" style={{ padding: '3.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="login-header" style={{ marginBottom: '3rem' }}>
            <div className="shield-icon" style={{ width: '64px', height: '64px', marginBottom: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
              <FiShield size={32} className="text-gradient" />
            </div>
            <h2 style={{ fontSize: '2rem', letterSpacing: '-0.5px' }}>Command Center</h2>
            <p className="text-muted" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Authenticate to access the stadium network.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fifa2026.org"
                  disabled={isSubmitting}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (e.g. admin)"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'none', color: 'var(--text-muted)' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }} />
                Remember this device
              </label>
              <a href="#" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`btn-primary login-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || !password.trim() || !email.trim()}
              style={{ padding: '1.1rem', borderRadius: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Sign In'}
              {!isSubmitting && <FiArrowRight />}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem' }}>
              <FiCheck /> <span>AES-256 Encrypted Connection</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
