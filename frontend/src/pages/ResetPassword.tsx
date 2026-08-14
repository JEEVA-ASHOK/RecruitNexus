import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Lock, ArrowLeft, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Set New Password</h2>
          <p style={styles.subtitle}>Enter and confirm your new secure account password</p>
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

        {!token && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>Reset token is missing. Please check your email link or request a new reset link.</span>
          </div>
        )}

        {!success && token && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  className="glass-input"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ ...styles.fieldInput, paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeToggleBtn}
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="glass-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...styles.fieldInput, paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeToggleBtn}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} color="#6B7280" /> : <Eye size={18} color="#6B7280" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={styles.submitBtn} disabled={loading}>
              <Save size={18} />
              {loading ? 'Resetting Password...' : 'Save New Password'}
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
