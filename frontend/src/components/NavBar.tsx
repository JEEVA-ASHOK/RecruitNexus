import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User as UserIcon, LogOut, LayoutDashboard, Globe, Palette, X, Clock } from 'lucide-react';
import { t } from '../i18n';
import { apiRequest } from '../api';
import { NotificationCenter } from './NotificationCenter';

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const [lang, setLang] = useState(localStorage.getItem('portalLang') || 'English');
  const [showRgbCustomizer, setShowRgbCustomizer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [navApplications, setNavApplications] = useState<any[]>([]);
  const [navInterviews, setNavInterviews] = useState<any[]>([]);

  const reloadNavData = () => {
    if (user) {
      apiRequest('/applications').then(({ data }) => {
        if (data) setNavApplications(data);
      });
      apiRequest('/interviews').then(({ data }) => {
        if (data) setNavInterviews(data);
      });
    }
  };

  useEffect(() => {
    reloadNavData();
  }, [userJson]);

  useEffect(() => {
    const handleActionCompleted = () => {
      reloadNavData();
    };
    window.addEventListener('interview-action-completed', handleActionCompleted);
    return () => window.removeEventListener('interview-action-completed', handleActionCompleted);
  }, [userJson]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  // RGB custom colors state
  const [neonPrimary, setNeonPrimary] = useState(() => {
    return localStorage.getItem('rgbPrimary') || '#00f2fe';
  });
  const [neonSecondary, setNeonSecondary] = useState(() => {
    return localStorage.getItem('rgbSecondary') || '#8b5cf6';
  });
  const [bgThemeColor, setBgThemeColor] = useState(() => {
    return localStorage.getItem('bgThemeColor') || '#0a0f1d';
  });
  const [enableCityBgs, setEnableCityBgs] = useState(() => {
    return localStorage.getItem('enableCityBgs') !== 'false';
  });

  const [rgbActive, setRgbActive] = useState(() => {
    const saved = localStorage.getItem('rgbMode') === 'true';
    if (saved) {
      document.body.classList.add('rgb-glow-active');
    }
    return saved;
  });

  const applyContrastTextColor = (hexcolor: string) => {
    if (!hexcolor || !hexcolor.startsWith('#')) return;
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    const isLight = yiq >= 128;
    
    // Core text and glass custom properties
    const textPrimary = isLight ? '#0f172a' : '#f8fafc';
    const textSecondary = isLight ? '#334155' : '#94a3b8';
    const textMuted = isLight ? '#64748b' : '#64748b';
    const glassBg = isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(18, 20, 32, 0.65)';
    const glassBorder = isLight ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.06)';
    const bgSecondary = isLight ? '#f1f5f9' : '#121420';

    document.documentElement.style.setProperty('--text-primary', textPrimary);
    document.documentElement.style.setProperty('--text-secondary', textSecondary);
    document.documentElement.style.setProperty('--text-muted', textMuted);
    document.documentElement.style.setProperty('--glass-bg', glassBg);
    document.documentElement.style.setProperty('--glass-border', glassBorder);
    document.documentElement.style.setProperty('--bg-secondary', bgSecondary);
  };

  useEffect(() => {
    // Apply saved colors on load
    const p = localStorage.getItem('rgbPrimary') || '#00f2fe';
    const s = localStorage.getItem('rgbSecondary') || '#8b5cf6';
    const bg = localStorage.getItem('bgThemeColor') || '#0a0f1d';
    document.documentElement.style.setProperty('--accent-cyan', p);
    document.documentElement.style.setProperty('--accent-purple', s);
    document.documentElement.style.setProperty('--bg-primary', bg);
    document.body.style.backgroundColor = bg;
    applyContrastTextColor(bg);
  }, []);

  const toggleRgbMode = () => {
    const nextVal = !rgbActive;
    localStorage.setItem('rgbMode', String(nextVal));
    setRgbActive(nextVal);
    if (nextVal) {
      document.body.classList.add('rgb-glow-active');
    } else {
      document.body.classList.remove('rgb-glow-active');
    }
  };

  const handleColorChange = (type: 'primary' | 'secondary', value: string) => {
    if (type === 'primary') {
      setNeonPrimary(value);
      localStorage.setItem('rgbPrimary', value);
      document.documentElement.style.setProperty('--accent-cyan', value);
    } else {
      setNeonSecondary(value);
      localStorage.setItem('rgbSecondary', value);
      document.documentElement.style.setProperty('--accent-purple', value);
    }
  };

  const handleBgColorChange = (value: string) => {
    setBgThemeColor(value);
    localStorage.setItem('bgThemeColor', value);
    document.documentElement.style.setProperty('--bg-primary', value);
    document.body.style.backgroundColor = value;
    applyContrastTextColor(value);
    window.dispatchEvent(new Event('theme-changed'));
  };

  const toggleCityBgs = () => {
    const nextVal = !enableCityBgs;
    setEnableCityBgs(nextVal);
    localStorage.setItem('enableCityBgs', String(nextVal));
    window.dispatchEvent(new Event('theme-changed'));
  };

  const applyThemePreset = (p: string, s: string) => {
    setNeonPrimary(p);
    setNeonSecondary(s);
    localStorage.setItem('rgbPrimary', p);
    localStorage.setItem('rgbSecondary', s);
    document.documentElement.style.setProperty('--accent-cyan', p);
    document.documentElement.style.setProperty('--accent-purple', s);
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    localStorage.setItem('portalLang', selected);
    setLang(selected);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav} className="glass-panel">
      <div style={styles.container}>
        
        {/* LOGO CONTAINER */}
        <Link to="/" style={styles.logoContainer}>
          <Briefcase size={22} color="#8b5cf6" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))' }} />
          <span style={styles.logoText}>
            Recruit<span style={{ color: '#00f2fe', filter: 'drop-shadow(0 0 6px rgba(0,242,254,0.5))' }}>Nexus</span>
          </span>
        </Link>

        {/* NAVIGATION LINKS & CONFIGURATIONS */}
        <div style={styles.navLinks}>
          <Link to="/" style={{ ...styles.link, marginRight: '4px' }}>
            Home
          </Link>
          
          {/* Unique dynamic date-time display widget next to Home */}
          <div style={styles.dateTimeBadge}>
            <Clock size={11} color="var(--accent-cyan)" style={{ animation: 'pulse 2s infinite' }} />
            <span>{formatDateTime(currentTime)}</span>
          </div>
          
          <Link to="/" style={styles.link}>
            {t('find_jobs')}
          </Link>

          <Link to="/companies" style={styles.link}>Companies</Link>
          <Link to="/ai-tools" style={styles.link}>AI Tools</Link>
          <Link to="/resources" style={styles.link}>Resources</Link>
          <Link to="/pricing" style={styles.link}>Pricing</Link>

          {/* RGB GLOW NEON CUSTOMIZER */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                toggleRgbMode();
                if (!rgbActive) {
                  setShowRgbCustomizer(true);
                }
              }}
              onDoubleClick={() => setShowRgbCustomizer(!showRgbCustomizer)}
              style={{
                ...styles.rgbToggleBtn,
                background: rgbActive ? 'rgba(255, 0, 127, 0.08)' : 'rgba(255,255,255,0.02)',
                borderColor: rgbActive ? 'rgba(255, 0, 127, 0.25)' : 'rgba(255,255,255,0.05)',
                color: rgbActive ? '#ff007f' : '#64748b',
              }}
              title="Single-click to toggle, Double-click to customize colors"
            >
              <Palette size={14} style={{ filter: rgbActive ? 'drop-shadow(0 0 3px #ff007f)' : 'none' }} />
              <span>{rgbActive ? t('rgb_active') : t('rgb_glow')}</span>
            </button>

            {/* Customizer Dropdown Card */}
            {showRgbCustomizer && (
              <div style={styles.rgbCustomizerCard} className="glass-panel">
                <div style={styles.customizerHeader}>
                  <strong style={{ fontSize: '0.85rem', color: '#fff' }}>RGB Accent Customizer</strong>
                  <button 
                    onClick={() => setShowRgbCustomizer(false)} 
                    style={styles.closeCustomizerBtn}
                  >
                    <X size={12} />
                  </button>
                </div>
                
                <div style={styles.customizerGroup}>
                  <label style={styles.customizerLabel}>Primary Glow Accent</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={neonPrimary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      style={styles.colorInput}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{neonPrimary}</span>
                  </div>
                </div>

                <div style={styles.customizerGroup}>
                  <label style={styles.customizerLabel}>Secondary Glow Accent</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={neonSecondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      style={styles.colorInput}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{neonSecondary}</span>
                  </div>
                </div>

                <div style={styles.customizerGroup}>
                  <label style={styles.customizerLabel}>Page Background Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={bgThemeColor}
                      onChange={(e) => handleBgColorChange(e.target.value)}
                      style={styles.colorInput}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{bgThemeColor}</span>
                  </div>
                </div>

                <div style={{ ...styles.customizerGroup, flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    id="enable-city-bgs"
                    checked={enableCityBgs}
                    onChange={toggleCityBgs}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="enable-city-bgs" style={{ ...styles.customizerLabel, cursor: 'pointer', marginBottom: 0, textTransform: 'none', fontSize: '0.78rem' }}>
                    Show City Watermarks
                  </label>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>
                  <label style={{ ...styles.customizerLabel, marginBottom: '6px' }}>Theme Presets</label>
                  <div style={styles.presetThemesGrid}>
                    <button 
                      onClick={() => applyThemePreset('#00f2fe', '#8b5cf6')} 
                      style={styles.presetBtn}
                    >
                      Cyber
                    </button>
                    <button 
                      onClick={() => applyThemePreset('#ff007f', '#fbbf24')} 
                      style={styles.presetBtn}
                    >
                      Sunset
                    </button>
                    <button 
                      onClick={() => applyThemePreset('#39ff14', '#00ff00')} 
                      style={styles.presetBtn}
                    >
                      Neon
                    </button>
                    <button 
                      onClick={() => applyThemePreset('#f43f5e', '#ec4899')} 
                      style={styles.presetBtn}
                    >
                      Rose
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LANGUAGE SELECTOR */}
          <div style={styles.langSelectorWrapper}>
            <Globe size={14} color="#64748b" style={{ marginRight: '4px' }} />
            <select
              value={lang}
              onChange={handleLangChange}
              style={styles.langSelect}
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Japanese">Japanese (日本語)</option>
            </select>
          </div>
          
          {/* USER PROFILE SECTION */}
          {user ? (
            <>
              <Link to="/dashboard" style={styles.link}>
                <LayoutDashboard size={14} />
                <span>{t('dashboard')}</span>
              </Link>
              <div style={styles.userSection}>
                <NotificationCenter 
                  applications={navApplications} 
                  interviews={navInterviews} 
                  isRecruiter={user.role === 'Recruiter' || user.role === 'Admin'} 
                  onActionComplete={() => window.dispatchEvent(new Event('interview-action-completed'))}
                />
                <div style={styles.profileBadge}>
                  <UserIcon size={12} color="#00f2fe" />
                  <span style={styles.profileName} title={user.fullName}>{user.fullName}</span>
                  <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                    {user.role}
                  </span>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={{ ...styles.link, padding: '6px 12px' }}>
                {t('sign_in')}
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                {t('sign_up') || 'Get Started'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 12,
    left: 16,
    right: 16,
    margin: '12px auto',
    width: 'calc(100% - 32px)',
    maxWidth: '1300px',
    padding: '8px 18px',
    zIndex: 1000,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    marginRight: '12px', // Add separation between logo and nav links
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary, #ffffff)',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  link: {
    color: 'var(--text-secondary, #94a3b8)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'color 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderLeft: '1px solid var(--glass-border)',
    paddingLeft: '8px',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--glass-bg-override, rgba(255,255,255,0.02))',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    border: '1px solid var(--glass-border)',
    maxWidth: '170px',
  },
  profileName: {
    maxWidth: '70px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--text-primary, #cbd5e1)',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #64748b)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  langSelectorWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--glass-bg-override, rgba(255,255,255,0.02))',
    border: '1px solid var(--glass-border)',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  langSelect: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary, #94a3b8)',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.78rem',
    fontWeight: '500',
    outline: 'none',
  },
  rgbToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    fontFamily: "'Inter', sans-serif",
  },
  rgbCustomizerCard: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '210px',
    padding: '12px',
    borderRadius: '12px',
    zIndex: 9999,
    background: 'var(--bg-secondary, rgba(15, 23, 42, 0.95))',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    textAlign: 'left',
  },
  customizerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '6px',
  },
  closeCustomizerBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizerGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px',
  },
  customizerLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  colorInput: {
    border: 'none',
    background: 'none',
    width: '28px',
    height: '24px',
    cursor: 'pointer',
    padding: 0,
  },
  presetThemesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
  },
  presetBtn: {
    padding: '4px 6px',
    fontSize: '0.75rem',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#94a3b8',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  dateTimeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--glass-bg-override, rgba(255,255,255,0.02))',
    border: '1px solid var(--glass-border)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary, #cbd5e1)',
    marginLeft: '4px',
    marginRight: '12px',
    boxShadow: '0 0 10px rgba(0, 242, 254, 0.05)',
    letterSpacing: '0.3px',
    userSelect: 'none',
  },
};

