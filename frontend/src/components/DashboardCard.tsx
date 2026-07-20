import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtext,
  icon,
  accentColor = 'var(--accent-cyan)'
}) => {
  return (
    <div className="glass-panel" style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <div style={{ ...styles.iconContainer, color: accentColor, backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
          {icon}
        </div>
      </div>
      <div style={styles.value}>{value}</div>
      {subtext && <div style={styles.subtext}>{subtext}</div>}
    </div>
  );
};

const styles = {
  card: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    flex: 1,
    minWidth: '220px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  iconContainer: {
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: '1.1',
  },
  subtext: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
};
