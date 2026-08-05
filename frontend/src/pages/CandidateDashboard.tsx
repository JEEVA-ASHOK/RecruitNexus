import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { 
  Upload, FileText, User, Award, Clock, ArrowRight, ShieldCheck, Mail, Calendar, 
  CheckCircle2, AlertCircle, TrendingUp, Users, Target, Check, Compass, Bot, Star, Bell, Briefcase
} from 'lucide-react';
import { Translate } from '../components/Translate';
import { t } from '../i18n';
import { DashboardCard } from '../components/DashboardCard';
import { StatusTimeline } from '../components/StatusTimeline';

interface ProfileData {
  fullName: string;
  email: string;
  role: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  resumePath: string;
  education?: string;
  ai_Summary: string;
}

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobCompany: string;
  status: string;
  matchingScore: number;
  ai_Feedback: string;
  appliedAt: string;
  offerLetterContent?: string;
  offerStatus?: string;
}

interface Interview {
  id: number;
  applicationId?: number;
  jobTitle: string;
  interviewerName: string;
  interviewDate: string;
  format: string;
  meetingLink: string;
  status: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  companyName?: string;
  officeAddress?: string;
  venue?: string;
  reportingTime?: string;
  dressCode?: string;
  requiredDocuments?: string;
  notes?: string;
  candidateConfirmation?: string;
  resultStatus?: string;
  feedback?: string;
  remarks?: string;
}

interface RecommendedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salary: string;
}

