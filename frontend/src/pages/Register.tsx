import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Mail, Lock, User as UserIcon, UserPlus, AlertCircle, Briefcase, GraduationCap, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { t } from '../i18n';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Registration Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  
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

  React.useEffect(() => {
    generateCaptcha();
  }, []);
  
  // Custom Role Selectors
  const [role, setRole] = useState<'Candidate' | 'Recruiter'>('Candidate');
  const [workStatus, setWorkStatus] = useState<'experienced' | 'fresher'>('experienced');
  const [whatsappConsent, setWhatsappConsent] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const { error: apiError } = await apiRequest('/auth/register', 'POST', {
      fullName,
      email,
      password,
      role,
    });

    setLoading(false);

    if (apiError) {
      setError(apiError);
    } else {
      navigate('/login', { state: { registered: true } });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainLayout}>
        
        {/* LEFT COLUMN: ENTERPRISE VALUE PROP */}
        <div style={styles.leftValProp}>
          <div style={styles.valIllustrationContainer}>
            <div style={styles.vectorCircle}>
              <UserIcon size={44} color="#2563EB" />
            </div>
          </div>
          
          <h3 style={styles.valTitle}>On registering, you can:</h3>
          
          <ul style={styles.valList}>
            <li style={styles.valItem}>
              <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Build your profile and let enterprise recruiters find you</span>
            </li>
            <li style={styles.valItem}>
              <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Get AI match recommendations delivered to your dashboard</span>
            </li>
            <li style={styles.valItem}>
              <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Receive interview invites and official AI offer packages</span>
            </li>
          </ul>
        </div>

        {/* VERTICAL DIVIDER */}
        <div style={styles.verticalDivider} />

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div style={styles.rightFormColumn}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create your account</h2>
            <p style={styles.subtitle}>Join RecruitNexus to explore top enterprise opportunities</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Account Type Selector */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Registering as</label>
              <div style={styles.roleContainer}>
                <button
                  type="button"
                  style={{
                    ...styles.roleButton,
                    borderColor: role === 'Candidate' ? '#2563EB' : '#E5E7EB',
                    background: role === 'Candidate' ? '#EFF6FF' : '#FFFFFF',
                    color: role === 'Candidate' ? '#2563EB' : '#4B5563',
                  }}
                  onClick={() => setRole('Candidate')}
                >
                  <span>Job Seeker</span>
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.roleButton,
                    borderColor: role === 'Recruiter' ? '#2563EB' : '#E5E7EB',
                    background: role === 'Recruiter' ? '#EFF6FF' : '#FFFFFF',
                    color: role === 'Recruiter' ? '#2563EB' : '#4B5563',
                  }}
                  onClick={() => setRole('Recruiter')}
                >
                  <span>Employer / Recruiter</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name*</label>
              <input
                type="text"
                required
                className="glass-input"
                placeholder="What is your full name?"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.fieldInput}
              />
            </div>

            {/* Email Address */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email ID*</label>
              <input
                type="email"
                required
                className="glass-input"
                placeholder="Tell us your work or personal Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.fieldInput}
              />
              <span style={styles.subLabel}>We'll send job updates and interview invites to this email</span>
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password*</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="glass-input"
                  placeholder="Minimum 6 characters"
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
              <span style={styles.subLabel}>This helps your account stay protected</span>
            </div>

            {/* Mobile Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mobile Number*</label>
              <div style={styles.phoneInputRow}>
                <span style={styles.phonePrefix}>+91</span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  className="glass-input"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  style={{ ...styles.fieldInput, flex: 1 }}
                />
              </div>
              <span style={styles.subLabel}>Recruiters will contact you on this number</span>
            </div>

            {/* Work Status (Candidate Only) */}
            {role === 'Candidate' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Work Status*</label>
                <div style={styles.statusCardsGrid}>
                  <div
                    onClick={() => setWorkStatus('experienced')}
                    style={{
                      ...styles.statusCard,
                      borderColor: workStatus === 'experienced' ? '#2563EB' : '#E5E7EB',
                      background: workStatus === 'experienced' ? '#EFF6FF' : '#FFFFFF',
                    }}
                  >
                    <Briefcase size={20} color={workStatus === 'experienced' ? '#2563EB' : '#6B7280'} />
                    <div>
                      <strong style={styles.statusCardTitle}>I'm experienced</strong>
                      <span style={styles.statusCardDesc}>I have work experience</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setWorkStatus('fresher')}
                    style={{
                      ...styles.statusCard,
                      borderColor: workStatus === 'fresher' ? '#2563EB' : '#E5E7EB',
                      background: workStatus === 'fresher' ? '#EFF6FF' : '#FFFFFF',
                    }}
                  >
                    <GraduationCap size={20} color={workStatus === 'fresher' ? '#2563EB' : '#6B7280'} />
                    <div>
                      <strong style={styles.statusCardTitle}>I'm a fresher</strong>
                      <span style={styles.statusCardDesc}>I am a recent student / graduate</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Whatsapp Consent Checkbox */}
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="whatsapp-consent"
                checked={whatsappConsent}
                onChange={(e) => setWhatsappConsent(e.target.checked)}
                style={styles.checkboxInput}
              />
              <label htmlFor="whatsapp-consent" style={styles.checkboxLabel}>
                Send me important updates and job notifications via Email & WhatsApp
              </label>
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
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>
              Sign In
            </Link>
          </p>

          <span style={styles.disclaimerText}>
            By clicking Register, you agree to the Terms and Conditions & Privacy Policy of RecruitNexus.com
          </span>
        </div>

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
  mainLayout: {
    display: 'flex',
    width: '100%',
    maxWidth: '960px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  leftValProp: {
    flex: '1 1 320px',
    padding: '44px 36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#F8FAFC',
    borderRight: '1px solid #E5E7EB',
  },
  valIllustrationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
  },
  vectorCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '20px',
    textAlign: 'center',
  },
  valList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: 0,
    margin: 0,
  },
  valItem: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.88rem',
    color: '#374151',
    lineHeight: 1.5,
    textAlign: 'left',
  },
  verticalDivider: {
    width: '1px',
    background: '#E5E7EB',
    alignSelf: 'stretch',
  },
  rightFormColumn: {
    flex: '1.5 1 540px',
    padding: '44px 48px',
    textAlign: 'left',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '1.85rem',
    fontWeight: 800,
    marginBottom: '6px',
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#4B5563',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
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
    gap: '6px',
  },
  label: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#374151',
  },
  subLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
    marginTop: '2px',
  },
  fieldInput: {
    height: '52px',
    borderRadius: '10px',
    border: '1px solid #D1D5DB',
    paddingLeft: '16px',
    paddingRight: '16px',
    fontSize: '0.95rem',
    color: '#111827',
    background: '#FFFFFF',
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
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
  phoneInputRow: {
    display: 'flex',
    gap: '10px',
  },
  phonePrefix: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8FAFC',
    border: '1px solid #D1D5DB',
    borderRadius: '10px',
    padding: '0 16px',
    fontSize: '0.95rem',
    color: '#374151',
    fontWeight: 600,
  },
  roleContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '4px',
  },
  roleButton: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  statusCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginTop: '4px',
  },
  statusCard: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statusCardTitle: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '2px',
  },
  statusCardDesc: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#6B7280',
    lineHeight: 1.3,
  },
  checkboxGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    marginTop: '6px',
  },
  checkboxInput: {
    marginTop: '3px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.8rem',
    color: '#4B5563',
    lineHeight: 1.4,
    cursor: 'pointer',
  },
  submitBtn: {
    height: '50px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    justifyContent: 'center',
    marginTop: '10px',
    width: '100%',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#6B7280',
    marginTop: '24px',
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
  disclaimerText: {
    fontSize: '0.72rem',
    color: '#6B7280',
    textAlign: 'center',
    display: 'block',
    marginTop: '14px',
    lineHeight: 1.3,
  }
};
