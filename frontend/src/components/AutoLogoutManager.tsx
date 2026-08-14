import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, AlertTriangle, LogOut, CheckCircle } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)
const WARNING_THRESHOLD_MS = 9 * 60 * 1000; // 9 minutes (540,000 ms)

export const AutoLogoutManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<any>(null);
  const logoutTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const lastThrottleRef = useRef<number>(0);

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('profile-photo-updated'));
    setShowWarning(false);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    navigate('/login');
  };

  const resetInactivityTimer = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(60);

    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    if (!localStorage.getItem('token')) return;

    // Set warning popup timer at 9 minutes (540,000 ms)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsRemaining(60);

      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActivityRef.current;
        const remaining = Math.max(0, Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);
    }, WARNING_THRESHOLD_MS);

    // Set hard logout timer at 10 minutes (600,000 ms)
    logoutTimerRef.current = setTimeout(() => {
      executeLogout();
    }, INACTIVITY_LIMIT_MS);
  };

  const handleUserActivity = () => {
    const now = Date.now();
    if (now - lastThrottleRef.current > 1000) {
      lastThrottleRef.current = now;
      if (!showWarning) {
        resetInactivityTimer();
      }
    }
  };

  useEffect(() => {
    if (!token || !userJson) {
      setShowWarning(false);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    resetInactivityTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [token, userJson, location.pathname]);

  if (!showWarning || !token) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        textAlign: 'center',
        border: '1px solid #F3F4F6'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#FEF3C7',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <AlertTriangle size={36} />
        </div>

        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>
          Session Expiring Soon
        </h3>

        <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
          Your session is about to expire due to inactivity.
        </p>

        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          color: '#B45309',
          padding: '12px',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '1rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Clock size={20} />
          <span>Automatic logout in {secondsRemaining} seconds</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={executeLogout}
            className="btn-secondary"
            style={{
              padding: '12px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#DC2626',
              borderColor: '#FECACA'
            }}
          >
            <LogOut size={16} />
            Logout Now
          </button>

          <button
            type="button"
            onClick={resetInactivityTimer}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#16A34A',
              borderColor: '#16A34A'
            }}
          >
            <CheckCircle size={16} />
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
};
