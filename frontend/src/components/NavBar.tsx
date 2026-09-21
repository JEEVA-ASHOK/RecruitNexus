import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User as UserIcon, LogOut, LayoutDashboard, Globe, Clock, ChevronDown, Settings, Check, UserCheck, FileText } from 'lucide-react';
import { t } from '../i18n';
import { apiRequest } from '../api';
import { NotificationCenter } from './NotificationCenter';
import { getStoredProfileCompletion } from '../utils/profileCompletion';

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const [lang, setLang] = useState(localStorage.getItem('portalLang') || 'English');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [navApplications, setNavApplications] = useState<any[]>([]);
  const [navInterviews, setNavInterviews] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangSubmenu, setShowLangSubmenu] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const languagesList = [
    { name: 'English', label: 'English' },
    { name: 'Tamil', label: 'Tamil (தமிழ்)' },
    { name: 'Hindi', label: 'Hindi (हिन्दी)' },
    { name: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { name: 'Malayalam', label: 'Malayalam (മലയാളം)' },
    { name: 'Japanese', label: 'Japanese (日本語)' }
  ];

  const [completionPct, setCompletionPct] = useState(75);

  useEffect(() => {
    const calcScore = () => {
      const details = getStoredProfileCompletion();
      setCompletionPct(details.percentage);
    };

    calcScore();
    window.addEventListener('personal-info-updated', calcScore);
    window.addEventListener('profile-photo-updated', calcScore);
    return () => {
      window.removeEventListener('personal-info-updated', calcScore);
      window.removeEventListener('profile-photo-updated', calcScore);
    };
  }, [userJson]);

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
    const loadPhoto = () => {
      const uJson = localStorage.getItem('user');
      const uObj = uJson ? JSON.parse(uJson) : null;
      const uId = uObj?.id || uObj?.userId;

      // Purge legacy un-scoped global photo keys
      localStorage.removeItem('candidatePhoto');
      localStorage.removeItem('profilePhoto');
      localStorage.removeItem('avatar');

      if (uId) {
        const stored = localStorage.getItem(`profilePhoto_${uId}`);
        setUserPhoto(stored || null);
      } else {
        setUserPhoto(null);
      }
    };
    loadPhoto();
    window.addEventListener('profile-photo-updated', loadPhoto);
    return () => window.removeEventListener('profile-photo-updated', loadPhoto);
  }, [userJson]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowLangSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserPhoto(null);
    window.dispatchEvent(new Event('profile-photo-updated'));
    setShowProfileMenu(false);
    navigate('/login');
  };

  const handleSelectLang = (selected: string) => {
    setLang(selected);
    localStorage.setItem('portalLang', selected);
    window.dispatchEvent(new Event('language-changed'));
    setShowLangSubmenu(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '')) return true;
    return location.pathname === path;
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* LOGO CONTAINER */}
        <Link to="/" style={styles.logoContainer}>
          <div style={styles.logoBadge}>
            <Briefcase size={22} color="#FFFFFF" />
          </div>
          <span style={styles.logoText}>
            Recruit<span style={{ color: '#2563EB', fontWeight: 800 }}>Nexus</span>
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div style={styles.navLinks}>
          <Link 
            to="/" 
            style={{ 
              ...styles.link, 
              color: isActive('/') ? '#2563EB' : '#4B5563',
              fontWeight: isActive('/') ? 700 : 500,
              borderBottom: isActive('/') ? '2px solid #2563EB' : '2px solid transparent',
            }}
          >
            Home
          </Link>
          
          <Link 
            to="/jobs" 
            style={{ 
              ...styles.link, 
              color: isActive('/jobs') ? '#2563EB' : '#4B5563',
              fontWeight: isActive('/jobs') ? 700 : 500,
              borderBottom: isActive('/jobs') ? '2px solid #2563EB' : '2px solid transparent',
            }}
          >
            {t('find_jobs')}
          </Link>

          <Link 
            to="/companies" 
            style={{ 
              ...styles.link, 
              color: isActive('/companies') ? '#2563EB' : '#4B5563',
              fontWeight: isActive('/companies') ? 700 : 500,
              borderBottom: isActive('/companies') ? '2px solid #2563EB' : '2px solid transparent',
            }}
          >
            Companies
          </Link>

          <Link 
            to="/ai-tools" 
            style={{ 
              ...styles.link, 
              color: isActive('/ai-tools') ? '#2563EB' : '#4B5563',
              fontWeight: isActive('/ai-tools') ? 700 : 500,
              borderBottom: isActive('/ai-tools') ? '2px solid #2563EB' : '2px solid transparent',
            }}
          >
            AI Tools
          </Link>

          <Link 
            to="/resources" 
            style={{ 
              ...styles.link, 
              color: isActive('/resources') ? '#2563EB' : '#4B5563',
              fontWeight: isActive('/resources') ? 700 : 500,
              borderBottom: isActive('/resources') ? '2px solid #2563EB' : '2px solid transparent',
            }}
          >
            Resources
          </Link>

          <Link 
            to="/pricing" 
            style={{ 
              ...styles.link, 
              color: isActive('/pricing') ? '#2563EB' : '#4B5563',
              fontWeight: isActive('/pricing') ? 700 : 500,
              borderBottom: isActive('/pricing') ? '2px solid #2563EB' : '2px solid transparent',
            }}
          >
            Pricing
          </Link>

          {/* USER PROFILE SECTION WITH INTEGRATED LANGUAGE SUBMENU */}
          {user ? (
            <div style={styles.userSection} ref={menuRef}>
              <NotificationCenter 
                applications={navApplications} 
                interviews={navInterviews} 
                isRecruiter={user.role === 'Recruiter' || user.role === 'Admin'} 
                onActionComplete={() => window.dispatchEvent(new Event('interview-action-completed'))}
              />

              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowLangSubmenu(false);
                  }}
                  style={styles.profileBadgeBtn}
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt="Profile" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={14} color="#2563EB" />
                  )}
                  <span style={styles.profileName} title={user.fullName}>{user.fullName}</span>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {user.role}
                  </span>
                  <ChevronDown size={14} color="#6B7280" />
                </button>

                {/* PROFILE DROPDOWN CARD */}
                {showProfileMenu && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.menuHeader}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{user.fullName}</span>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{user.email}</span>
                      
                      {/* Profile Completion Bar */}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', marginBottom: '4px' }}>
                          <span>Profile {completionPct}% complete</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${completionPct}%`, height: '100%', background: '#2563EB', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.menuDivider} />

                    <div 
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (location.pathname !== '/dashboard') navigate('/dashboard');
                        setTimeout(() => {
                          window.dispatchEvent(new Event('open-personal-info-modal'));
                        }, 100);
                      }}
                      style={styles.menuItem}
                    >
                      <UserCheck size={16} color="#2563EB" />
                      <span>Personal Information</span>
                    </div>

                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowProfileMenu(false)}
                      style={styles.menuItem}
                    >
                      <Briefcase size={16} color="#4B5563" />
                      <span>Professional Profile</span>
                    </Link>

                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowProfileMenu(false)}
                      style={styles.menuItem}
                    >
                      <FileText size={16} color="#4B5563" />
                      <span>Resume & Documents</span>
                    </Link>

                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowProfileMenu(false)}
                      style={styles.menuItem}
                    >
                      <Settings size={16} color="#4B5563" />
                      <span>Account Settings</span>
                    </Link>

                    {/* LANGUAGE SUBMENU TRIGGER */}
                    <div 
                      onClick={() => setShowLangSubmenu(!showLangSubmenu)}
                      style={styles.menuItem}
                    >
                      <Globe size={16} color="#4B5563" />
                      <span>Language ({lang})</span>
                      <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 'auto', transform: showLangSubmenu ? 'rotate(180deg)' : 'none' }} />
                    </div>

                    {/* LANGUAGE EXPANDABLE SUBMENU OPTIONS */}
                    {showLangSubmenu && (
                      <div style={styles.langSubmenuBox}>
                        {languagesList.map((l) => (
                          <button
                            key={l.name}
                            onClick={() => handleSelectLang(l.name)}
                            style={{
                              ...styles.langOptionBtn,
                              background: lang === l.name ? '#EFF6FF' : 'none',
                              color: lang === l.name ? '#2563EB' : '#374151',
                              fontWeight: lang === l.name ? 700 : 500,
                            }}
                          >
                            <span>{l.label}</span>
                            {lang === l.name && <Check size={14} color="#2563EB" />}
                          </button>
                        ))}
                      </div>
                    )}

                    <div style={styles.menuDivider} />

                    <button onClick={handleLogout} style={{ ...styles.menuItem, color: '#DC2626' }}>
                      <LogOut size={16} color="#DC2626" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.authButtons} ref={menuRef}>
              {/* GUEST COMPACT LANGUAGE TRIGGER */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowLangSubmenu(!showLangSubmenu)}
                  style={styles.guestLangBtn}
                  title="Select Language"
                >
                  <Globe size={16} color="#4B5563" />
                  <span>{lang}</span>
                  <ChevronDown size={12} color="#6B7280" />
                </button>

                {showLangSubmenu && (
                  <div style={{ ...styles.dropdownMenu, right: 0, width: '180px' }}>
                    {languagesList.map((l) => (
                      <button
                        key={l.name}
                        onClick={() => handleSelectLang(l.name)}
                        style={{
                          ...styles.langOptionBtn,
                          background: lang === l.name ? '#EFF6FF' : 'none',
                          color: lang === l.name ? '#2563EB' : '#374151',
                          fontWeight: lang === l.name ? 700 : 500,
                        }}
                      >
                        <span>{l.label}</span>
                        {lang === l.name && <Check size={14} color="#2563EB" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/login" style={styles.loginLink}>
                {t('sign_in')}
              </Link>
              <Link to="/register" className="btn-primary" style={styles.getStartedBtn}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    height: '80px',
  },
  container: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 32px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
  },
  logoText: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    height: '100%',
  },
  link: {
    color: '#4B5563',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.92rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '100%',
    padding: '0 4px',
    transition: 'all 0.2s ease-in-out',
  },
  loginLink: {
    color: '#374151',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    padding: '10px 16px',
    borderRadius: '8px',
    transition: 'background 0.2s',
  },
  getStartedBtn: {
    padding: '10px 20px',
    fontSize: '0.92rem',
    fontWeight: 600,
    textDecoration: 'none',
    height: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderLeft: '1px solid #E5E7EB',
    paddingLeft: '16px',
  },
  profileBadgeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F8FAFC',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    outline: 'none',
  },
  profileName: {
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#111827',
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '6px',
    transition: 'color 0.2s',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  guestLangBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#374151',
    cursor: 'pointer',
  },
  dateTimeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#4B5563',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '220px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    padding: '8px 0',
    textAlign: 'left',
  },
  menuHeader: {
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  menuDivider: {
    height: '1px',
    background: '#E5E7EB',
    margin: '6px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    fontSize: '0.88rem',
    color: '#374151',
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
  },
  langSubmenuBox: {
    background: '#F8FAFC',
    padding: '4px',
    margin: '4px 8px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  langOptionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.82rem',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
};