export const CandidateDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  
  const [bioInput, setBioInput] = useState('');
  const [expInput, setExpInput] = useState(0);
  const [skillsInput, setSkillsInput] = useState('');
  const [eduInput, setEduInput] = useState('');

  // Local state to track interview checklists
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('interview_checklists');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleChecklistItem = (interviewId: number, itemKey: string) => {
    const key = `${interviewId}_${itemKey}`;
    setCheckedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('interview_checklists', JSON.stringify(updated));
      return updated;
    });
  };

  const calculateCompletion = () => {
    let score = 0;
    if (profile?.bio && profile.bio.trim().length > 0) score += 20;
    if (profile?.resumePath && profile.resumePath.trim().length > 0) score += 20;
    if (profile?.skills && profile.skills.length > 0) score += 20;
    if (profile?.education && profile.education.trim().length > 0) score += 20;
    if (profile?.experienceYears && profile.experienceYears > 0) score += 20;
    return score;
  };
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'interviews' | 'saved'>('profile');
  const [statusMsg, setStatusMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewingOfferApp, setViewingOfferApp] = useState<any | null>(null);

  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  const fetchSavedJobs = async () => {
    const { data, error } = await apiRequest<any[]>('/jobs/saved');
    if (!error && data) {
      setSavedJobs(data);
    }
  };

  const handleRemoveSavedJob = async (jobId: number) => {
    const { error } = await apiRequest(`/jobs/${jobId}/save`, 'DELETE');
    if (!error) {
      setSavedJobs(prev => prev.filter(sj => sj.id !== jobId));
    } else {
      alert(error);
    }
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    const { data, error } = await apiRequest<ProfileData>('/auth/profile');
    setProfileLoading(false);
    if (!error && data) {
      setProfile(data);
      setBioInput(data.bio || '');
      setExpInput(data.experienceYears || 0);
      setSkillsInput(data.skills ? data.skills.join(', ') : '');
      setEduInput(data.education || '');
    }
  };

  const fetchApplications = async () => {
    const { data, error } = await apiRequest<Application[]>('/applications');
    if (!error && data) {
      setApplications(data);
    }
  };

  const downloadOfferLetter = (app: any) => {
    const element = document.createElement("a");
    const file = new Blob([app.offerLetterContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Offer_Letter_${app.jobTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleOfferResponse = async (appId: number, response: 'Accepted' | 'Rejected') => {
    if (!confirm(`Are you sure you want to ${response.toLowerCase()} this job offer?`)) return;
    
    const { error } = await apiRequest(`/applications/${appId}/offer/respond`, 'PUT', {
      response: response
    });
    
    if (!error) {
      alert(`You have successfully ${response.toLowerCase()} the job offer.`);
      setViewingOfferApp(null);
      fetchApplications();
    } else {
      alert(error);
    }
  };

  const fetchInterviews = async () => {
    const { data, error } = await apiRequest<Interview[]>('/interviews');
    if (!error && data) {
      setInterviews(data);
    }
  };

  const fetchRecommendations = async () => {
    const { data, error } = await apiRequest<any[]>('/jobs');
    if (!error && data) {
      const formatted = data.slice(0, 3).map((j, i) => ({
        id: j.id,
        title: j.title,
        company: j.recruiterName,
        location: j.location,
        matchScore: 95 - (i * 2),
        salary: j.salaryRange || '$110k - $130k'
      }));
      setRecommendedJobs(formatted);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchInterviews();
    fetchRecommendations();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const handleInterviewAction = () => {
      fetchInterviews();
      fetchApplications();
    };
    window.addEventListener('interview-action-completed', handleInterviewAction);
    return () => window.removeEventListener('interview-action-completed', handleInterviewAction);
  }, []);

  const handleConfirmInterview = async (interviewId: number, status: string) => {
    const { error } = await apiRequest(`/interviews/${interviewId}/confirm`, 'PUT', { confirmation: status });
    if (!error) {
      fetchInterviews();
      window.dispatchEvent(new Event('interview-action-completed'));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const { error } = await apiRequest('/auth/profile', 'PUT', {
      bio: bioInput,
      experienceYears: expInput,
      skills: skillsArray,
      education: eduInput,
    });

    if (error) {
      setStatusMsg({ text: error, error: true });
    } else {
      setStatusMsg({ text: 'Profile updated successfully!', error: false });
      fetchProfile();
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await apiRequest('/auth/profile/resume', 'POST', formData, true);
    setUploading(false);

    if (error) {
      setStatusMsg({ text: error, error: true });
    } else {
      setStatusMsg({
        text: `Resume processed! AI extracted ${data.skills.length} skills and set experience to ${data.experienceYears} years.`,
        error: false,
      });
      setFile(null);
      fetchProfile();
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'badge';
      case 'reviewing': return 'badge-orange';
      case 'interviewing': return 'badge-purple';
      case 'offered': return 'badge-green';
      case 'rejected': return 'badge-red';
      default: return 'badge';
    }
  };

  // Calculate dynamic circular progress score based on resume status and skills
  const resumeScore = profile?.resumePath ? Math.min(60 + (profile.skills?.length * 4) + (profile.experienceYears * 2), 96) : 15;
  const strokeOffset = 251.2 - (251.2 * resumeScore) / 100; // Radius = 40 (circumference = 2 * PI * r = 251.2)

  if (profileLoading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Loading your dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      
      {/* Header and Welcome */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="text-gradient">Dashboard Overview</h1>
          <p style={styles.subtitle}>Welcome back, {profile?.fullName}! Here's your career progress.</p>
        </div>
        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'profile' ? '#00f2fe' : '#64748b',
              borderBottomColor: activeTab === 'profile' ? '#00f2fe' : 'transparent',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'applications' ? '#00f2fe' : '#64748b',
              borderBottomColor: activeTab === 'applications' ? '#00f2fe' : 'transparent',
            }}
          >
            {t('my_applications')} ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'interviews' ? '#00f2fe' : '#64748b',
              borderBottomColor: activeTab === 'interviews' ? '#00f2fe' : 'transparent',
            }}
          >
            {t('interviews_tab')} ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'saved' ? '#f59e0b' : '#64748b',
              borderBottomColor: activeTab === 'saved' ? '#f59e0b' : 'transparent',
            }}
          >
            ★ Saved Jobs ({savedJobs.length})
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={styles.alert} className={statusMsg.error ? 'badge-red' : 'badge-green'}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* OVERVIEW GRID MATCHING MOCKUP */}
      {activeTab === 'profile' && (
        <div style={styles.overviewGrid}>
          
          {/* Left Column (Stats + Recent Apps + Upload/Edit) */}
          <div style={styles.leftColumn}>
            
            {/* 4 Stats Counters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', width: '100%' }}>
              <DashboardCard 
                title="Applied Jobs" 
                value={applications.length} 
                subtext="Submitted applications" 
                icon={<Briefcase size={18} />} 
                accentColor="var(--accent-cyan)"
              />
              <DashboardCard 
                title="Interviews" 
                value={interviews.filter(i => new Date(i.interviewDate) > new Date()).length} 
                subtext="Upcoming live meetings" 
                icon={<Calendar size={18} />} 
                accentColor="#8b5cf6"
              />
              <DashboardCard 
                title="Best Fit Score" 
                value={applications.length > 0 ? `${Math.max(...applications.map(a => a.matchingScore), 0)}%` : 'N/A'} 
                subtext="Highest compatibility score" 
                icon={<Target size={18} />} 
                accentColor="#10b981"
              />
              <DashboardCard 
                title="Alerts" 
                value={applications.filter(a => a.status !== 'Applied').length + interviews.length} 
                subtext="Unread notifications" 
                icon={<Bell size={18} />} 
                accentColor="#ff007f"
              />
            </div>

            {/* Profile Completion Strength Card */}
            <div className="glass-panel" style={{ ...styles.panelCard, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ ...styles.panelTitle, margin: 0 }}>Profile Completion Strength</h3>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: calculateCompletion() === 100 ? '#10b981' : '#f59e0b' }}>
                  {calculateCompletion()}%
                </span>
              </div>
              
              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px' }}>
                <div 
                  style={{ 
                    width: `${calculateCompletion()}%`, 
                    height: '100%', 
                    background: calculateCompletion() === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>

              {/* Checklists */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: profile?.bio ? '#cbd5e1' : '#64748b' }}>
                  <span style={{ color: profile?.bio ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{profile?.bio ? '✓' : '○'}</span>
                  <span>Professional Bio</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: profile?.resumePath ? '#cbd5e1' : '#64748b' }}>
                  <span style={{ color: profile?.resumePath ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{profile?.resumePath ? '✓' : '○'}</span>
                  <span>Uploaded Resume</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: (profile?.skills && profile.skills.length > 0) ? '#cbd5e1' : '#64748b' }}>
                  <span style={{ color: (profile?.skills && profile.skills.length > 0) ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{(profile?.skills && profile.skills.length > 0) ? '✓' : '○'}</span>
                  <span>Skills Added</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: profile?.education ? '#cbd5e1' : '#64748b' }}>
                  <span style={{ color: profile?.education ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{profile?.education ? '✓' : '○'}</span>
                  <span>Education details</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: (profile?.experienceYears && profile.experienceYears > 0) ? '#cbd5e1' : '#64748b' }}>
                  <span style={{ color: (profile?.experienceYears && profile.experienceYears > 0) ? '#10b981' : '#64748b', fontWeight: 'bold' }}>{(profile?.experienceYears && profile.experienceYears > 0) ? '✓' : '○'}</span>
                  <span>Experience years</span>
                </div>
              </div>
            </div>

            {/* Recent Applications Feed */}
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.panelTitle}>Recent Applications</h3>
              {applications.length === 0 ? (
                <div style={styles.emptyMsg}>No recent job applications.</div>
              ) : (
                <div style={styles.recentAppsList}>
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} style={styles.recentAppRow}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{app.jobTitle}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{app.jobCompany} • Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <span className={getStatusBadgeClass(app.status)}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Upload Box */}
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.panelTitle}>Upload Resume</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>Upload your PDF or TXT resume to let Gemini AI automatically parse your details, skills, and work history.</p>
              
              <form onSubmit={handleResumeUpload} style={styles.form}>
                <div style={styles.fileDropZone}>
                  <Upload size={24} color="#64748b" style={{ marginBottom: '8px' }} />
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={styles.fileInput}
                    id="resume-file-picker"
                  />
                  <label htmlFor="resume-file-picker" style={styles.fileLabel}>
                    {file ? file.name : 'Select PDF or TXT Resume'}
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Max file size 5MB</span>
                </div>

                <button type="submit" className="btn-primary" disabled={uploading || !file} style={{ justifyContent: 'center' }}>
                  {uploading ? 'Processing with Gemini AI...' : 'AI Parse Resume'}
                </button>
              </form>
            </div>

            {/* Profile Editing Form */}
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.panelTitle}>Edit Profile Settings</h3>
              <form onSubmit={handleProfileUpdate} style={styles.form}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Full Name</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={profile?.fullName || ''}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Email Address</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={profile?.email || ''}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Professional Bio</label>
                  <textarea
                    rows={4}
                    className="glass-input"
                    placeholder="Tell recruiters about yourself..."
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Experience Years</label>
                  <input
                    type="number"
                    className="glass-input"
                    value={expInput}
                    onChange={(e) => setExpInput(Number(e.target.value))}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Education / Qualifications</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. B.Tech in Computer Science, Stanford University"
                    value={eduInput}
                    onChange={(e) => setEduInput(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Technical Skills (comma separated)</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. React, C#, SQL, TypeScript"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-secondary" style={{ justifyContent: 'center' }}>
                  Save Profile Details
                </button>
              </form>
            </div>

          </div>

          {/* Right Column (Resume Score + Recs + Insights) */}
          <div style={styles.rightColumn}>
            
            {/* AI Resume Analyzer Circular Gauge */}
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.panelTitle}>AI Resume Analyzer</h3>
              
              <div style={styles.circularScoreContainer}>
                {/* SVG Progress Circle */}
                <div style={styles.svgWrapper}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.02)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f2fe" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={styles.scoreTextInside}>{resumeScore}</div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#22c55e', display: 'block' }}>
                    {resumeScore >= 80 ? 'Excellent Score' : resumeScore >= 60 ? 'Good Score' : 'Action Required'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Your resume has been parsed by our Gemini parser. Follow instructions to improve.
                  </span>
                </div>
              </div>

              {/* Suggestions */}
              <div style={styles.suggestionsBox}>
                <h4 style={styles.boxSubTitle}>Suggestions</h4>
                <ul style={styles.suggestionList}>
                  <li style={styles.suggestionItem}>
                    <Check size={12} color="#22c55e" style={{ marginTop: '2px' }} />
                    <span>Add more quantifiable achievements.</span>
                  </li>
                  <li style={styles.suggestionItem}>
                    <Check size={12} color="#22c55e" style={{ marginTop: '2px' }} />
                    <span>Include key developer frameworks.</span>
                  </li>
                  <li style={styles.suggestionItem}>
                    <span style={{ ...styles.bulletCircle, backgroundColor: '#fbbf24' }}></span>
                    <span>Improve your professional summary section.</span>
                  </li>
                  <li style={styles.suggestionItem}>
                    <span style={{ ...styles.bulletCircle, backgroundColor: '#fbbf24' }}></span>
                    <span>Add technical skills certificates.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* AI Job Recommendations */}
            <div className="glass-panel" style={styles.panelCard}>
              <h3 style={styles.panelTitle}>AI Job Recommendations</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>Jobs recommended specifically for your skills</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendedJobs.map((rec) => (
                  <div key={rec.id} style={styles.recommendationCard}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{rec.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.company} • {rec.location}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#00f2fe' }}>{rec.matchScore}% Match</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{rec.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Career Insights */}
            <div className="glass-panel" style={{ ...styles.panelCard, border: '1px solid rgba(139,92,246,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Star size={16} color="#8b5cf6" style={{ filter: 'drop-shadow(0 0 4px #8b5cf6)' }} />
                <h3 style={{ ...styles.panelTitle, marginBottom: 0 }}>AI Career Insights</h3>
              </div>
              <div style={styles.insightBox}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ff007f', display: 'block', marginBottom: '4px' }}>
                  High Growth Skill For You
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', lineHeight: '1.4', marginBottom: '12px' }}>
                  Machine learning jobs have seen a +35% demand increase in your location. Add ML frameworks to get noticed.
                </span>
                <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                  Learn This Skill
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* APPLICATIONS TAB VIEW */}
      {activeTab === 'applications' && (
        <div className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <Clock size={20} color="#00f2fe" />
            <h2 style={styles.cardTitle}>{t('my_applications')}</h2>
          </div>

          {applications.length === 0 ? (
            <div style={styles.emptyMsg}>You haven't submitted any job applications yet.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>{t('job_title')}</th>
                    <th style={styles.th}>{t('recruiter_view')}</th>
                    <th style={styles.th}>{t('applied_on')}</th>
                    <th style={styles.th}>{t('fit_score')}</th>
                    <th style={styles.th}>{t('status')}</th>
                    <th style={styles.th}>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={styles.tr}>
                      <td style={styles.td}><strong>{app.jobTitle}</strong></td>
                      <td style={styles.td}>{app.jobCompany}</td>
                      <td style={styles.td}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <span className={`badge ${app.matchingScore >= 80 ? 'badge-green' : app.matchingScore >= 60 ? 'badge-purple' : 'badge-orange'}`}>
                          {app.matchingScore}%
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span className={getStatusBadgeClass(app.status)}>
                          {app.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            {selectedApp?.id === app.id ? 'Hide Feedback' : 'View AI Feedback'}
                          </button>

                          {app.offerLetterContent && (
                            <button
                              onClick={() => setViewingOfferApp(app)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#fbbf24', borderColor: '#fbbf24', color: '#000', fontWeight: 'bold' }}
                            >
                              ✉ View Offer ({app.offerStatus || 'Pending'})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedApp && (
            <div style={styles.feedbackDetail} className="glass-panel">
              <div style={styles.feedbackHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h4 style={{ color: '#00f2fe', margin: 0 }}>AI Match Report for {selectedApp.jobTitle}</h4>
                  <span className={`badge ${selectedApp.matchingScore >= 80 ? 'badge-green' : selectedApp.matchingScore >= 60 ? 'badge-purple' : 'badge-orange'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                    {selectedApp.matchingScore}% Match Score
                  </span>
                </div>
                <button style={styles.closeBtn} onClick={() => setSelectedApp(null)}>×</button>
              </div>
              <StatusTimeline 
                currentStatus={selectedApp.status} 
                interviews={interviews.filter(i => i.applicationId === selectedApp.id)} 
              />
              <p style={styles.feedbackText}><Translate text={selectedApp.ai_Feedback} /></p>

              {/* Optional Skills Breakdown */}
              {(() => {
                const feedback = selectedApp.ai_Feedback || '';
                const matchMatch = feedback.match(/matching skills?:?\s*([^.]+)/i) || feedback.match(/strong alignment with\s*([^.]+)/i);
                const gapMatch = feedback.match(/missing skills?:?\s*([^.]+)/i) || feedback.match(/gap detected in\s*([^.]+)/i) || feedback.match(/skill gap in\s*([^.]+)/i);
                
                const matchingSkills = matchMatch ? matchMatch[1].split(/,|\s+and\s+/i).map(s => s.trim()).filter(Boolean) : [];
                const missingSkills = gapMatch ? gapMatch[1].split(/,|\s+and\s+/i).map(s => s.trim()).filter(Boolean) : [];

                if (matchingSkills.length === 0 && missingSkills.length === 0) return null;

                return (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matchingSkills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Matching Skills:</span>
                        {matchingSkills.map((sk, idx) => (
                          <span key={idx} className="badge badge-green" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{sk}</span>
                        ))}
                      </div>
                    )}
                    {missingSkills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Skill Gaps:</span>
                        {missingSkills.map((sk, idx) => (
                          <span key={idx} className="badge badge-orange" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* INTERVIEWS TAB VIEW */}
      {activeTab === 'interviews' && (
        <div className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <Calendar size={20} color="#00f2fe" />
            <h2 style={styles.cardTitle}>{t('interviews_tab')}</h2>
          </div>

          {interviews.length === 0 ? (
            <div style={styles.emptyMsg}>No upcoming interviews scheduled yet.</div>
          ) : (
            <div style={styles.gridList}>
              {interviews.map((i) => (
                <div key={i.id} style={styles.interviewCard} className="glass-panel">
                  <div style={styles.interviewCardHeader}>
                    <h3 style={styles.interviewJobTitle}>{i.jobTitle}</h3>
                    <span className="badge badge-purple">{i.format}</span>
                  </div>

                  {/* Urgent Dashboard Warning banner */}
                  {(() => {
                    const intTime = new Date(i.interviewDate).getTime();
                    const nowTime = new Date().getTime();
                    const diffHours = (intTime - nowTime) / (1000 * 60 * 60);
                    const diffDays = diffHours / 24;

                    if (i.status === 'Scheduled' && diffHours > 0) {
                      let bannerText = '';
                      let isUrgent = false;

                      if (diffHours <= 2) {
                        bannerText = '🚨 Urgent Reminder: Your interview starts in less than 2 hours!';
                        isUrgent = true;
                      } else if (diffDays <= 1) {
                        bannerText = '⏳ Reminder: Your interview is tomorrow!';
                      } else if (diffDays <= 3) {
                        bannerText = '⏳ Reminder: Your interview is in less than 3 days!';
                      } else if (diffDays <= 5) {
                        bannerText = '⏳ Reminder: Your interview is in less than 5 days!';
                      }

                      if (bannerText) {
                        return (
                          <div 
                            style={{ 
                              padding: '12px 16px', 
                              borderRadius: '8px', 
                              backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 191, 36, 0.15)', 
                              borderLeft: isUrgent ? '4px solid #ef4444' : '4px solid #fbbf24',
                              color: isUrgent ? '#fca5a5' : '#fde047',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              marginTop: '8px',
                              marginBottom: '16px'
                            }}
                          >
                            {bannerText}
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                  <div style={styles.interviewMetaList}>
                    <div style={styles.interviewMeta}>
                      <Calendar size={16} color="#64748b" />
                      <span><strong>Date & Time:</strong> {new Date(i.interviewDate).toLocaleString()}</span>
                    </div>
                    <div style={styles.interviewMeta}>
                      <User size={16} color="#64748b" />
                      <span><strong>Interviewer Name:</strong> {i.interviewerName}</span>
                    </div>

                    {/* HR Contact Details */}
                    {(i.hrName || i.hrEmail || i.hrPhone) && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>HR Contact Information</span>
                        {i.hrName && <div style={styles.interviewMeta}><span><strong>HR Name:</strong> {i.hrName}</span></div>}
                        {i.hrEmail && <div style={styles.interviewMeta}><span><strong>HR Email:</strong> {i.hrEmail}</span></div>}
                        {i.hrPhone && <div style={styles.interviewMeta}><span><strong>HR Phone:</strong> {i.hrPhone}</span></div>}
                      </div>
                    )}

                    {/* Format Specific Details */}
                    {i.format === 'InPerson' && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>In-Person Venue Details</span>
                        {i.companyName && <div style={styles.interviewMeta}><span><strong>Company Name:</strong> {i.companyName}</span></div>}
                        {i.officeAddress && <div style={styles.interviewMeta}><span><strong>Office Address:</strong> {i.officeAddress}</span></div>}
                        {i.venue && <div style={styles.interviewMeta}><span><strong>Venue:</strong> {i.venue}</span></div>}
                        {i.reportingTime && <div style={styles.interviewMeta}><span><strong>Reporting Time:</strong> {i.reportingTime}</span></div>}
                        {i.dressCode && <div style={styles.interviewMeta}><span><strong>Dress Code:</strong> {i.dressCode}</span></div>}
                        {i.requiredDocuments && <div style={styles.interviewMeta}><span><strong>Required Documents:</strong> {i.requiredDocuments}</span></div>}
                      </div>
                    )}

                    {i.notes && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Candidate Notes</span>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, whiteSpace: 'pre-line' }}>{i.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Interview Preparation Checklist */}
                  <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', display: 'block', marginBottom: '8px' }}>📋 Interview Preparation Checklist</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ accentColor: '#10b981' }} 
                          checked={!!checkedItems[`${i.id}_resume`]} 
                          onChange={() => toggleChecklistItem(i.id, 'resume')}
                        />
                        <span style={{ textDecoration: checkedItems[`${i.id}_resume`] ? 'line-through' : 'none', color: checkedItems[`${i.id}_resume`] ? '#64748b' : '#cbd5e1' }}>
                          Resume (Bring 2 printed copies)
                        </span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ accentColor: '#10b981' }} 
                          checked={!!checkedItems[`${i.id}_gov_id`]} 
                          onChange={() => toggleChecklistItem(i.id, 'gov_id')}
                        />
                        <span style={{ textDecoration: checkedItems[`${i.id}_gov_id`] ? 'line-through' : 'none', color: checkedItems[`${i.id}_gov_id`] ? '#64748b' : '#cbd5e1' }}>
                          Government ID (Original & copy)
                        </span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ accentColor: '#10b981' }} 
                          checked={!!checkedItems[`${i.id}_certs`]} 
                          onChange={() => toggleChecklistItem(i.id, 'certs')}
                        />
                        <span style={{ textDecoration: checkedItems[`${i.id}_certs`] ? 'line-through' : 'none', color: checkedItems[`${i.id}_certs`] ? '#64748b' : '#cbd5e1' }}>
                          Certificates (Educational / Professional)
                        </span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ accentColor: '#10b981' }} 
                          checked={!!checkedItems[`${i.id}_dress`]} 
                          onChange={() => toggleChecklistItem(i.id, 'dress')}
                        />
                        <span style={{ textDecoration: checkedItems[`${i.id}_dress`] ? 'line-through' : 'none', color: checkedItems[`${i.id}_dress`] ? '#64748b' : '#cbd5e1' }}>
                          Formal Dress: {i.dressCode || 'Clean and Ironed Formal Wear'}
                        </span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ accentColor: '#10b981' }} 
                          checked={!!checkedItems[`${i.id}_reporting`]} 
                          onChange={() => toggleChecklistItem(i.id, 'reporting')}
                        />
                        <span style={{ textDecoration: checkedItems[`${i.id}_reporting`] ? 'line-through' : 'none', color: checkedItems[`${i.id}_reporting`] ? '#64748b' : '#cbd5e1' }}>
                          Reporting Time: {i.reportingTime || new Date(i.interviewDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </label>
                    </div>
                  </div>

                  {i.candidateConfirmation === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleConfirmInterview(i.id, 'Confirmed')}
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                      >
                        Confirm Attendance
                      </button>
                      <button
                        onClick={() => handleConfirmInterview(i.id, 'CannotAttend')}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Cannot Attend
                      </button>
                      <button
                        onClick={() => handleConfirmInterview(i.id, 'RescheduleRequested')}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: '#8b5cf6' }}
                      >
                        Request Reschedule
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Attendance Status:</span>
                      <span className={`badge ${i.candidateConfirmation === 'Confirmed' ? 'badge-green' : i.candidateConfirmation === 'CannotAttend' ? 'badge-orange' : 'badge-purple'}`}>
                        {i.candidateConfirmation}
                      </span>
                    </div>
                  )}
                  {i.status === 'Completed' && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>Interview Result & Feedback</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className={`badge ${i.resultStatus === 'Selected' ? 'badge-green' : i.resultStatus === 'Rejected' ? 'badge-red' : i.resultStatus === 'OnHold' ? 'badge-orange' : 'badge-purple'}`}>
                          {i.resultStatus || 'Completed'}
                        </span>
                      </div>
                      {i.feedback && <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0', lineHeight: 1.4 }}><strong>Feedback:</strong> {i.feedback}</p>}
                      {i.remarks && <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0' }}><strong>Remarks:</strong> {i.remarks}</p>}
                    </div>
                  )}
                  {i.format === 'Online' && i.meetingLink && (
                    <a
                      href={i.meetingLink.startsWith('http') ? i.meetingLink : `https://${i.meetingLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ marginTop: '12px', fontSize: '0.85rem', width: 'fit-content' }}
                    >
                      <CheckCircle2 size={16} />
                      Join Meeting
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* SAVED JOBS TAB PANEL */}
      {activeTab === 'saved' && (
        <div className="glass-panel" style={{ ...styles.panelCard, padding: '24px' }}>
          <h2 style={styles.panelTitle}>★ Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
              You don't have any saved jobs yet. Browse jobs to save them!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {savedJobs.map(job => (
                <div 
                  key={job.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0' }}>{job.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>🏢 {job.companyName || job.recruiterName || 'Unknown'}</span>
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salaryRange || 'Undisclosed'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <a 
                      href={`/jobs?jobId=${job.id}`} 
                      className="btn-primary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Apply Now
                    </a>
                    <button 
                      onClick={() => handleRemoveSavedJob(job.id)}
                      className="btn-secondary"
                      style={{ padding: '6px 16px', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* CANDIDATE VIEW OFFER LETTER MODAL */}
      {viewingOfferApp && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '600px', width: '90%' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>✉ Official Offer Letter</span>
                <h3 style={styles.modalTitle} className="text-gradient">{viewingOfferApp.jobCompany}</h3>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Position: {viewingOfferApp.jobTitle}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewingOfferApp(null)}>×</button>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <div 
                style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  fontFamily: 'monospace', 
                  fontSize: '0.85rem', 
                  lineHeight: 1.5, 
                  color: '#fff', 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {viewingOfferApp.offerLetterContent}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => downloadOfferLetter(viewingOfferApp)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ⬇ Download as TXT
              </button>

              {viewingOfferApp.offerStatus === 'Pending' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleOfferResponse(viewingOfferApp.id, 'Rejected')}
                    className="btn-secondary"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#ef4444', color: '#fca5a5' }}
                  >
                    Reject Offer
                  </button>
                  <button 
                    onClick={() => handleOfferResponse(viewingOfferApp.id, 'Accepted')}
                    className="btn-primary"
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    Accept Offer
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.9rem' }}>
                  You have already <strong style={{ 
                    color: viewingOfferApp.offerStatus === 'Accepted' ? '#10b981' : '#ef4444' 
                  }}>{viewingOfferApp.offerStatus.toLowerCase()}</strong> this offer.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '20px',
    textAlign: 'left',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '2px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: '2.2fr 1fr',
    gap: '32px',
    flexWrap: 'wrap',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  statsCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '20px',
  },
  statMiniCard: {
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'left',
  },
  statMiniLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  statMiniNumGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  statMiniNum: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fff',
  },
  panelCard: {
    padding: '28px',
    borderRadius: '16px',
    textAlign: 'left',
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '16px',
  },
  recentAppsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recentAppRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  fileDropZone: {
    border: '2px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.01)',
    cursor: 'pointer',
    position: 'relative',
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  fileLabel: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  circularScoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  svgWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    flexShrink: 0,
  },
  scoreTextInside: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#fff',
  },
  suggestionsBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '12px',
    padding: '16px',
  },
  boxSubTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  suggestionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: 0,
    margin: 0,
    listStyle: 'none',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#94a3b8',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  bulletCircle: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  recommendationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  insightBox: {
    background: 'rgba(139,92,246,0.02)',
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'left',
  },
  card: {
    padding: '32px',
    height: 'fit-content',
    textAlign: 'left',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#64748b',
    padding: '30px 0',
    fontSize: '0.9rem',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  th: {
    padding: '14px 16px',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    fontSize: '0.95rem',
  },
  tr: {
    transition: 'background 0.2s',
  },
  feedbackDetail: {
    marginTop: '24px',
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 242, 254, 0.1)',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  feedbackText: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  gridList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  interviewCard: {
    padding: '24px',
  },
  interviewCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  interviewJobTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  interviewMetaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  interviewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
};
