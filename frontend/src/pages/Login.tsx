import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CAPTCHA verification states
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setNum1(n1);
    setNum2(n2);
    setCaptchaAnswer(n1 + n2);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (parseInt(captchaInput, 10) !== captchaAnswer) {
      setError("Security verification failed. Please enter the correct sum of the numbers.");
      generateCaptcha();
      setLoading(false);
      return;
    }

    const { data, error: apiError } = await apiRequest('/auth/login', 'POST', {
      email,
      password,
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
      generateCaptcha(); // Regenerate on error
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      }));
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title} className="text-glow text-gradient">Welcome Back</h2>
          <p style={styles.subtitle}>Enter your credentials to access your talent portal</p>
        </div>

        {error && (
          <div style={styles.errorAlert} className="badge-red">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                required
                className="glass-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#00f2fe', textDecoration: 'none', fontWeight: '600' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                required
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          {/* Visual Security CAPTCHA */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Security Verification*</label>
            <div style={styles.captchaRow}>
              <div style={styles.captchaBox}>
                <span style={styles.captchaExpression}>{num1} + {num2} = ?</span>
              </div>
              <input
                type="text"
                required
                placeholder="Enter answer"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="glass-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={generateCaptcha}
                style={styles.captchaRefreshBtn}
                title="Generate new equation"
              >
                Refresh
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.footerLink}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '0.85rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
  },
  submitBtn: {
    marginTop: '10px',
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '24px',
  },
  footerLink: {
    color: '#00f2fe',
    textDecoration: 'none',
    fontWeight: '600',
  },
  captchaRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  captchaBox: {
    background: 'var(--glass-bg-override, rgba(255, 255, 255, 0.03))',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100px',
  },
  captchaExpression: {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: 'var(--text-primary, #ffffff)',
    letterSpacing: '1px',
    fontFamily: "'Courier New', monospace",
  },
  captchaRefreshBtn: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #94a3b8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
};
