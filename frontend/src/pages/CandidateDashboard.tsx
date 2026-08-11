import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { User, FileText, CheckCircle, Briefcase, Camera, Award, Bell, Clock, Calendar } from 'lucide-react';
import { t } from '../i18n';
import { useLanguage } from '../context/LanguageContext';
import { StreakCard } from '../components/StreakCard';
import { ActivityHistory } from '../components/ActivityHistory';
import { ProfilePhotoSelectorModal } from '../components/ProfilePhotoSelectorModal';

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobCompany?: string;
  status: string;
  matchingScore: number;
  appliedAt: string;
}

export const CandidateDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [education, setEducation] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'history'>('overview');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profRes, appRes, intRes] = await Promise.all([
        apiRequest('/profile'),
        apiRequest('/applications/my-applications'),
        apiRequest('/interviews')
      ]);

      if (profRes.data) {
        setProfile(profRes.data);
        setBio(profRes.data.bio || '');
        setSkills(profRes.data.skills || '');
        setExperienceYears(profRes.data.experienceYears || 0);
        setEducation(profRes.data.education || '');
      }

      if (appRes.data) {
        setApplications(appRes.data);
      }

      if (intRes.data) {
        setInterviews(intRes.data);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('skills', skills);
    formData.append('experienceYears', experienceYears.toString());
    formData.append('education', education);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      await apiRequest('/profile', 'POST', formData);
      fetchData();
    } catch {
      // Handle error
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        {t('common.loading')}
      </div>
    );
  }

  const highestScore = applications.reduce((max, a) => (a.matchingScore > max ? a.matchingScore : max), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f2fe, #4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 800, overflow: 'hidden' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.fullName?.charAt(0) || 'C'
              )}
            </div>
            <button
              onClick={() => setPhotoModalOpen(true)}
              style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              title={t('candidate.change_photo')}
            >
              <Camera size={14} />
            </button>
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('candidate.welcome', { name: user?.fullName || 'Candidate' })}
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--glass-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn-secondary ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            {t('candidate.overview')}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`btn-secondary ${activeTab === 'applications' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            {t('my_applications')} ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn-secondary ${activeTab === 'history' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            {t('activity.title')}
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Top Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('candidate.applied_jobs')}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{applications.length}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('candidate.upcoming_interviews')}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{interviews.length}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('candidate.best_fit_score')}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e' }}>{highestScore > 0 ? `${highestScore}%` : 'N/A'}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Left: Profile Settings Form */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('candidate.edit_profile_settings')}
              </h3>

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('candidate.professional_bio')}
                  </label>
                  <textarea
                    rows={3}
                    className="glass-input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your career background and interests..."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('skills')}
                    </label>
                    <input
                      type="text"
                      className="glass-input"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, TypeScript, C#, Python"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('candidate.experience_years')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="glass-input"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('candidate.education_details')}
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.S. Computer Science, Stanford University"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    {t('upload_resume')}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                    style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">
                    {t('save_profile')}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Streak & Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <StreakCard />
            </div>
          </div>
        </>
      )}

      {activeTab === 'applications' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('my_applications')}
          </h3>

          {applications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('candidate.no_recent_apps')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>{t('job_title')}</th>
                    <th style={{ padding: '12px' }}>{t('applied_on')}</th>
                    <th style={{ padding: '12px' }}>{t('fit_score')}</th>
                    <th style={{ padding: '12px' }}>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{app.jobTitle}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-purple">{app.matchingScore}%</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${app.status === 'Shortlisted' ? 'badge-green' : app.status === 'Rejected' ? 'badge-red' : 'badge'}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <ActivityHistory />
      )}

      <ProfilePhotoSelectorModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhoto={profilePhoto}
        onSelectPhoto={(photoUrl) => setProfilePhoto(photoUrl)}
      />
    </div>
  );
};
