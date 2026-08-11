import React, { useEffect, useState } from 'react';
import { Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../api';
import { t } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

interface ActivityLogItem {
  id: number;
  action: string;
  details: string;
  ipAddress: string;
  status: string;
  createdAt: string;
}

export const ActivityHistory: React.FC = () => {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/activity/logs')
      .then(({ data }) => {
        if (data) setLogs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Clock size={20} color="#3b82f6" />
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('activity.title')}
        </h3>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('common.loading')}</p>
      ) : logs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('activity.no_login_history')}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>{t('activity.timeline')}</th>
                <th style={{ padding: '10px 12px' }}>{t('activity.device')}</th>
                <th style={{ padding: '10px 12px' }}>{t('activity.status')}</th>
                <th style={{ padding: '10px 12px' }}>{t('activity.timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.details || log.ipAddress || 'Browser Session'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: log.status === 'Success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: log.status === 'Success' ? '#22c55e' : '#ef4444'
                    }}>
                      {log.status === 'Success' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {log.status === 'Success' ? t('activity.successful') : t('activity.failed')}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
