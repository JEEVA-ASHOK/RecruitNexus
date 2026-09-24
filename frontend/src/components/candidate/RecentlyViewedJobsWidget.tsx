import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Briefcase, ChevronRight, Eye } from 'lucide-react';
import { getRecentlyViewedJobs, RecentlyViewedJob } from '../../utils/recentlyViewedJobs';
import { CompanyLogo } from '../CompanyLogo';

interface RecentlyViewedJobsWidgetProps {
  userId?: number | string;
}

export const RecentlyViewedJobsWidget: React.FC<RecentlyViewedJobsWidgetProps> = ({ userId }) => {
  const [recentJobs, setRecentJobs] = useState<RecentlyViewedJob[]>([]);

  useEffect(() => {
    if (!userId) return;

    const loadJobs = () => {
      const list = getRecentlyViewedJobs(userId);
      setRecentJobs(list);
    };

    loadJobs();
    window.addEventListener('recently-viewed-updated', loadJobs);
    return () => window.removeEventListener('recently-viewed-updated', loadJobs);
  }, [userId]);

  if (!userId || recentJobs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Clock size={20} color="#2563EB" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
            Recently Viewed Jobs
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
          No recently viewed jobs yet. Browse open positions on the <Link to="/jobs" style={{ color: '#2563EB', fontWeight: 700 }}>Find Jobs</Link> page to keep track of interesting opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#2563EB" />
          <span>Recently Viewed Jobs ({recentJobs.length})</span>
        </h3>
        <Link to="/jobs" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>View All Listings</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {recentJobs.slice(0, 4).map(job => (
          <Link
            key={job.id}
            to={`/jobs?jobId=${job.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div 
              style={{
                padding: '14px 16px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CompanyLogo name={job.recruiterName} size={36} />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563EB' }}>
                    {job.recruiterName}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Briefcase size={12} /> {job.jobType}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
