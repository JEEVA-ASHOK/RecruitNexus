import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DashboardCard } from '../components/DashboardCard';
import { 
  Briefcase, FileText, Users, UserCheck, Calendar, Clock, CheckCircle2, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalyticsData {
  global: {
    totalJobs: number;
    totalApplications: number;
    totalRecruiters: number;
    totalCandidates: number;
    totalInterviews: number;
    pendingApplications: number;
    selectedCandidates: number;
    rejectedCandidates: number;
  };
  recruiter: {
    totalJobs: number;
    totalApplications: number;
    totalInterviews: number;
    pendingApplications: number;
    selectedCandidates: number;
    rejectedCandidates: number;
  } | null;
  monthlyTrend: { month: string; count: number }[];
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'Admin';

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const { data: resData, error: resErr } = await apiRequest<AnalyticsData>('/analytics/summary');
      setLoading(false);
      if (resErr) {
        setError(resErr);
      } else {
        setData(resData);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  if (error || !data) {
    return (
      <div style={styles.errorContainer}>
        <AlertTriangle size={48} color="#f87171" style={{ marginBottom: '16px' }} />
        <h2>Failed to load analytics dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error || 'No data returned'}</p>
        <Link to="/dashboard" className="btn-primary">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Choose stats object based on role
  const stats = !isAdmin && data.recruiter ? data.recruiter : data.global;

  // SVG Chart calculation parameters
  const chartHeight = 200;
  const chartWidth = 500;
  const padding = 30;
  const maxCount = Math.max(...data.monthlyTrend.map(d => d.count), 5);

  const points = data.monthlyTrend.map((d, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (data.monthlyTrend.length - 1 || 1);
    const y = chartHeight - padding - (d.count * (chartHeight - padding * 2)) / maxCount;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div style={{ flex: 1, marginLeft: '16px' }}>
          <h1 style={styles.title} className="text-gradient">Recruitment Analytics</h1>
          <p style={styles.subtitle}>
            {isAdmin ? 'Global recruitment metrics overview across the platform.' : 'Pipeline analytics for your posted job openings.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <DashboardCard 
          title="Total Openings" 
          value={stats.totalJobs} 
          icon={<Briefcase size={20} />} 
          accentColor="var(--accent-cyan)" 
        />
        <DashboardCard 
          title="Total Applications" 
          value={stats.totalApplications} 
          icon={<FileText size={20} />} 
          accentColor="var(--accent-blue)" 
        />
        {isAdmin && (
          <>
            <DashboardCard 
              title="Total Recruiters" 
              value={data.global.totalRecruiters} 
              icon={<Users size={20} />} 
              accentColor="var(--accent-purple)" 
            />
            <DashboardCard 
              title="Registered Candidates" 
              value={data.global.totalCandidates} 
              icon={<UserCheck size={20} />} 
              accentColor="#10b981" 
            />
          </>
        )}
        <DashboardCard 
          title="Interviews Scheduled" 
          value={stats.totalInterviews} 
          icon={<Calendar size={20} />} 
          accentColor="#eab308" 
        />
      </div>

      {/* Lower Row Grid */}
      <div style={styles.rowGrid}>
        {/* Monthly Applications Chart */}
        <div className="glass-panel" style={styles.chartCard}>
          <h3 style={styles.cardTitle}>Application Intake Trend</h3>
          <div style={styles.chartContainer}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              {Array.from({ length: 4 }).map((_, idx) => {
                const y = padding + (idx * (chartHeight - padding * 2)) / 3;
                const val = Math.round(maxCount - (idx * maxCount) / 3);
                return (
                  <g key={idx}>
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                    <text x={padding - 5} y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {/* Trend Line Path */}
              {points.length > 0 && (
                <>
                  <path d={pathD} fill="none" stroke="url(#line-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`} fill="url(#area-grad)" opacity="0.1" />
                </>
              )}

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="var(--accent-cyan)" stroke="#0a0b10" strokeWidth="2" />
                  <text x={p.x} y={chartHeight - 8} fill="var(--text-muted)" fontSize="9" textAnchor="middle">{p.month.split(' ')[0]}</text>
                </g>
              ))}

              {/* Gradients */}
              <defs>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent-blue)" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" />
                </linearGradient>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Funnel breakdown */}
        <div className="glass-panel" style={styles.breakdownCard}>
          <h3 style={styles.cardTitle}>Funnel Breakdown</h3>
          <div style={styles.funnelList}>
            <div style={styles.funnelItem}>
              <div style={{ ...styles.indicator, backgroundColor: '#eab308' }} />
              <div style={{ flex: 1 }}>
                <span style={styles.funnelLabel}>Pending Evaluation</span>
                <span style={styles.funnelDesc}>Applications waiting to be screened or scheduled</span>
              </div>
              <span style={styles.funnelValue}>{stats.pendingApplications}</span>
            </div>

            <div style={styles.funnelItem}>
              <div style={{ ...styles.indicator, backgroundColor: '#10b981' }} />
              <div style={{ flex: 1 }}>
                <span style={styles.funnelLabel}>Selected & Offered</span>
                <span style={styles.funnelDesc}>Shortlisted candidates successfully placed</span>
              </div>
              <span style={styles.funnelValue}>{stats.selectedCandidates}</span>
            </div>

            <div style={styles.funnelItem}>
              <div style={{ ...styles.indicator, backgroundColor: '#ef4444' }} />
              <div style={{ flex: 1 }}>
                <span style={styles.funnelLabel}>Rejected & Closed</span>
                <span style={styles.funnelDesc}>Applications rejected or positions archiving</span>
              </div>
              <span style={styles.funnelValue}>{stats.rejectedCandidates}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: 0,
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
  },
  statsGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '20px',
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  chartCard: {
    padding: '24px',
  },
  breakdownCard: {
    padding: '24px',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '20px',
  },
  chartContainer: {
    height: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  funnelList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  funnelItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    gap: '12px',
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  funnelLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'block',
  },
  funnelDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  funnelValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
  },
  errorContainer: {
    maxWidth: '500px',
    margin: '100px auto',
    padding: '40px 20px',
    textAlign: 'center' as const,
  }
};
