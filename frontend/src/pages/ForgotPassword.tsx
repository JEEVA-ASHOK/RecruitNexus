import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { data, error: apiError } = await apiRequest('/auth/forgot-password', 'POST', {
      email,
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setSuccess(data.message || "If the email is registered, a password reset link has been sent.");
      setEmail('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>Enter your email address and we'll send you a secure link to reset your credentials</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {!success ? (
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

            <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
              <Send size={18} />
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" className="btn-primary" style={{ ...styles.submitBtn, display: 'inline-flex', textDecoration: 'none', justifyContent: 'center' }}>
              <ArrowLeft size={18} style={{ marginRight: '8px' }} />
              Back to Sign In
            </Link>
          </div>
        )}

        {!success && (
          <p style={styles.footerText}>
            <Link to="/login" style={styles.footerLink}>
              <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '0.88rem',
    background: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #BBF7D0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
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
};
