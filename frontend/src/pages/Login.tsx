import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      generateCaptcha();
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      }));
      window.dispatchEvent(new Event('profile-photo-updated'));
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Enter your credentials to access your talent portal</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
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
                style={styles.fieldInput}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...styles.fieldInput, paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeToggleBtn}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div style={styles.rememberRow}>
            <label style={styles.rememberLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkboxInput}
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot Password?
            </Link>
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
                placeholder="Answer"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="glass-input"
                style={{ ...styles.fieldInput, paddingLeft: '16px', flex: 1 }}
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
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 160px)',
    padding: '40px 20px',
    background: '#F8FAFC',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '44px 36px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2.1rem',
    fontWeight: 800,
    marginBottom: '8px',
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#4B5563',
    lineHeight: 1.4,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '0.88rem',
    background: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
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
    textAlign: 'left',
  },
  label: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#6B7280',
    zIndex: 2,
    pointerEvents: 'none',
  },
  fieldInput: {
    height: '52px',
    borderRadius: '10px',
    border: '1px solid #D1D5DB',
    paddingLeft: '48px',
    paddingRight: '16px',
    fontSize: '0.95rem',
    color: '#111827',
    background: '#FFFFFF',
    width: '100%',
  },
  eyeToggleBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    zIndex: 2,
  },
  rememberRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    marginTop: '-4px',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#374151',
    fontWeight: 500,
    cursor: 'pointer',
  },
  checkboxInput: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
    accentColor: '#2563EB',
  },
  forgotLink: {
    fontSize: '0.85rem',
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 600,
  },
  submitBtn: {
    height: '50px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    justifyContent: 'center',
    marginTop: '6px',
    width: '100%',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.92rem',
    color: '#6B7280',
    marginTop: '28px',
  },
  footerLink: {
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 600,
  },
  captchaRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  captchaBox: {
    background: '#F8FAFC',
    border: '1px solid #6B7280',
    borderRadius: '10px',
    height: '52px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100px',
  },
  captchaExpression: {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: '1px',
    fontFamily: "'Courier New', monospace",
  },
  captchaRefreshBtn: {
    background: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    height: '52px',
    padding: '0 16px',
    fontSize: '0.85rem',
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 500,
  },
};
