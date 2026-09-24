import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { 
  Bookmark, Search, MapPin, Briefcase, FileText, Send, X, AlertCircle, 
  Trash2, ExternalLink, Check, Clock, ChevronRight, Sparkles 
} from 'lucide-react';
import { recordRecentlyViewedJob } from '../utils/recentlyViewedJobs';
import { CompanyLogo } from '../components/CompanyLogo';

interface Job {
  id: number;
  recruiterName: string;
  companyName?: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  applicationDeadline?: string;
  companyId?: number;
}

export const SavedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<{ text: string; error: boolean } | null>(null);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn || !user || user.role !== 'Candidate') {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
    fetchUserApplications();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await apiRequest<Job[]>('/jobs/saved');
    setLoading(false);

    if (error) {
      setErrorMsg(typeof error === 'string' ? error : 'Failed to load saved jobs. Please try again.');
    } else if (data) {
      const list = Array.isArray(data) ? data : ((data as any).items || []);
      setSavedJobs(list);
      if (list.length > 0 && !selectedJob) {
        setSelectedJob(list[0]);
      }
    }
  };

  const fetchUserApplications = async () => {
    const { data } = await apiRequest('/applications');
    if (data) {
      setUserApplications(Array.isArray(data) ? data : ((data as any).items || []));
    }
  };

  const handleUnsaveJob = async (jobId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { error } = await apiRequest(`/jobs/${jobId}/save`, 'DELETE');
    if (!error) {
      const updated = savedJobs.filter(j => j.id !== jobId);
      setSavedJobs(updated);
      if (selectedJob?.id === jobId) {
        setSelectedJob(updated.length > 0 ? updated[0] : null);
      }
    } else {
      alert(typeof error === 'string' ? error : 'Failed to unsave job.');
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    if (user?.id || user?.userId) {
      recordRecentlyViewedJob(job, user.id || user.userId);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplying(true);
    setApplyMsg(null);

    const { data, error } = await apiRequest(`/applications/submit/${selectedJob.id}`, 'POST', {
      coverLetter
    });

    setApplying(false);
    if (error) {
      setApplyMsg({ text: typeof error === 'string' ? error : 'Failed to submit application.', error: true });
    } else {
      setApplyMsg({ text: `Application submitted successfully! Fit Score: ${data.matchScore || 85}%`, error: false });
      setCoverLetter('');
      fetchUserApplications();
      setTimeout(() => {
        setShowApplyModal(false);
        setApplyMsg(null);
      }, 2500);
    }
  };

  const hasApplied = (jobId: number) => {
    return userApplications.some(a => a.jobId === jobId);
  };

  const filteredJobs = savedJobs.filter(j => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (j.title || '').toLowerCase();
    const company = (j.recruiterName || j.companyName || '').toLowerCase();
    const location = (j.location || '').toLowerCase();
    const reqs = (j.requirements || '').toLowerCase();
    return title.includes(q) || company.includes(q) || location.includes(q) || reqs.includes(q);
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px', minHeight: '80vh' }}>
      
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px 28px',
          borderRadius: '16px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bookmark size={24} color="#2563EB" fill="#2563EB" />
            <span>Saved Jobs ({savedJobs.length})</span>
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748B' }}>
            Your bookmarked opportunities and bookmarked position applications.
          </p>
        </div>

        {/* Search Input for Saved Jobs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', minWidth: '260px' }}>
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Search saved jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem', color: '#0F172A' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Split Layout: Left Saved Cards List, Right Details Pane */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748B', fontSize: '1rem', fontWeight: 600 }}>
          Loading your saved jobs...
        </div>
      ) : savedJobs.length === 0 ? (
        <div 
          className="glass-panel"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={36} color="#2563EB" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            No saved jobs found
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748B', maxWidth: '420px', lineHeight: 1.5 }}>
            Explore open job listings on RecruitNexus and click the bookmark icon on any job card to save positions for quick access later.
          </p>
          <Link to="/jobs" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', marginTop: '8px' }}>
            Explore Open Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: List of Saved Jobs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredJobs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                No saved jobs match "{searchQuery}".
              </div>
            ) : (
              filteredJobs.map(job => {
                const isActive = selectedJob?.id === job.id;
                const applied = hasApplied(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className="glass-panel"
                    style={{
                      padding: '18px 20px',
                      borderRadius: '14px',
                      background: '#FFFFFF',
                      border: isActive ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.12)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CompanyLogo name={job.companyName || job.recruiterName} size={40} />
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>{job.title}</h3>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', fontWeight: 600, color: '#2563EB' }}>
                            {job.recruiterName || job.companyName}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleUnsaveJob(job.id, e)}
                        title="Remove from saved"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#DC2626' }}
                      >
                        <Bookmark size={18} color="#2563EB" fill="#2563EB" />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#64748B', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={13} /> {job.jobType}</span>
                      {job.salaryRange && <span>₹ {job.salaryRange}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {applied ? (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '3px 10px', borderRadius: '12px', border: '1px solid #86EFAC', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Applied
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563EB' }}>Click to view details</span>
                      )}
                      <ChevronRight size={16} color="#94A3B8" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Job View */}
          {selectedJob && (
            <div 
              className="glass-panel"
              style={{
                padding: '28px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                position: 'sticky',
                top: '90px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>{selectedJob.title}</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 700, color: '#2563EB' }}>
                    {selectedJob.recruiterName || selectedJob.companyName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnsaveJob(selectedJob.id)}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', borderColor: '#FCA5A5' }}
                >
                  <Trash2 size={14} />
                  <span>Unsave</span>
                </button>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{selectedJob.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Job Type</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{selectedJob.jobType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Salary</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>₹ {selectedJob.salaryRange || 'Unspecified'}</div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginBottom: '24px' }}>
                {hasApplied(selectedJob.id) ? (
                  <button
                    disabled
                    style={{ width: '100%', padding: '12px', background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '10px', fontWeight: 700, fontSize: '0.92rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <Check size={18} />
                    <span>Application Submitted</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <Send size={18} />
                    <span>Apply Now</span>
                  </button>
                )}
              </div>

              {/* Requirements & Skills */}
              {selectedJob.requirements && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Key Skills & Requirements
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedJob.requirements.split(',').map((req, i) => (
                      <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
                        {req.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Job Description
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedJob.description}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
          <div className="glass-panel" style={{ background: '#FFFFFF', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Apply for {selectedJob.title}
              </h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {applyMsg && (
              <div style={{ background: applyMsg.error ? '#FEE2E2' : '#DCFCE7', color: applyMsg.error ? '#991B1B' : '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '16px' }}>
                {applyMsg.text}
              </div>
            )}

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Cover Letter / Introduction Note (Optional)
                </label>
                <textarea
                  rows={4}
                  className="glass-input"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself to the recruiter and highlight why you are a strong fit..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={applying} className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} />
                  <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
