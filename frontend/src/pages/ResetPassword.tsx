import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Lock, ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new link.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: apiError } = await apiRequest('/auth/reset-password', 'POST', {
      token,
      newPassword,
      confirmPassword,
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      setSuccess(data.message || "Your password has been successfully reset.");
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title} className="text-glow text-gradient">Set New Password</h2>
          <p style={styles.subtitle}>Enter and confirm your new secure account password</p>
        </div>

        {error && (
          <div style={styles.errorAlert} className="badge-red">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert} className="badge-green">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {!token && (
          <div style={styles.errorAlert} className="badge-red">
            <AlertCircle size={16} />
            <span>Reset token is missing. Please check your email link or request a new reset request.</span>
          </div>
        )}

        {!success && token && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type="password"
                  required
                  className="glass-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type="password"
                  required
                  className="glass-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
              <Save size={18} />
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        <p style={styles.footerText}>
          <Link to="/login" style={styles.footerLink}>
            <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Back to Sign In
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
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '0.85rem',
    color: '#10b981',
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
};
