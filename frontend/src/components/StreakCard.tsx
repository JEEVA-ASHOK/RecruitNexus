import React, { useEffect, useState } from 'react';
import { Flame, Calendar, Award, RotateCcw } from 'lucide-react';
import { apiRequest } from '../api';
import { t } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
  lastLoginDate: string;
}

export const StreakCard: React.FC = () => {
  const { language } = useLanguage();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStreak = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiRequest('/activity/streak');
      if (res.data) {
        setStreak(res.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#6B7280' }}>
        <p>{t('streak.loading')}</p>
      </div>
    );
  }

  if (error || !streak) {
    return (
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#ef4444' }}>
        <p>{t('streak.error')}</p>
        <button
          onClick={fetchStreak}
          className="btn-secondary"
          style={{ marginTop: '8px', fontSize: '0.8rem', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} /> {t('streak.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(234,88,12,0.02) 100%)', border: '1px solid rgba(249,115,22,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={24} color="#f97316" style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.6))' }} />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('streak.current_streak')}
          </h3>
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316' }}>
          {streak.currentStreak} {streak.currentStreak === 1 ? t('streak.day') : t('streak.days')} 🔥
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={18} color="#eab308" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('streak.longest_streak')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {streak.longestStreak} {t('streak.days')}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="#3b82f6" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('streak.total_logins')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {streak.totalLogins} {t('streak.sessions')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
