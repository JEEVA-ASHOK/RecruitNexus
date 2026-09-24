import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { 
  Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, 
  Sparkles, Cpu, Briefcase, Calendar, Building2, 
  CheckCircle2, TrendingUp, Clock, ShieldCheck, 
  ChevronLeft, ChevronRight, Zap, Users, Award
} from 'lucide-react';

interface SlideData {
  id: number;
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  highlight: string;
  subtitle: string;
  bullets: string[];
  statLabel: string;
  statValue: string;
  color: string;
  accentBg: string;
  graphicType: 'ai_score' | 'pipeline' | 'calendar' | 'companies';
}

const slides: SlideData[] = [
  {
    id: 1,
    badge: 'AI Talent Intelligence',
    badgeIcon: Sparkles,
    title: 'Precision AI Resume',
    highlight: 'Matching & Scoring',
    subtitle: 'Evaluate thousands of candidate profiles in seconds using deep NLP algorithms and skill-vector alignment.',
    bullets: [
      '98.4% Match Accuracy on Job Specs',
      'Automated Skill & Experience Extraction',
      'Real-Time Candidate Suitability Index'
    ],
    statLabel: 'Average Screening Speedup',
    statValue: '10x Faster',
    color: '#3B82F6',
    accentBg: 'rgba(59, 130, 246, 0.15)',
    graphicType: 'ai_score'
  },
  {
    id: 2,
    badge: 'Smart Applicant Tracking',
    badgeIcon: Briefcase,
    title: 'Streamlined Hiring',
    highlight: 'Pipeline & Workflows',
    subtitle: 'From initial application to offer letter release, manage candidate status transitions seamlessly.',
    bullets: [
      'Drag-and-Drop Applicant Pipeline',
      'Instant Application Status Email Alerts',
      'Automated Offer Letter Generation'
    ],
    statLabel: 'Active Applications Managed',
    statValue: '25,000+',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.15)',
    graphicType: 'pipeline'
  },
  {
    id: 3,
    badge: 'Smart Interview Scheduling',
    badgeIcon: Calendar,
    title: 'Automated 24h Interview',
    highlight: 'Reminder Engine',
    subtitle: 'Background scheduler dispatches timely reminder notifications to keep candidates and recruiters aligned.',
    bullets: [
      'Zero-Delay 24h Pre-Interview Email Alerts',
      'One-Click Candidate Attendance RSVP',
      'IST Timezone-Aware Interview Timetable'
    ],
    statLabel: 'Interview Attendance Rate',
    statValue: '99.2%',
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    graphicType: 'calendar'
  },
  {
    id: 4,
    badge: 'Enterprise Ecosystem',
    badgeIcon: Building2,
    title: 'Connecting Talent with',
    highlight: '500+ Tech Leaders',
    subtitle: 'Trusted by top enterprises including Zoho, Google India, TCS, Microsoft, Wipro, and Amazon.',
    bullets: [
      'Verified Corporate Company Profiles',
      'Role-Based Recruiter & Admin Access',
      'End-to-End Enterprise Security'
    ],
    statLabel: 'Highest Package Offered',
    statValue: '₹35 LPA',
    color: '#8B5CF6',
    accentBg: 'rgba(139, 92, 246, 0.15)',
    graphicType: 'companies'
  }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  // Slideshow Timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
      sessionStorage.setItem('justLoggedIn', 'true');
      window.dispatchEvent(new Event('profile-photo-updated'));
      navigate('/dashboard');
    }
  };

  const slide = slides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div style={styles.pageWrapper}>
      {/* Keyframe Animation Styles */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes slideInFade {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .slide-animated {
          animation: slideInFade 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .floating-graphic {
          animation: floatCard 4s ease-in-out infinite;
        }
        .bg-glow-pulse {
          animation: pulseGlow 6s ease-in-out infinite;
        }
        .login-card-shadow {
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8);
        }
        .custom-glass-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={styles.mainContainer}>
        {/* LEFT PANEL: Recruitment Slideshow */}
        <div 
          style={styles.slideshowPanel}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Ambient Glow Effects */}
          <div className="bg-glow-pulse" style={{ ...styles.ambientGlow, background: slide.color, top: '-10%', left: '-10%' }} />
          <div className="bg-glow-pulse" style={{ ...styles.ambientGlow, background: '#6366F1', bottom: '-10%', right: '-10%', animationDelay: '3s' }} />

          {/* Top Brand Tag */}
          <div style={styles.brandTagHeader}>
            <div style={styles.brandLogoBox}>
              <Zap size={18} color="#3B82F6" />
            </div>
            <div>
              <span style={styles.brandTitle}>RecruitNexus Intelligence</span>
              <span style={styles.brandSub}>AI-Driven Recruitment Suite</span>
            </div>
          </div>

          {/* Active Slide Content */}
          <div key={slide.id} className="slide-animated" style={styles.slideContentStage}>
            {/* Category Badge */}
            <div style={{ ...styles.slideBadge, background: slide.accentBg, borderColor: `${slide.color}40` }}>
              <BadgeIcon size={16} color={slide.color} />
              <span style={{ color: slide.color, fontWeight: 700, fontSize: '0.85rem' }}>{slide.badge}</span>
            </div>

            {/* Slide Title */}
            <h1 style={styles.slideHeading}>
              {slide.title} <br />
              <span style={{ color: slide.color, position: 'relative', display: 'inline-block' }}>
                {slide.highlight}
              </span>
            </h1>

            <p style={styles.slideDescription}>{slide.subtitle}</p>

            {/* Feature Bullets */}
            <div style={styles.bulletsList}>
              {slide.bullets.map((bullet, idx) => (
                <div key={idx} style={styles.bulletItem}>
                  <div style={{ ...styles.bulletIconBox, background: slide.accentBg }}>
                    <CheckCircle2 size={14} color={slide.color} />
                  </div>
                  <span style={styles.bulletText}>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Dynamic Visual Graphic Card */}
            <div className="floating-graphic" style={styles.graphicCard}>
              {slide.graphicType === 'ai_score' && (
                <div>
                  <div style={styles.graphicHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={18} color="#3B82F6" />
                      <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.9rem' }}>AI Match Analyzer</span>
                    </div>
                    <span style={styles.greenScoreTag}>98.4% Match</span>
                  </div>
                  <div style={styles.skillsTagRow}>
                    <span style={styles.skillChip}>C# .NET</span>
                    <span style={styles.skillChip}>React.js</span>
                    <span style={styles.skillChip}>MySQL</span>
                    <span style={styles.skillChip}>Docker</span>
                  </div>
                  <div style={styles.progressBarTrack}>
                    <div style={{ ...styles.progressBarFill, width: '98.4%', background: '#3B82F6' }} />
                  </div>
                </div>
              )}

              {slide.graphicType === 'pipeline' && (
                <div>
                  <div style={styles.graphicHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={18} color="#10B981" />
                      <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.9rem' }}>Applicant Pipeline Status</span>
                    </div>
                    <span style={{ ...styles.greenScoreTag, background: 'rgba(16, 185, 129, 0.2)', color: '#34D399' }}>Live Update</span>
                  </div>
                  <div style={styles.pipelineStepRow}>
                    <div style={{ ...styles.pipelineChip, borderLeft: '3px solid #3B82F6' }}>Applied</div>
                    <span style={{ color: '#64748B' }}>➔</span>
                    <div style={{ ...styles.pipelineChip, borderLeft: '3px solid #F59E0B' }}>Shortlisted</div>
                    <span style={{ color: '#64748B' }}>➔</span>
                    <div style={{ ...styles.pipelineChip, borderLeft: '3px solid #10B981', background: 'rgba(16, 185, 129, 0.15)' }}>Offered</div>
                  </div>
                </div>
              )}

              {slide.graphicType === 'calendar' && (
                <div>
                  <div style={styles.graphicHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="#F59E0B" />
                      <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.9rem' }}>24h Reminder Service</span>
                    </div>
                    <span style={{ ...styles.greenScoreTag, background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24' }}>Active Dispatcher</span>
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px' }}>
                    Scheduled Interview: <strong>Tomorrow at 10:00 AM IST</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ShieldCheck size={14} color="#10B981" />
                    <span style={{ color: '#34D399', fontSize: '0.82rem', fontWeight: 500 }}>RSVP Confirmed by Candidate</span>
                  </div>
                </div>
              )}

              {slide.graphicType === 'companies' && (
                <div>
                  <div style={styles.graphicHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} color="#8B5CF6" />
                      <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '0.9rem' }}>Top Hiring Employers</span>
                    </div>
                    <span style={{ ...styles.greenScoreTag, background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>500+ Companies</span>
                  </div>
                  <div style={styles.companyLogosFlex}>
                    <span>Zoho</span> • <span>Google</span> • <span>TCS</span> • <span>Microsoft</span> • <span>Amazon</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Slideshow Controls */}
          <div style={styles.slideshowFooter}>
            {/* Dots Indicator */}
            <div style={styles.dotsContainer}>
              {slides.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    ...styles.dotBtn,
                    width: currentSlide === index ? '28px' : '8px',
                    background: currentSlide === index ? slide.color : 'rgba(255, 255, 255, 0.2)',
                  }}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide Count & Nav Arrows */}
            <div style={styles.navControlsGroup}>
              <span style={styles.slideCounterText}>
                0{currentSlide + 1} / 0{slides.length}
              </span>
              <button 
                onClick={handlePrevSlide} 
                className="custom-glass-btn" 
                style={styles.arrowBtn}
                title="Previous feature"
              >
                <ChevronLeft size={18} color="#F8FAFC" />
              </button>
              <button 
                onClick={handleNextSlide} 
                className="custom-glass-btn" 
                style={styles.arrowBtn}
                title="Next feature"
              >
                <ChevronRight size={18} color="#F8FAFC" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Sign-In Form Container */}
        <div style={styles.formPanel}>
          <div style={styles.card} className="login-card-shadow">
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
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    minHeight: 'calc(100vh - 160px)',
    background: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
  },
  mainContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    width: '100%',
    maxWidth: '1100px',
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
  },
  /* LEFT SLIDESHOW PANEL */
  slideshowPanel: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: '580px',
  },
  ambientGlow: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    filter: 'blur(90px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  brandTagHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 2,
  },
  brandLogoBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#F8FAFC',
    letterSpacing: '-0.3px',
  },
  brandSub: {
    display: 'block',
    fontSize: '0.78rem',
    color: '#94A3B8',
  },
  slideContentStage: {
    zIndex: 2,
    marginTop: '24px',
    marginBottom: '24px',
  },
  slideBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '30px',
    border: '1px solid',
    marginBottom: '20px',
  },
  slideHeading: {
    fontSize: '2.1rem',
    fontWeight: 800,
    color: '#F8FAFC',
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
    marginBottom: '14px',
  },
  slideDescription: {
    fontSize: '0.95rem',
    color: '#94A3B8',
    lineHeight: 1.55,
    marginBottom: '24px',
    maxWidth: '460px',
  },
  bulletsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '28px',
  },
  bulletItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bulletIconBox: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: {
    fontSize: '0.88rem',
    color: '#E2E8F0',
    fontWeight: 500,
  },
  graphicCard: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  },
  graphicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  greenScoreTag: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#60A5FA',
    fontSize: '0.78rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '20px',
  },
  skillsTagRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  skillChip: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#CBD5E1',
    fontSize: '0.75rem',
    padding: '3px 10px',
    borderRadius: '6px',
    fontWeight: 500,
  },
  progressBarTrack: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.8s ease-in-out',
  },
  pipelineStepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.82rem',
  },
  pipelineChip: {
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '6px 12px',
    borderRadius: '6px',
    color: '#E2E8F0',
    fontWeight: 600,
  },
  companyLogosFlex: {
    color: '#94A3B8',
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  slideshowFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  dotsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dotBtn: {
    height: '8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  navControlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  slideCounterText: {
    fontSize: '0.82rem',
    color: '#94A3B8',
    fontWeight: 600,
    letterSpacing: '1px',
    marginRight: '6px',
  },
  arrowBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  /* RIGHT SIGN-IN FORM PANEL */
  formPanel: {
    padding: '48px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFFFF',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
  },
  header: {
    textAlign: 'left',
    marginBottom: '28px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '6px',
    color: '#0F172A',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.92rem',
    color: '#475569',
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
    gap: '18px',
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
    color: '#334155',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#64748B',
    zIndex: 2,
    pointerEvents: 'none',
  },
  fieldInput: {
    height: '50px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    paddingLeft: '48px',
    paddingRight: '16px',
    fontSize: '0.95rem',
    color: '#0F172A',
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
    color: '#334155',
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
    color: '#64748B',
    marginTop: '26px',
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
    border: '1px solid #64748B',
    borderRadius: '10px',
    height: '50px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '95px',
  },
  captchaExpression: {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: '1px',
    fontFamily: "'Courier New', monospace",
  },
  captchaRefreshBtn: {
    background: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '10px',
    height: '50px',
    padding: '0 14px',
    fontSize: '0.85rem',
    color: '#334155',
    cursor: 'pointer',
    fontWeight: 500,
  },
};
