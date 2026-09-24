import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { User, FileText, CheckCircle, Briefcase, Camera, Award, Bell, Clock, Calendar } from 'lucide-react';
import { t } from '../i18n';
import { useLanguage } from '../context/LanguageContext';
import { ActivityHistory } from '../components/ActivityHistory';
import { ProfilePhotoSelectorModal } from '../components/ProfilePhotoSelectorModal';
import { PersonalInformationModal, PersonalInfo } from '../components/candidate/PersonalInformationModal';
import { ProfileCompletionCard } from '../components/candidate/ProfileCompletionCard';
import { CandidateProfessionalProfile } from '../components/candidate/CandidateProfessionalProfile';
import { RecentlyViewedJobsWidget } from '../components/candidate/RecentlyViewedJobsWidget';
import { calculateProfileCompletion } from '../utils/profileCompletion';

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

  // Candidate Profile Draft Form State
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [education, setEducation] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Candidate Saved Profile State & Persistence
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savedBio, setSavedBio] = useState('');
  const [savedSkills, setSavedSkills] = useState('');
  const [savedExperienceYears, setSavedExperienceYears] = useState(0);
  const [savedEducation, setSavedEducation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Resume Upload & Analysis State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [fetchingAts, setFetchingAts] = useState(false);
  const [atsErrorMsg, setAtsErrorMsg] = useState('');
  const [detectedSkillsFromResume, setDetectedSkillsFromResume] = useState<string[]>([]);
  const [detectedEducationFromResume, setDetectedEducationFromResume] = useState('');
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'history' | 'onboarding' | 'ats' | 'simulated_interview'>('overview');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loadingOnboardingData, setLoadingOnboardingData] = useState(false);
  const [completedChecklist, setCompletedChecklist] = useState<number[]>([]);

  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  // AI Interview Simulator State
  const [simulatingInterview, setSimulatingInterview] = useState<any | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [candidateAnswers, setCandidateAnswers] = useState<Record<number, string>>({});
  const [submittingInterview, setSubmittingInterview] = useState(false);
  const [interviewEvaluationResult, setInterviewEvaluationResult] = useState<any | null>(null);

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Phase 1 Personal Information & Completion State
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    if (!user) return;
    const uId = user.id || user.userId;
    const storageKey = `candidate_personal_info_${uId}`;

    const loadInfo = () => {
      const savedJson = localStorage.getItem(storageKey);
      if (savedJson) {
        try {
          const parsed = JSON.parse(savedJson);
          setPersonalInfo(parsed);
        } catch {}
      }
    };

    loadInfo();

    const handleOpenModal = () => setPersonalInfoModalOpen(true);
    const handleUpdated = (e: any) => {
      if (e.detail) {
        setPersonalInfo(e.detail);
      } else {
        loadInfo();
      }
    };

    window.addEventListener('open-personal-info-modal', handleOpenModal);
    window.addEventListener('personal-info-updated', handleUpdated);

    return () => {
      window.removeEventListener('open-personal-info-modal', handleOpenModal);
      window.removeEventListener('personal-info-updated', handleUpdated);
    };
  }, [userJson]);

  const getProfileCompletionDetails = () => {
    return calculateProfileCompletion({
      user,
      profile: {
        bio: savedBio || profile?.bio,
        skills: savedSkills || profile?.skills,
        experienceYears: savedExperienceYears || profile?.experienceYears,
        education: savedEducation || profile?.education,
        resumePath: profile?.resumePath,
        firstName: personalInfo.firstName || profile?.firstName,
        lastName: personalInfo.lastName || profile?.lastName,
        gender: personalInfo.gender || profile?.gender,
        dateOfBirth: personalInfo.dateOfBirth || profile?.dateOfBirth,
        phoneNumber: personalInfo.phone || profile?.phoneNumber,
        address: personalInfo.address || profile?.address,
        city: personalInfo.city || profile?.city,
        country: personalInfo.country || profile?.country
      },
      personalInfo,
      applicationsCount: applications.length
    });
  };

  const startAiInterviewSession = async (interviewItem: any) => {
    setSimulatingInterview(interviewItem);
    setCurrentQuestionIdx(0);
    setCandidateAnswers({});
    setInterviewEvaluationResult(null);
    setLoading(true);

    const { data, error } = await apiRequest<any>(`/interviews/${interviewItem.id}/start-ai-interview`, 'POST');
    setLoading(false);

    if (!error && data) {
      try {
        const parsed = JSON.parse(data.questions);
        const qList = parsed.Questions || parsed.questions || parsed.TechnicalQuestions || [];
        setInterviewQuestions(qList.length > 0 ? qList : [
          { QuestionText: "Explain component architecture and state management principles in full stack applications.", Category: "Technical" },
          { QuestionText: "Describe a project deadline conflict and how you managed stakeholder expectations.", Category: "Behavioral" },
          { QuestionText: "What are your primary technical strengths for this position?", Category: "HR" }
        ]);
      } catch {
        setInterviewQuestions([
          { QuestionText: "Explain dependency injection and design pattern implementation.", Category: "Technical" },
          { QuestionText: "Describe a challenging technical problem you solved under tight timelines.", Category: "Behavioral" }
        ]);
      }
    }
  };

  const handleFinishAiInterview = async () => {
    if (!simulatingInterview) return;

    setSubmittingInterview(true);
    const qaList = interviewQuestions.map((q: any, idx: number) => {
      const rawAns = candidateAnswers[idx] ? candidateAnswers[idx].trim() : '';
      return {
        questionNumber: idx + 1,
        category: q.Category || q.category || "Technical",
        questionText: q.QuestionText || q.questionText || "Question",
        candidateAnswer: rawAns.length > 0 ? rawAns : "[Skipped]"
      };
    });

    const { data, error } = await apiRequest<any>(`/interviews/${simulatingInterview.id}/complete-ai-interview`, 'POST', { qaList });
    setSubmittingInterview(false);

    if (!error && data) {
      setInterviewEvaluationResult(data);
      fetchData();
    }
  };

  const fetchAtsAnalysis = async (jobId?: number) => {
    if (loadingAts) return;
    const targetJobId = jobId || selectedJobForAnalysis || (applications.length > 0 ? applications[0].jobId : 0);
    setLoadingAts(true);
    setAtsErrorMsg('');

    const endpoint = targetJobId > 0
      ? `/auth/profile/analyze-resume?jobId=${targetJobId}`
      : `/auth/profile/analyze-resume`;

    const { data, error } = await apiRequest<any>(endpoint, 'POST');
    setLoadingAts(false);
    if (!error && data) {
      setAtsAnalysis(data);
      if (data.skillsDetected) setDetectedSkillsFromResume(data.skillsDetected);
      if (data.education && data.education.length > 0) setDetectedEducationFromResume(data.education[0]);
    } else if (error) {
      const errStr = typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? String((error as any).message) : 'Error executing resume analysis.');
      setAtsErrorMsg(errStr);
    }
  };

  useEffect(() => {
    fetchData();
    const loadStoredPhoto = () => {
      const uJson = localStorage.getItem('user');
      const uObj = uJson ? JSON.parse(uJson) : null;
      const uId = uObj?.id || uObj?.userId;

      // Purge legacy un-scoped global photo keys
      localStorage.removeItem('candidatePhoto');
      localStorage.removeItem('profilePhoto');
      localStorage.removeItem('avatar');

      if (uId) {
        const stored = localStorage.getItem(`profilePhoto_${uId}`);
        setProfilePhoto(stored || null);
      } else {
        setProfilePhoto(null);
      }
    };
    loadStoredPhoto();
    window.addEventListener('profile-photo-updated', loadStoredPhoto);
    return () => window.removeEventListener('profile-photo-updated', loadStoredPhoto);
  }, []);

  const fetchOnboardingData = async (appId?: number) => {
    const targetApp = applications.find(a => a.status === 'Offered' || a.status === 'Shortlisted') || applications[0];
    const targetId = appId || (targetApp ? targetApp.id : 1);
    
    setLoadingOnboardingData(true);
    const { data, error } = await apiRequest<any>('/ai/generate-onboarding', 'POST', { applicationId: targetId });
    setLoadingOnboardingData(false);
    if (!error && data) {
      setOnboardingData(data);
    }
  };

  const fetchData = async () => {
    try {
      const [profRes, appRes, intRes] = await Promise.all([
        apiRequest('/auth/profile'),
        apiRequest('/applications'),
        apiRequest('/interviews')
      ]);

      if (profRes.data) {
        const pData = profRes.data.profile || profRes.data;
        setProfile(profRes.data);
        if (user) {
          const uId = user.id || user.userId;
          const proExtraJson = localStorage.getItem(`candidate_pro_details_${uId}`);
          const proExtra = proExtraJson ? JSON.parse(proExtraJson) : {};
          localStorage.setItem(`cached_profile_${uId}`, JSON.stringify({ ...pData, ...proExtra }));
        }

        const fBio = pData.bio || '';
        const fSkills = Array.isArray(pData.skills)
          ? pData.skills.join(', ')
          : (pData.skills || '');
        const fExp = pData.experienceYears || 0;
        const fEdu = pData.education || '';

        setSavedBio(fBio);
        setSavedSkills(fSkills);
        setSavedExperienceYears(fExp);
        setSavedEducation(fEdu);

        setBio(fBio);
        setSkills(fSkills);
        setExperienceYears(fExp);
        setEducation(fEdu);

        if (pData.firstName || pData.lastName || pData.gender || pData.dateOfBirth || pData.phoneNumber || pData.phone || pData.address || pData.city || pData.country) {
          setPersonalInfo(prev => ({
            ...prev,
            firstName: pData.firstName || prev.firstName,
            lastName: pData.lastName || prev.lastName,
            gender: pData.gender || prev.gender,
            dateOfBirth: pData.dateOfBirth || prev.dateOfBirth,
            phone: pData.phoneNumber || pData.phone || prev.phone,
            address: pData.address || prev.address,
            city: pData.city || prev.city,
            country: pData.country || prev.country
          }));
        }
      }

      if (appRes.data) {
        setApplications(Array.isArray(appRes.data) ? appRes.data : (appRes.data.items || []));
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

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');

    const skillsArray = typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(skills) ? skills : []);

    const payload = {
      bio,
      skills: skillsArray,
      experienceYears: Number(experienceYears) || 0,
      education
    };

    const { data, error } = await apiRequest('/auth/profile', 'PUT', payload);
    setSavingProfile(false);

    if (!error) {
      setProfileSuccessMsg('Profile details updated and saved successfully to database!');
      setIsEditingProfile(false);
      
      setSavedBio(bio);
      setSavedSkills(Array.isArray(skillsArray) ? skillsArray.join(', ') : skills);
      setSavedExperienceYears(Number(experienceYears) || 0);
      setSavedEducation(education);

      fetchData();
    } else {
      setProfileSuccessMsg('Failed to save profile details. Please try again.');
    }
  };

  const handleCancelEditProfile = () => {
    setBio(savedBio);
    setSkills(savedSkills);
    setExperienceYears(savedExperienceYears);
    setEducation(savedEducation);
    setIsEditingProfile(false);
    setProfileSuccessMsg('');
  };

  const handleApplyDetectedSkills = () => {
    if (detectedSkillsFromResume.length > 0) {
      const existingList = savedSkills ? savedSkills.split(',').map(s => s.trim()).filter(Boolean) : [];
      const combined = Array.from(new Set([...existingList, ...detectedSkillsFromResume]));
      setSkills(combined.join(', '));
    }
    if (detectedEducationFromResume) {
      setEducation(detectedEducationFromResume);
    }
    setProfileSuccessMsg('Detected skills & education loaded into profile draft! Click Save to confirm.');
    setIsEditingProfile(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploadingResume(true);
    setAtsErrorMsg('');
    setProfileSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await apiRequest<any>('/auth/profile/resume', 'POST', formData);
    setUploadingResume(false);

    if (error) {
      const errStr = typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? String((error as any).message) : 'Error uploading resume file.');
      setAtsErrorMsg(errStr);
      return;
    }

    if (data) {
      setProfileSuccessMsg('Resume uploaded and extracted successfully!');
      if (data.analysis) {
        setAtsAnalysis(data.analysis);
        if (data.analysis.skillsDetected) setDetectedSkillsFromResume(data.analysis.skillsDetected);
        if (data.analysis.education && data.analysis.education.length > 0) setDetectedEducationFromResume(data.analysis.education[0]);
      }
      fetchData();
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
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 800, overflow: 'hidden' }}>
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
          <button
            onClick={() => {
              setActiveTab('ats');
              fetchAtsAnalysis();
            }}
            className={`btn-secondary ${activeTab === 'ats' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', color: activeTab === 'ats' ? '#2563EB' : '#4B5563', fontWeight: 600 }}
          >
            🎯 AI Resume Analyzer
          </button>
          <button
            onClick={() => {
              setActiveTab('simulated_interview');
            }}
            className={`btn-secondary ${activeTab === 'simulated_interview' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', color: activeTab === 'simulated_interview' ? '#2563EB' : '#4B5563', fontWeight: 600 }}
          >
            🎙️ AI Interview Simulator ({interviews.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('onboarding');
              fetchOnboardingData();
            }}
            className={`btn-secondary ${activeTab === 'onboarding' ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px' }}
          >
            🚀 Pre-Joining & Onboarding
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {(() => {
            const { percentage, missingFields, sections, statusMessage } = getProfileCompletionDetails();
            return (
              <div style={{ marginBottom: '24px' }}>
                <ProfileCompletionCard
                  percentage={percentage}
                  missingFields={missingFields}
                  statusMessage={statusMessage}
                  sections={sections}
                  onOpenPersonalModal={() => setPersonalInfoModalOpen(true)}
                  onOpenProfessionalProfile={() => {
                    setIsEditingProfile(true);
                    const el = document.getElementById('professional-profile-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenResumeTab={() => {
                    setActiveTab('ats');
                  }}
                />
              </div>
            );
          })()}

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
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: highestScore > 0 ? '#22c55e' : '#9CA3AF' }}>
                  {highestScore > 0 ? `${highestScore}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                  Highest AI match across your applications
                </div>
              </div>
            </div>
          </div>

          {/* Recently Viewed Jobs History */}
          <div style={{ marginBottom: '24px' }}>
            <RecentlyViewedJobsWidget userId={user?.id || user?.userId} />
          </div>

          {/* Candidate Professional Profile */}
          <div id="professional-profile-card" style={{ marginBottom: '24px' }}>
            <CandidateProfessionalProfile
              user={user}
              profileData={profile}
              onProfileUpdated={() => fetchData()}
              onOpenResumeTab={() => setActiveTab('ats')}
            />
          </div>

          {/* Resume Upload & Management Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#111827', fontWeight: 800 }}>
                  📄 Candidate Resume Document
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5563' }}>
                  {profile?.resumePath ? (
                    <span>Current File: <strong style={{ color: '#2563EB' }}>{profile.resumePath}</strong> (PDF, DOCX, TXT max 5 MB)</span>
                  ) : (
                    <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No resume uploaded yet (PDF, DOCX, TXT max 5 MB supported)</span>
                  )}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="file"
                  id="profile-resume-upload-input"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('profile-resume-upload-input')?.click()}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? 'Uploading...' : (profile?.resumePath ? '🔄 Replace Resume' : '📤 Upload Resume')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ats');
                    fetchAtsAnalysis();
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                  disabled={fetchingAts || !profile?.resumePath}
                >
                  {fetchingAts ? 'Analyzing...' : '⚡ Analyze Resume'}
                </button>
              </div>
            </div>

            {atsErrorMsg && (
              <div style={{ marginTop: '14px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '0.88rem' }}>
                ⚠️ {atsErrorMsg}
              </div>
            )}
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
                        <span className="badge badge-purple">
                          {app.matchingScore > 0 ? `${app.matchingScore}%` : 'N/A'}
                        </span>
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

      {activeTab === 'onboarding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Onboarding Welcome Header */}
          <div className="glass-panel text-gradient" style={{ padding: '28px', borderRadius: '16px', borderLeft: '4px solid #8b5cf6' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 800 }}>
              🎉 Employee Pre-Joining & Onboarding Portal
            </h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Welcome to the team! Here is your personalized pre-joining checklist, Day 1 orientation schedule, and 30-60-90 day roadmap.
            </p>
          </div>

          {loadingOnboardingData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8b5cf6' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Loading your AI onboarding package...</div>
            </div>
          ) : onboardingData ? (
            <>
              {/* Welcome Message Card */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <span>✉️</span> Personalized Welcome Message
                </h3>
                <p style={{ color: '#111827', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {onboardingData.welcomeMessage}
                </p>
              </div>

              {/* Interactive Checklist & Progress Bar */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>☑️</span> Pre-Joining Checklist Tasks
                  </h3>
                  <span className="badge badge-green">
                    {completedChecklist.length} / {(onboardingData.checklist || []).length} Completed
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(onboardingData.checklist || []).map((item: string, idx: number) => {
                    const isChecked = completedChecklist.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setCompletedChecklist(prev => 
                            isChecked ? prev.filter(i => i !== idx) : [...prev, idx]
                          );
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                          border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16A34A' }}
                        />
                        <span style={{
                          fontSize: '0.9rem',
                          color: isChecked ? '#15803D' : '#111827',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          fontWeight: 500,
                        }}>
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* First Day Agenda & Manager Note */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#2563EB', fontWeight: '700' }}>
                    📅 First Day Schedule & Orientation
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(onboardingData.firstDayAgenda || []).map((agenda: string, idx: number) => (
                      <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E5E7EB', fontSize: '0.85rem', color: '#374151' }}>
                        {agenda}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#D97706', fontWeight: '700' }}>
                    💬 Manager Welcome Note & Contact
                  </h3>
                  <p style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    {onboardingData.managerNote}
                  </p>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', fontWeight: 600 }}>PRE-JOINING HELP DESK</span>
                    <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: '600' }}>hr-onboarding@recruitnexus.com</span>
                  </div>
                </div>
              </div>

              {/* 30-60-90 Day Goals */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#7C3AED', fontWeight: '700' }}>
                  🚀 30-60-90 Day Professional Success Plan
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>MONTH 1 (30 DAYS)</span>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#374151', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {(onboardingData.learningPlan30Days || []).map((goal: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>MONTH 2 (60 DAYS)</span>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#374151', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {(onboardingData.learningPlan60Days || []).map((goal: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>MONTH 3 (90 DAYS)</span>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#374151', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {(onboardingData.learningPlan90Days || []).map((goal: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
              <p style={{ color: '#6B7280', margin: 0 }}>Select an accepted offer application to view your AI onboarding package.</p>
            </div>
          )}
        </div>
      )}

      {/* AI RESUME ANALYZER TAB */}
      {activeTab === 'ats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header & Application Picker */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid #2563EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
                  🎯 AI Resume Analyzer & ATS Score
                </h2>
                <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem' }}>
                  Analyze your resume content against specific applied job descriptions using Gemini AI parser.
                </p>
              </div>

              {applications.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select
                    value={selectedAppId || applications[0].id}
                    onChange={(e) => {
                      const id = parseInt(e.target.value, 10);
                      setSelectedAppId(id);
                      const selectedApp = applications.find(app => app.id === id);
                      if (selectedApp) {
                        fetchAtsAnalysis(selectedApp.jobId);
                      }
                    }}
                    className="glass-input"
                    style={{ padding: '8px 12px', fontSize: '0.88rem', fontWeight: 600, color: '#111827', width: 'auto' }}
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.jobTitle} - {app.jobCompany}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => fetchAtsAnalysis()}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={loadingAts}
                  >
                    {loadingAts ? 'Analyzing...' : '⚡ Analyze Resume'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {loadingAts ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#2563EB' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Running Gemini AI ATS Resume Analysis...</div>
            </div>
          ) : atsAnalysis ? (
            <>
              {/* Score Gauge & Overview Card */}
              <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'center' }}>
                
                {/* Circular Score Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ 
                    width: '140px', 
                    height: '140px', 
                    borderRadius: '50%', 
                    border: `8px solid ${atsAnalysis.atsScore >= 90 ? '#16A34A' : atsAnalysis.atsScore >= 70 ? '#2563EB' : atsAnalysis.atsScore >= 50 ? '#D97706' : '#DC2626'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F8FAFC',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                      {atsAnalysis.atsScore}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginTop: '4px' }}>
                      OUT OF 100
                    </span>
                  </div>

                  <span className="badge" style={{ 
                    marginTop: '16px', 
                    fontSize: '0.82rem', 
                    fontWeight: 700,
                    padding: '6px 14px',
                    background: atsAnalysis.atsScore >= 90 ? '#DCFCE7' : atsAnalysis.atsScore >= 70 ? '#DBEAFE' : atsAnalysis.atsScore >= 50 ? '#FEF3C7' : '#FEE2E2',
                    color: atsAnalysis.atsScore >= 90 ? '#15803D' : atsAnalysis.atsScore >= 70 ? '#1E40AF' : atsAnalysis.atsScore >= 50 ? '#B45309' : '#B91C1C',
                    border: `1px solid ${atsAnalysis.atsScore >= 90 ? '#BBF7D0' : atsAnalysis.atsScore >= 70 ? '#BFDBFE' : atsAnalysis.atsScore >= 50 ? '#FDE68A' : '#FCA5A5'}`
                  }}>
                    {atsAnalysis.atsScore >= 90 ? '🏆 Excellent Match' : atsAnalysis.atsScore >= 70 ? '👍 Good Match' : atsAnalysis.atsScore >= 50 ? '💡 Average Match' : '⚠️ Needs Improvement'}
                  </span>
                </div>

                {/* Summary & Keyword Match */}
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: '#111827', fontWeight: 800 }}>
                    Executive Resume Summary
                  </h3>
                  <p style={{ color: '#374151', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                    {atsAnalysis.executiveSummary}
                  </p>

                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 700, color: '#111827' }}>Target Keyword Match Density</span>
                      <span style={{ fontWeight: 800, color: '#2563EB' }}>{atsAnalysis.keywordMatchPercentage}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${atsAnalysis.keywordMatchPercentage}%`, background: '#2563EB', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Skills vs Missing Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✅</span> Detected Skills Found ({atsAnalysis.skillsDetected?.length || 0})
                    </h3>
                    <button
                      onClick={handleApplyDetectedSkills}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '4px 10px', backgroundColor: '#F0FDF4', color: '#166534', borderColor: '#86EFAC', fontWeight: 700 }}
                    >
                      ✨ Sync to Profile Draft
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(atsAnalysis.skillsDetected || []).map((skill: string, idx: number) => (
                      <span key={idx} style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#DC2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span> Missing Skills & Keywords ({atsAnalysis.missingSkills?.length || 0})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(atsAnalysis.missingSkills || []).map((skill: string, idx: number) => (
                      <span key={idx} style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Job-Specific Compatibility Assessment Card */}
              {atsAnalysis.jobTitle && (
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid #7C3AED' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#111827', fontWeight: 800 }}>
                    🎯 Job-Specific Compatibility Breakdown
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', display: 'block' }}>TARGET JOB ROLE</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563EB', display: 'block', margin: '4px 0 8px 0' }}>
                        {atsAnalysis.jobTitle}
                      </span>
                      <span className="badge" style={{ background: '#F3E8FF', color: '#6B21A8', padding: '4px 10px', fontSize: '0.82rem', fontWeight: 700 }}>
                        Overall Match: {atsAnalysis.overallMatchScore || atsAnalysis.atsScore}%
                      </span>
                    </div>

                    <div>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D' }}>Matched Role Skills:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {(atsAnalysis.matchedSkills || atsAnalysis.skillsDetected || []).map((sk: string, i: number) => (
                            <span key={i} style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#B91C1C' }}>Missing Role Keywords:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {(atsAnalysis.missingSkills || []).map((sk: string, i: number) => (
                            <span key={i} style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#2563EB', fontWeight: 800 }}>
                    💪 Resume Strengths
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {(atsAnalysis.strengths || []).map((str: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#D97706', fontWeight: 800 }}>
                    🔍 Areas for Improvement
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {(atsAnalysis.weaknesses || []).map((wk: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Improvement Suggestions */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#7C3AED', fontWeight: 800 }}>
                  🚀 Actionable ATS Optimization Suggestions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(atsAnalysis.improvementSuggestions || []).map((sug: string, idx: number) => (
                    <div key={idx} style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', color: '#374151', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#7C3AED' }}>#{idx + 1}</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Certifications & Suitable Roles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#16A34A', fontWeight: 800 }}>
                    🎓 Recommended Certifications
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(atsAnalysis.recommendedCertifications || []).map((cert: string, idx: number) => (
                      <div key={idx} style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#2563EB', fontWeight: 800 }}>
                    💼 Best Suitable Job Roles
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(atsAnalysis.bestSuitableRoles || []).map((role: string, idx: number) => (
                      <div key={idx} style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.85rem', color: '#111827', fontWeight: 600 }}>
                        {role}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download PDF & Re-Analyze */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => fetchAtsAnalysis()}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  🔄 Analyze Again
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  📄 Download ATS Report (PDF)
                </button>
              </div>

            </>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
              <p style={{ color: '#6B7280', margin: '0 0 16px 0', fontSize: '1rem' }}>
                Select an applied job above to run your AI ATS Resume Analysis.
              </p>
              <button
                onClick={() => fetchAtsAnalysis()}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                ⚡ Generate ATS Analysis
              </button>
            </div>
          )}

        </div>
      )}

      {/* AI INTERVIEW SIMULATOR TAB */}
      {activeTab === 'simulated_interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Banner */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid #2563EB' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
              🎙️ Interactive AI Interview Simulator
            </h2>
            <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem' }}>
              Simulate real-world technical and HR interview rounds with instant Gemini AI multi-dimensional scoring and feedback.
            </p>
          </div>

          {/* ACTIVE SIMULATION INTERVIEW SESSION */}
          {simulatingInterview ? (
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
              
              {/* Question Header Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                <div>
                  <span className="badge badge-purple" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                    {simulatingInterview.format || 'Technical'} Interview Round
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                    Question {currentQuestionIdx + 1} of {interviewQuestions.length}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', fontWeight: 600 }}>SIMULATED TIMER</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
                      ⏱️ 02:45
                    </span>
                  </div>

                  <button 
                    onClick={() => setSimulatingInterview(null)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Exit Session
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', width: '100%', background: '#E5E7EB', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentQuestionIdx + 1) / Math.max(interviewQuestions.length, 1)) * 100}%`, background: '#2563EB', borderRadius: '3px', transition: 'width 0.3s ease' }} />
              </div>

              {/* Question Card */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  {interviewQuestions[currentQuestionIdx]?.Category || 'Technical Domain Question'}
                </span>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.5 }}>
                  {interviewQuestions[currentQuestionIdx]?.QuestionText || interviewQuestions[currentQuestionIdx]?.questionText || 'Describe your approach to building resilient microservices APIs.'}
                </p>
                {interviewQuestions[currentQuestionIdx]?.Rationale && (
                  <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                    💡 Tip: {interviewQuestions[currentQuestionIdx]?.Rationale}
                  </p>
                )}
              </div>

              {/* Answer Textarea */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Your Answer Response:
                </label>
                <textarea
                  rows={6}
                  value={candidateAnswers[currentQuestionIdx] || ''}
                  onChange={(e) => setCandidateAnswers({ ...candidateAnswers, [currentQuestionIdx]: e.target.value })}
                  placeholder="Type your detailed answer response here... Include relevant architectural principles, tools, and impact metrics."
                  className="glass-input"
                  style={{ width: '100%', padding: '14px', fontSize: '0.92rem', color: '#111827', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '10px', lineHeight: 1.5 }}
                />
              </div>

              {/* Navigation Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  ← Previous Question
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setCandidateAnswers({ ...candidateAnswers, [currentQuestionIdx]: '[Skipped]' });
                      if (currentQuestionIdx < interviewQuestions.length - 1) {
                        setCurrentQuestionIdx(prev => prev + 1);
                      }
                    }}
                    className="btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.88rem', color: '#D97706', borderColor: '#FCD34D', backgroundColor: '#FFFBEB' }}
                  >
                    ⏭️ Skip Question
                  </button>

                  {currentQuestionIdx < interviewQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                      className="btn-primary"
                      style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishAiInterview}
                      className="btn-primary"
                      style={{ padding: '10px 28px', fontSize: '0.88rem', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                      disabled={submittingInterview}
                    >
                      {submittingInterview ? 'Evaluating Results...' : '✅ Finish & Submit Interview'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : interviewEvaluationResult ? (
            /* COMPLETED INTERVIEW REPORT CARD */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Overall Score & Recommendation Card */}
              <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'center' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ 
                    width: '140px', 
                    height: '140px', 
                    borderRadius: '50%', 
                    border: `8px solid ${interviewEvaluationResult.overallScore >= 85 ? '#16A34A' : interviewEvaluationResult.overallScore >= 70 ? '#2563EB' : interviewEvaluationResult.overallScore >= 40 ? '#D97706' : '#DC2626'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F8FAFC',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                      {interviewEvaluationResult.overallScore}%
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginTop: '4px' }}>
                      FINAL SCORE
                    </span>
                  </div>

                  <span className="badge" style={{ 
                    marginTop: '16px', 
                    fontSize: '0.82rem', 
                    fontWeight: 700,
                    padding: '6px 14px',
                    background: interviewEvaluationResult.overallScore >= 85 ? '#DCFCE7' : interviewEvaluationResult.overallScore >= 70 ? '#DBEAFE' : interviewEvaluationResult.overallScore >= 40 ? '#FEF3C7' : '#FEE2E2',
                    color: interviewEvaluationResult.overallScore >= 85 ? '#15803D' : interviewEvaluationResult.overallScore >= 70 ? '#1E40AF' : interviewEvaluationResult.overallScore >= 40 ? '#B45309' : '#B91C1C',
                    border: `1px solid ${interviewEvaluationResult.overallScore >= 85 ? '#BBF7D0' : interviewEvaluationResult.overallScore >= 70 ? '#BFDBFE' : interviewEvaluationResult.overallScore >= 40 ? '#FDE68A' : '#FCA5A5'}`
                  }}>
                    {interviewEvaluationResult.recruiterRecommendation || 'Evaluation Complete'}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827', fontWeight: 800 }}>
                      AI Interview Assessment Scorecard
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                        Answered: {interviewEvaluationResult.questionsAnswered ?? (interviewEvaluationResult.qaEvaluations || []).filter((q: any) => q.status === 'Answered').length}
                      </span>
                      <span className="badge badge-red" style={{ fontSize: '0.8rem', padding: '4px 10px', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                        Skipped: {interviewEvaluationResult.questionsSkipped ?? (interviewEvaluationResult.qaEvaluations || []).filter((q: any) => q.status === 'Skipped' || q.score === 0).length}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#374151', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                    {interviewEvaluationResult.executiveSummary}
                  </p>

                  {/* 4 Dimensional Metric Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, display: 'block' }}>TECHNICAL</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563EB' }}>{interviewEvaluationResult.technicalScore}%</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, display: 'block' }}>COMMUNICATION</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7C3AED' }}>{interviewEvaluationResult.communicationScore}%</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, display: 'block' }}>PROBLEM SOLVING</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16A34A' }}>{interviewEvaluationResult.problemSolvingScore}%</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, display: 'block' }}>CONFIDENCE</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D97706' }}>{interviewEvaluationResult.confidenceRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#16A34A', fontWeight: 800 }}>
                    💪 Candidate Strengths
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {(interviewEvaluationResult.strengths || []).map((str: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', color: '#D97706', fontWeight: 800 }}>
                    🔍 Areas for Improvement
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {(interviewEvaluationResult.weaknesses || []).map((wk: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question-by-Question Transcript Table */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#111827', fontWeight: 800 }}>
                  📋 Question-by-Question Transcript & AI Evaluation
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(interviewEvaluationResult.qaEvaluations || []).map((qa: any, idx: number) => {
                    const isSkippedQa = qa.status === 'Skipped' || qa.candidateAnswer === '[Skipped]' || qa.score === 0;
                    const isIrrelevantQa = qa.status === 'Irrelevant';
                    return (
                      <div key={idx} style={{ background: isSkippedQa ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${isSkippedQa ? '#FECACA' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563EB' }}>
                            Question #{qa.questionNumber || idx + 1}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: isSkippedQa ? '#FEE2E2' : isIrrelevantQa ? '#FEF3C7' : '#DCFCE7',
                              color: isSkippedQa ? '#991B1B' : isIrrelevantQa ? '#92400E' : '#166534'
                            }}>
                              Status: {qa.status || (isSkippedQa ? 'Skipped' : 'Answered')}
                            </span>
                            <span className="badge" style={{
                              fontSize: '0.78rem',
                              backgroundColor: isSkippedQa ? '#991B1B' : '#16A34A',
                              color: '#FFFFFF'
                            }}>
                              Score: {qa.score}%
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
                          {qa.questionText}
                        </p>
                        <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.88rem', color: isSkippedQa ? '#991B1B' : '#374151', marginBottom: '8px', fontStyle: isSkippedQa ? 'italic' : 'normal' }}>
                          <strong>Candidate Answer:</strong> {qa.candidateAnswer}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: 0 }}>
                          💡 <strong>AI Evaluation Feedback:</strong> {qa.feedback}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Report Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setInterviewEvaluationResult(null)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  Back to Simulator List
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  📄 Download Interview Report (PDF)
                </button>
              </div>

            </div>
          ) : (
            /* SCHEDULED INTERVIEWS LIST CARD */
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#111827', fontWeight: 800 }}>
                Scheduled AI Interview Sessions ({interviews.length})
              </h3>

              {interviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                  No scheduled interviews. Once a recruiter schedules an interview for your application, your AI Interview session will appear here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {interviews.map((int: any) => (
                    <div key={int.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                            {int.jobTitle || 'Technical Engineer Role'}
                          </h4>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                            {int.format || 'Technical'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
                          Scheduled Date: {new Date(int.interviewDate).toLocaleString()} • Status: <strong>{int.status}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        {int.status === 'Completed' ? (
                          <button
                            onClick={() => startAiInterviewSession(int)}
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          >
                            📄 View / Retake Session
                          </button>
                        ) : (
                          <button
                            onClick={() => startAiInterviewSession(int)}
                            className="btn-primary"
                            style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            🚀 Start AI Interview
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      <ProfilePhotoSelectorModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhoto={profilePhoto}
        onSelectPhoto={(photoUrl) => setProfilePhoto(photoUrl)}
      />

      <PersonalInformationModal
        isOpen={personalInfoModalOpen}
        onClose={() => setPersonalInfoModalOpen(false)}
        userId={user?.id || user?.userId || 0}
        initialUserEmail={user?.email || ''}
        initialFullName={user?.fullName || ''}
        onSaved={(info) => setPersonalInfo(info)}
      />
    </div>
  );
};
