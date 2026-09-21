import React from 'react';
import { Users, Award, Briefcase, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { DashboardCard } from '../DashboardCard';

export interface Job {
  id: number;
  recruiterId: number;
  title: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  applicationCount: number;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobCompany?: string;
  candidateId: number;
  candidateName: string;
  coverLetter: string;
  resumePath: string;
  matchingScore: number;
  ai_Questions?: string;
  ai_Feedback?: string;
  recruiterNotes?: string;
  status: string;
  appliedAt: string;
  offerLetterContent?: string;
  offerStatus?: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  interviewDate: string;
  status: string;
  meetingLink?: string;
  notes?: string;
  format?: string;
  ai_Questions?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  companyName?: string;
  officeAddress?: string;
  venue?: string;
  reportingTime?: string;
  dressCode?: string;
  requiredDocuments?: string;
  candidateConfirmation?: string;
  resultStatus?: string;
  feedback?: string;
  remarks?: string;
}

const defaultStyles: Record<string, React.CSSProperties> = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  card: { background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: '#374151', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  tbody: { background: '#ffffff' },
  td: { padding: '16px', fontSize: '0.875rem', color: '#111827' },
};

interface RecruiterStatsProps {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  styles?: Record<string, React.CSSProperties>;
}

export const RecruiterStats: React.FC<RecruiterStatsProps> = ({
  jobs,
  applications,
  interviews,
  styles = defaultStyles
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top KPI Cards */}
          <div style={styles.statsGrid}>
            <DashboardCard
              title="Total Applications"
              value={applications.length}
              icon={<Users size={20} color="#2563EB" />}
              subtext="Total Resumes Received"
            />
            <DashboardCard
              title="Average AI Match Score"
              value={applications.length > 0 ? Math.round(applications.reduce((acc, a) => acc + (a.matchingScore || 0), 0) / applications.length) + '%' : '0%'}
              icon={<Award size={20} color="#10b981" />}
              subtext="Candidate Quality Mean"
            />
            <DashboardCard
              title="Interview Shortlist Rate"
              value={applications.length > 0 ? Math.round((applications.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length / applications.length) * 100) + '%' : '0%'}
              icon={<Calendar size={20} color="#8b5cf6" />}
              subtext="Candidates Advanced"
            />
            <DashboardCard
              title="Placement Offer Rate"
              value={applications.length > 0 ? Math.round((applications.filter(a => a.status === 'Offered').length / applications.length) * 100) + '%' : '0%'}
              icon={<TrendingUp size={20} color="#f59e0b" />}
              subtext="Offer Issuance Ratio"
            />
          </div>

          {/* Grid Layout: Hiring Funnel + AI Match Tier Distribution */}
          <div style={styles.grid}>
            {/* Hiring Funnel Breakdown */}
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <TrendingUp size={20} color="#2563EB" />
                <h2 style={styles.cardTitle}>Hiring Funnel Stage Conversion</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { stage: 'Applied', count: applications.filter(a => a.status === 'Applied').length, color: '#2563EB' },
                  { stage: 'Reviewing', count: applications.filter(a => a.status === 'Reviewing').length, color: '#3b82f6' },
                  { stage: 'Interviewing', count: applications.filter(a => a.status === 'Interviewing').length, color: '#8b5cf6' },
                  { stage: 'Offered', count: applications.filter(a => a.status === 'Offered').length, color: '#10b981' },
                  { stage: 'Hired', count: applications.filter(a => a.status === 'Offered' && a.offerStatus === 'Accepted').length, color: '#22c55e' },
                ].map((item) => {
                  const pct = applications.length > 0 ? Math.round((item.count / applications.length) * 100) : 0;
                  return (
                    <div key={item.stage} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B7280' }}>
                        <span style={{ fontWeight: 600 }}>{item.stage}</span>
                        <span>{item.count} candidates ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendation Tiers Breakdown */}
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <Award size={20} color="#10b981" />
                <h2 style={styles.cardTitle}>AI Match Score Tier Distribution</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { tier: '⭐ Highly Recommended (95-100)', count: applications.filter(a => a.matchingScore >= 95).length, badgeClass: 'badge-green', color: '#10b981' },
                  { tier: '👍 Recommended (85-94)', count: applications.filter(a => a.matchingScore >= 85 && a.matchingScore < 95).length, badgeClass: 'badge-purple', color: '#8b5cf6' },
                  { tier: '💡 Consider (70-84)', count: applications.filter(a => a.matchingScore >= 70 && a.matchingScore < 85).length, badgeClass: 'badge-orange', color: '#f59e0b' },
                  { tier: '⚠️ Not Recommended (<70)', count: applications.filter(a => a.matchingScore < 70).length, badgeClass: 'badge-red', color: '#ef4444' },
                ].map((item) => {
                  const pct = applications.length > 0 ? Math.round((item.count / applications.length) * 100) : 0;
                  return (
                    <div key={item.tier} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{item.tier}</span>
                        <span style={{ color: '#6B7280' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pure SVG Monthly Application Trend Curve */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <BarChart3 size={20} color="#8b5cf6" />
              <h2 style={styles.cardTitle}>Monthly Application Trend</h2>
            </div>
            <div style={{ marginTop: '20px', padding: '10px 0' }}>
              {(() => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const now = new Date();
                const trendData = [];
                for (let i = 5; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const mName = months[d.getMonth()];
                  const count = applications.filter(a => {
                    const appDate = new Date(a.appliedAt);
                    return appDate.getMonth() === d.getMonth() && appDate.getFullYear() === d.getFullYear();
                  }).length;
                  trendData.push({ label: mName, count });
                }

                const maxCount = Math.max(...trendData.map(t => t.count), 5);
                const points = trendData.map((t, idx) => {
                  const x = 50 + idx * 90;
                  const y = 160 - (t.count / maxCount) * 120;
                  return `${x},${y}`;
                }).join(' ');

                const areaPoints = `50,160 ${points} ${50 + (trendData.length - 1) * 90},160`;

                return (
                  <svg viewBox="0 0 550 200" style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[40, 80, 120, 160].map((gh) => (
                      <line key={gh} x1="40" y1={gh} x2="520" y2={gh} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                    ))}

                    {/* Filled Area */}
                    <polygon points={areaPoints} fill="url(#trend-grad)" />

                    {/* Trend Line */}
                    <polyline points={points} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points & X Labels */}
                    {trendData.map((t, idx) => {
                      const x = 50 + idx * 90;
                      const y = 160 - (t.count / maxCount) * 120;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="5" fill="#8b5cf6" stroke="#2563EB" strokeWidth="2" />
                          <text x={x} y={y - 10} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">{t.count}</text>
                          <text x={x} y="180" fill="#6B7280" fontSize="10" textAnchor="middle">{t.label}</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Top Performing Jobs Table */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Briefcase size={20} color="#f59e0b" />
              <h2 style={styles.cardTitle}>Top Performing Job Vacancies</h2>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Job Title</th>
                    <th style={styles.th}>Total Applications</th>
                    <th style={styles.th}>Avg AI Score</th>
                    <th style={styles.th}>Shortlisted</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>No active jobs to calculate role metrics.</td>
                    </tr>
                  ) : (
                    jobs.map((j) => {
                      const jApps = applications.filter(a => a.jobTitle === j.title || a.jobId === j.id);
                      const avgScore = jApps.length > 0 ? Math.round(jApps.reduce((acc, a) => acc + (a.matchingScore || 0), 0) / jApps.length) : 0;
                      const shortlisted = jApps.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length;

                      return (
                        <tr key={j.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 'bold', color: '#111827' }}>{j.title}</td>
                          <td style={styles.td}>{jApps.length} candidates</td>
                          <td style={styles.td}>
                            <span className={`badge ${avgScore >= 80 ? 'badge-green' : avgScore >= 60 ? 'badge-purple' : 'badge-orange'}`}>
                              {avgScore}% Mean
                            </span>
                          </td>
                          <td style={styles.td}>{shortlisted} shortlisted</td>
                          <td style={styles.td}>
                            <span className={`badge ${j.status === 'Open' ? 'badge-green' : 'badge-red'}`}>
                              {j.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
};

export default RecruiterStats;
