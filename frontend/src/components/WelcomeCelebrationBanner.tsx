import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, Award, Zap, CheckCircle2, Flame, Rocket } from 'lucide-react';

interface Particle {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

export const WelcomeCelebrationBanner: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'Candidate' | 'Recruiter' | 'Admin'>('Candidate');

  useEffect(() => {
    const checkCelebration = () => {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn === 'true') {
        // Clear flag immediately so it only triggers ONCE
        sessionStorage.removeItem('justLoggedIn');

        // Retrieve User Information
        const userJson = localStorage.getItem('user');
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            setUserName(user.fullName || 'Talent');
            setUserRole(user.role || 'Candidate');
          } catch (e) {
            setUserName('Talent');
          }
        }

        // Generate Random Confetti Particles
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8', '#F43F5E'];
        const generated: Particle[] = Array.from({ length: 35 }).map((_, i) => ({
          id: i,
          left: Math.random() * 100, // percentage across width
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.floor(Math.random() * 8) + 6,
          delay: Math.random() * 0.8,
          duration: Math.random() * 2 + 3,
        }));

        setParticles(generated);
        setVisible(true);
        setExiting(false);

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
          handleClose();
        }, 5000);

        return () => clearTimeout(timer);
      }
    };

    checkCelebration();
  }, [location.pathname]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 450); // Match CSS slide-up duration
  };

  if (!visible) return null;

  const isRecruiter = userRole === 'Recruiter' || userRole === 'Admin';

  return (
    <>
      {/* Keyframe Styles for Floating Particles & Banner Slide */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bannerSlideDown {
          from {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes bannerSlideUp {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -100px);
            opacity: 0;
          }
        }

        @keyframes timerProgress {
          from { width: 100%; }
          to { width: 0%; }
        }

        .celebration-banner-enter {
          animation: bannerSlideDown 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .celebration-banner-exit {
          animation: bannerSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .timer-progress-fill {
          animation: timerProgress 5s linear forwards;
        }
      `}</style>

      {/* CONFETTI FLOATING CONTAINER */}
      <div style={styles.particleContainer}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: '-10px',
              width: `${p.size}px`,
              height: `${p.size * 1.4}px`,
              backgroundColor: p.color,
              borderRadius: p.id % 2 === 0 ? '50%' : '2px',
              animation: `confettiFall ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              zIndex: 999999,
              pointerEvents: 'none',
              boxShadow: `0 0 6px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* TOP FLOATING CELEBRATION BANNER */}
      <div
        className={exiting ? 'celebration-banner-exit' : 'celebration-banner-enter'}
        style={styles.bannerWrapper}
      >
        <div style={styles.bannerCard}>
          {/* Accent Glow Icon */}
          <div style={styles.iconBox}>
            {isRecruiter ? (
              <Flame size={22} color="#F59E0B" />
            ) : (
              <Rocket size={22} color="#60A5FA" />
            )}
          </div>

          {/* Banner Message Content */}
          <div style={styles.textContainer}>
            <div style={styles.headerTitleRow}>
              <span style={styles.celebrateTag}>
                {isRecruiter ? '🎉 WELCOME BACK, RECRUITER' : '🎉 WELCOME BACK!'}
              </span>
              <span style={styles.roleBadge}>{userRole}</span>
            </div>

            <p style={styles.motivationText}>
              {isRecruiter ? (
                <>
                  Hello <strong style={{ color: '#F8FAFC' }}>{userName}</strong>! Ready to discover top 1% tech talent today? Your recruitment pipeline is active & synced! 🔥
                </>
              ) : (
                <>
                  Great to see you <strong style={{ color: '#F8FAFC' }}>{userName}</strong>! Your career journey continues. Let's land your dream tech job today! 🚀
                </>
              )}
            </p>
          </div>

          {/* Manual Dismiss Button */}
          <button
            onClick={handleClose}
            style={styles.closeBtn}
            title="Dismiss Celebration"
          >
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        {/* 5-SECOND COUNTDOWN PROGRESS BAR */}
        <div style={styles.progressBarTrack}>
          <div className="timer-progress-fill" style={styles.progressBarFill} />
        </div>
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  particleContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 999998,
    overflow: 'hidden',
  },
  bannerWrapper: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999999,
    maxWidth: '640px',
    width: '90%',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
  },
  bannerCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: '16px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  celebrateTag: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#60A5FA',
    letterSpacing: '0.06em',
  },
  roleBadge: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    padding: '1px 8px',
    borderRadius: '10px',
  },
  motivationText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#CBD5E1',
    lineHeight: 1.45,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  progressBarTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    boxShadow: '0 0 10px #3B82F6',
  },
};
