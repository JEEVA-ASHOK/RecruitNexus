import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Mail, Lock, User as UserIcon, UserPlus, AlertCircle, Briefcase, GraduationCap, Phone, CheckCircle } from 'lucide-react';
import { t } from '../i18n';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  
  // Registration Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  
  // Custom Naukri Selectors
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
      // If candidate is a Fresher, we can initialize their profile with 0 years exp
      if (role === 'Candidate') {
        const user = { email, password };
        // Auto sign-in or redirect to login
        navigate('/login', { state: { registered: true } });
      } else {
        navigate('/login', { state: { registered: true } });
      }
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.mainLayout}>
        
        {/* LEFT COLUMN: NAUKRI VAL-PROP CARD */}
        <div style={styles.leftValProp}>
          <div style={styles.valIllustrationContainer}>
            <div style={styles.vectorCircle}>
              <UserIcon size={52} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.4))' }} />
            </div>
            <div style={styles.decorativeBlob}></div>
          </div>
          
          <h3 style={styles.valTitle}>On registering, you can</h3>
          
          <ul style={styles.valList}>
            <li style={styles.valItem}>
              <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Build your profile and let recruiters find you</span>
            </li>
            <li style={styles.valItem}>
              <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Get job postings delivered right to your email</span>
            </li>
            <li style={styles.valItem}>
              <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Find a job and grow your career</span>
            </li>
          </ul>
        </div>

        {/* VERTICAL DIVIDER */}
        <div style={styles.verticalDivider}></div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div style={styles.rightFormColumn}>
          <div style={styles.header}>
            <h2 style={styles.title} className="text-gradient">Create your account</h2>
            <p style={styles.subtitle}>Join JobAI to explore top employment roles</p>
          </div>

          {error && (
            <div style={styles.errorAlert} className="badge-red">
              <AlertCircle size={16} />
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
                    borderColor: role === 'Candidate' ? '#00f2fe' : 'rgba(255,255,255,0.06)',
                    background: role === 'Candidate' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.02)',
                    color: role === 'Candidate' ? '#00f2fe' : '#94a3b8',
                  }}
                  onClick={() => setRole('Candidate')}
                >
                  <span>Job Seeker</span>
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.roleButton,
                    borderColor: role === 'Recruiter' ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                    background: role === 'Recruiter' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                    color: role === 'Recruiter' ? '#8b5cf6' : '#94a3b8',
                  }}
                  onClick={() => setRole('Recruiter')}
                >
                  <span>Recruiter</span>
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
                placeholder="What is your name?"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.formInput}
              />
            </div>

            {/* Email Address */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email ID*</label>
              <input
                type="email"
                required
                className="glass-input"
                placeholder="Tell us your Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.formInput}
              />
              <span style={styles.subLabel}>We'll send relevant jobs and updates to this email</span>
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password*</label>
              <input
                type="password"
                required
                minLength={6}
                className="glass-input"
                placeholder="(Minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.formInput}
              />
              <span style={styles.subLabel}>This helps your account stay protected</span>
            </div>

            {/* Mobile Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mobile number*</label>
              <div style={styles.phoneInputRow}>
                <span style={styles.phonePrefix}>+91</span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  className="glass-input"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  style={{ ...styles.formInput, flex: 1 }}
                />
              </div>
              <span style={styles.subLabel}>Recruiters will contact you on this number</span>
            </div>

            {/* Work Status (Only visible for Candidate job seeker role) */}
            {role === 'Candidate' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Work status*</label>
                <div style={styles.statusCardsGrid}>
                  <div
                    onClick={() => setWorkStatus('experienced')}
                    style={{
                      ...styles.statusCard,
                      borderColor: workStatus === 'experienced' ? '#00f2fe' : 'rgba(255,255,255,0.06)',
                      background: workStatus === 'experienced' ? 'rgba(0, 242, 254, 0.04)' : 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <Briefcase size={20} color={workStatus === 'experienced' ? '#00f2fe' : '#64748b'} />
                    <div>
                      <strong style={styles.statusCardTitle}>I'm experienced</strong>
                      <span style={styles.statusCardDesc}>I have work experience (excluding internships)</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setWorkStatus('fresher')}
                    style={{
                      ...styles.statusCard,
                      borderColor: workStatus === 'fresher' ? '#00f2fe' : 'rgba(255,255,255,0.06)',
                      background: workStatus === 'fresher' ? 'rgba(0, 242, 254, 0.04)' : 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <GraduationCap size={20} color={workStatus === 'fresher' ? '#00f2fe' : '#64748b'} />
                    <div>
                      <strong style={styles.statusCardTitle}>I'm a fresher</strong>
                      <span style={styles.statusCardDesc}>I am a student/ Haven't worked after graduation</span>
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
                Send me important updates & promotions via SMS, email, and WhatsApp
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
                  placeholder="Enter answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="glass-input"
                  style={{ ...styles.formInput, flex: 1 }}
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
            By clicking Register, you agree to the Terms and Conditions & Privacy Policy of JobAI.com
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
    minHeight: 'calc(100vh - 120px)',
    padding: '40px 20px',
  },
  mainLayout: {
    display: 'flex',
    width: '100%',
    maxWidth: '920px',
    borderRadius: '24px',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  leftValProp: {
    flex: '1 1 320px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  valIllustrationContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '140px',
    marginBottom: '24px',
  },
  vectorCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(0, 242, 254, 0.04)',
    border: '1px solid rgba(0, 242, 254, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  decorativeBlob: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.06)',
    top: '15px',
    left: '80px',
    filter: 'blur(5px)',
    zIndex: 1,
  },
  valTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#fff',
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
    fontSize: '0.85rem',
    color: '#cbd5e1',
    lineHeight: '1.4',
    textAlign: 'left',
  },
  verticalDivider: {
    width: '1px',
    background: 'rgba(255, 255, 255, 0.04)',
    alignSelf: 'stretch',
  },
  rightFormColumn: {
    flex: '1.5 1 540px',
    padding: '40px 48px',
    textAlign: 'left',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '1.65rem',
    fontWeight: '800',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '0.8rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#e2e8f0',
  },
  subLabel: {
    fontSize: '0.72rem',
    color: '#64748b',
    marginTop: '2px',
  },
  formInput: {
    padding: '10px 14px',
    fontSize: '0.9rem',
  },
  phoneInputRow: {
    display: 'flex',
    gap: '10px',
  },
  phonePrefix: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '0 14px',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  roleContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '4px',
  },
  roleButton: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  statusCardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '4px',
  },
  statusCard: {
    border: '1px solid',
    borderRadius: '12px',
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
    fontWeight: '700',
    color: '#fff',
    marginBottom: '2px',
  },
  statusCardDesc: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#64748b',
    lineHeight: '1.3',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    marginTop: '6px',
  },
  checkboxInput: {
    marginTop: '2px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  submitBtn: {
    marginTop: '10px',
    justifyContent: 'center',
    padding: '12px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '20px',
  },
  footerLink: {
    color: '#00f2fe',
    textDecoration: 'none',
    fontWeight: '700',
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
    fontSize: '1rem',
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
  disclaimerText: {
    fontSize: '0.68rem',
    color: '#475569',
    textAlign: 'center',
    display: 'block',
    marginTop: '12px',
    lineHeight: '1.3',
  }
};
