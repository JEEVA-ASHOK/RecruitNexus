import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, GraduationCap, Award, FolderGit2, Link as LinkIcon, 
  FileText, Plus, Trash2, Edit3, Check, X, ExternalLink, Eye, Globe, 
  Sparkles, AlertCircle
} from 'lucide-react';
import { apiRequest } from '../../api';
import { calculateProfileCompletion } from '../../utils/profileCompletion';

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  year: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies?: string;
  link?: string;
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  year?: string;
}

interface CandidateProfessionalProfileProps {
  user: any;
  profileData: any;
  onProfileUpdated: () => void;
  onOpenResumeTab?: () => void;
}

export const CandidateProfessionalProfile: React.FC<CandidateProfessionalProfileProps> = ({
  user,
  profileData,
  onProfileUpdated,
  onOpenResumeTab
}) => {
  const [activeMode, setActiveMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);
  const [certList, setCertList] = useState<CertItem[]>([]);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Individual Section Edit Modals / Inline Toggles
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingEdu, setEditingEdu] = useState(false);
  const [editingExp, setEditingExp] = useState(false);
  const [editingProjects, setEditingProjects] = useState(false);

  // New Item Draft Forms
  const [newEdu, setNewEdu] = useState<EducationItem>({ id: '', degree: '', institution: '', year: '' });
  const [newExp, setNewExp] = useState<ExperienceItem>({ id: '', role: '', company: '', duration: '', description: '' });
  const [newProj, setNewProj] = useState<ProjectItem>({ id: '', title: '', description: '', technologies: '', link: '' });

  const loadPersistedProfileData = () => {
    const uId = user?.id || user?.userId;
    const p = profileData?.profile || profileData || {};

    setBio(p.bio || '');
    setExperienceYears(p.experienceYears || 0);

    // Parse Backend Skills
    if (Array.isArray(p.skills)) {
      setSkillsList(p.skills);
    } else if (typeof p.skills === 'string' && p.skills) {
      try {
        const parsed = JSON.parse(p.skills);
        setSkillsList(Array.isArray(parsed) ? parsed : p.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
      } catch {
        setSkillsList(p.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
    }

    // Load extended profile details from user-scoped localStorage key
    let savedExtra: any = null;
    if (uId) {
      const storedExtra = localStorage.getItem(`candidate_pro_details_${uId}`);
      if (storedExtra) {
        try { savedExtra = JSON.parse(storedExtra); } catch {}
      }
    }

    if (savedExtra) {
      if (savedExtra.headline) setHeadline(savedExtra.headline);
      if (Array.isArray(savedExtra.experienceList)) setExperienceList(savedExtra.experienceList);
      if (Array.isArray(savedExtra.projectList)) setProjectList(savedExtra.projectList);
      if (Array.isArray(savedExtra.certList)) setCertList(savedExtra.certList);
      if (savedExtra.linkedInUrl !== undefined) setLinkedInUrl(savedExtra.linkedInUrl);
      if (savedExtra.githubUrl !== undefined) setGithubUrl(savedExtra.githubUrl);
      if (savedExtra.portfolioUrl !== undefined) setPortfolioUrl(savedExtra.portfolioUrl);
      if (Array.isArray(savedExtra.educationList) && savedExtra.educationList.length > 0) {
        setEducationList(savedExtra.educationList);
      }
    } else {
      // Default Headline derived from bio or title
      const bioText = p.bio || '';
      if (bioText.includes('.')) {
        setHeadline(bioText.split('.')[0]);
      } else {
        setHeadline(bioText ? bioText.slice(0, 60) : 'Aspiring Software Engineer & Professional');
      }
    }

    // Parse Education fallback if not in extra details
    if ((!savedExtra || !Array.isArray(savedExtra.educationList) || savedExtra.educationList.length === 0) && p.education) {
      try {
        const parsedEdu = JSON.parse(p.education);
        if (Array.isArray(parsedEdu)) {
          setEducationList(parsedEdu);
        } else {
          setEducationList([{ id: '1', degree: p.education, institution: 'Higher Education Institution', year: 'Completed' }]);
        }
      } catch {
        setEducationList([{ id: '1', degree: p.education, institution: 'Higher Education Institution', year: 'Completed' }]);
      }
    }
  };

  useEffect(() => {
    loadPersistedProfileData();
  }, [profileData, user]);

  const handleCancelEdits = () => {
    loadPersistedProfileData();
    setEditingSummary(false);
    setEditingSkills(false);
    setEditingEdu(false);
    setEditingExp(false);
    setEditingProjects(false);
    setErrorMsg('');
  };

  // Handle Save All Profile Details
  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      bio: bio.trim() || 'No bio added yet.',
      skills: skillsList,
      experienceYears: experienceYears,
      education: educationList.length > 0 ? JSON.stringify(educationList) : (educationList[0]?.degree || '')
    };

    const { data, error } = await apiRequest<any>('/auth/profile', 'PUT', payload);
    setSaving(false);

    if (error) {
      const msg = typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? String((error as any).message) : 'Unable to save profile changes. Please try again.');
      setErrorMsg(msg);
      return;
    }

    // Persist extended details to user-scoped localStorage key
    const uId = user?.id || user?.userId;
    const extraDetails = {
      headline: headline.trim(),
      experienceList,
      projectList,
      certList,
      linkedInUrl: linkedInUrl.trim(),
      githubUrl: githubUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
      educationList
    };

    if (uId) {
      localStorage.setItem(`candidate_pro_details_${uId}`, JSON.stringify(extraDetails));
      localStorage.setItem(`cached_profile_${uId}`, JSON.stringify({
        ...(profileData?.profile || profileData || {}),
        ...payload,
        ...extraDetails
      }));
    }

    setSuccessMsg('Professional profile updated successfully!');
    setEditingSummary(false);
    setEditingSkills(false);
    setEditingEdu(false);
    setEditingExp(false);
    setEditingProjects(false);

    // Trigger instant recalculation across Dashboard, Navbar, and Completion Card
    window.dispatchEvent(new CustomEvent('personal-info-updated'));
    onProfileUpdated();

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    if (!newEdu.degree.trim() || !newEdu.institution.trim()) return;
    const item: EducationItem = {
      ...newEdu,
      id: Date.now().toString()
    };
    setEducationList([...educationList, item]);
    setNewEdu({ id: '', degree: '', institution: '', year: '' });
  };

  const handleRemoveEducation = (id: string) => {
    setEducationList(educationList.filter(e => e.id !== id));
  };

  const handleAddExperience = () => {
    if (!newExp.role.trim() || !newExp.company.trim()) return;
    const item: ExperienceItem = {
      ...newExp,
      id: Date.now().toString()
    };
    setExperienceList([...experienceList, item]);
    setNewExp({ id: '', role: '', company: '', duration: '', description: '' });
  };

  const handleRemoveExperience = (id: string) => {
    setExperienceList(experienceList.filter(e => e.id !== id));
  };

  const handleAddProject = () => {
    if (!newProj.title.trim()) return;
    const item: ProjectItem = {
      ...newProj,
      id: Date.now().toString()
    };
    setProjectList([...projectList, item]);
    setNewProj({ id: '', title: '', description: '', technologies: '', link: '' });
  };

  const handleRemoveProject = (id: string) => {
    setProjectList(projectList.filter(p => p.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Controls Banner: Switch Mode & Save All */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>💼 Candidate Professional Profile</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
              Recruiter Ready
            </span>
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Build your comprehensive resume profile for automated AI matching and top employer recruitment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => setActiveMode('edit')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'edit' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'edit' ? '#2563EB' : '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('preview')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeMode === 'preview' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'preview' ? '#2563EB' : '#64748B',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={14} />
              <span>Recruiter Preview</span>
            </button>
          </div>

          {activeMode === 'edit' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleCancelEdits}
                className="btn-secondary"
                disabled={saving}
                style={{ padding: '8px 16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="btn-primary"
                disabled={saving}
                style={{ padding: '8px 20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ================= EDIT MODE ================= */}
      {activeMode === 'edit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 1: PROFESSIONAL SUMMARY */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#2563EB" />
                <span>1. Professional Summary</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Professional Headline
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer specializing in .NET Core & React"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Bio & Career Summary
                </label>
                <textarea
                  rows={4}
                  className="glass-input"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Describe your technical background, core competencies, and career goals..."
                  style={{ width: '100%', resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TECHNICAL SKILLS */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#2563EB" />
                <span>2. Technical Skills</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Skill Input Row */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="glass-input"
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  placeholder="Add a technology or skill (e.g. Docker, TypeScript, PyTorch)..."
                  style={{ flex: 1, height: '42px' }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-primary"
                  style={{ padding: '0 18px', height: '42px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Skill Chips List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                {skillsList.length > 0 ? (
                  skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#1D4ED8' }}
                        aria-label={`Remove skill ${skill}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94A3B8', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    No technical skills added yet. Type a skill above and click Add.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: WORK EXPERIENCE */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="#2563EB" />
                <span>3. Work Experience</span>
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Total Years:</span>
                <input
                  type="number"
                  min="0"
                  className="glass-input"
                  value={experienceYears}
                  onChange={e => setExperienceYears(parseInt(e.target.value) || 0)}
                  style={{ width: '70px', height: '36px', textAlign: 'center' }}
                />
              </div>
            </div>

            {/* Experience Cards Timeline List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {experienceList.length > 0 ? (
                experienceList.map(exp => (
                  <div key={exp.id} style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{exp.role}</h4>
                      <p style={{ margin: '2px 0 6px 0', fontSize: '0.88rem', fontWeight: 600, color: '#2563EB' }}>{exp.company} • {exp.duration}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{exp.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '18px', textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                  No work experience entries added yet. Use the form below to add your work history.
                </div>
              )}
            </div>

            {/* Add Experience Entry Draft */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>+ Add Work Experience Entry</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Job Role / Title (e.g. Software Engineer)"
                  className="glass-input"
                  value={newExp.role}
                  onChange={e => setNewExp({ ...newExp, role: e.target.value })}
                  style={{ height: '40px' }}
                />
                <input
                  type="text"
                  placeholder="Company Name (e.g. Google)"
                  className="glass-input"
                  value={newExp.company}
                  onChange={e => setNewExp({ ...newExp, company: e.target.value })}
                  style={{ height: '40px' }}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2022 - Present)"
                  className="glass-input"
                  value={newExp.duration}
                  onChange={e => setNewExp({ ...newExp, duration: e.target.value })}
                  style={{ height: '40px' }}
                />
              </div>
              <input
                type="text"
                placeholder="Key responsibilities and achievements..."
                className="glass-input"
                value={newExp.description}
                onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                style={{ height: '40px' }}
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn-secondary"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.82rem' }}
              >
                + Add Experience
              </button>
            </div>
          </div>

          {/* SECTION 4: EDUCATION */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} color="#2563EB" />
                <span>4. Education</span>
              </h3>
            </div>

            {/* Education List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {educationList.length > 0 ? (
                educationList.map(edu => (
                  <div key={edu.id} style={{ padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>{edu.degree}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>{edu.institution} {edu.year ? `• ${edu.year}` : ''}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '18px', textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                  No education details added yet. Use the form below to add your degree.
                </div>
              )}
            </div>

            {/* Add Education Draft */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>+ Add Education Entry</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Degree / Qualification (e.g. B.Tech Computer Science)"
                  className="glass-input"
                  value={newEdu.degree}
                  onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })}
                  style={{ height: '40px' }}
                />
                <input
                  type="text"
                  placeholder="University / College Name"
                  className="glass-input"
                  value={newEdu.institution}
                  onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })}
                  style={{ height: '40px' }}
                />
                <input
                  type="text"
                  placeholder="Year / Graduation Date (e.g. 2020 - 2024)"
                  className="glass-input"
                  value={newEdu.year}
                  onChange={e => setNewEdu({ ...newEdu, year: e.target.value })}
                  style={{ height: '40px' }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn-secondary"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.82rem' }}
              >
                + Add Education
              </button>
            </div>
          </div>

          {/* SECTION 5: PROJECTS */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={18} color="#2563EB" />
                <span>5. Key Projects</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {projectList.length > 0 ? (
                projectList.map(p => (
                  <div key={p.id} style={{ padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>{p.title}</h4>
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#475569' }}>{p.description}</p>
                      {p.technologies && (
                        <span style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>Stack: {p.technologies}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(p.id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '18px', textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                  No key projects added yet. Highlight technical portfolio projects below.
                </div>
              )}
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>+ Add Key Project</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Project Title (e.g. AI E-Commerce Platform)"
                  className="glass-input"
                  value={newProj.title}
                  onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                  style={{ height: '40px' }}
                />
                <input
                  type="text"
                  placeholder="Technologies Used (e.g. React, Node.js, Python)"
                  className="glass-input"
                  value={newProj.technologies}
                  onChange={e => setNewProj({ ...newProj, technologies: e.target.value })}
                  style={{ height: '40px' }}
                />
              </div>
              <input
                type="text"
                placeholder="Short description of what you built and outcomes achieved..."
                className="glass-input"
                value={newProj.description}
                onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                style={{ height: '40px' }}
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="btn-secondary"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.82rem' }}
              >
                + Add Project
              </button>
            </div>
          </div>

          {/* SECTION 6: PORTFOLIO & LINKS */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#2563EB" />
                <span>6. Professional Links & Portfolio</span>
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  className="glass-input"
                  value={linkedInUrl}
                  onChange={e => setLinkedInUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  GitHub URL
                </label>
                <input
                  type="url"
                  className="glass-input"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Personal Portfolio / Website
                </label>
                <input
                  type="url"
                  className="glass-input"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= RECRUITER PREVIEW MODE ================= */}
      {activeMode === 'preview' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* PRIVACY NOTICE */}
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 16px', borderRadius: '10px', fontSize: '0.82rem', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#2563EB" />
            <span>
              <strong>Privacy Protection Active:</strong> Personal details like Date of Birth, Gender, and Street Address are strictly hidden from recruiter preview views.
            </span>
          </div>

          {/* CANDIDATE PREVIEW HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '2rem', fontWeight: 800 }}>
                {user?.fullName?.charAt(0) || 'C'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>{user?.fullName}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 600, color: '#2563EB' }}>
                  {headline || 'Professional Candidate'}
                </p>
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap' }}>
                  <span>📧 {user?.email}</span>
                  {experienceYears > 0 && <span>💼 {experienceYears} Years Experience</span>}
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW 1: PROFESSIONAL SUMMARY */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Professional Summary
            </h4>
            <p style={{ margin: 0, fontSize: '0.98rem', color: '#1E293B', lineHeight: 1.6, background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              {bio || 'No professional summary provided.'}
            </p>
          </div>

          {/* PREVIEW 2: TECHNICAL SKILLS */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Technical Skills & Core Competencies
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skillsList.length > 0 ? (
                skillsList.map((skill, i) => (
                  <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ color: '#94A3B8', fontSize: '0.88rem' }}>No skills listed.</span>
              )}
            </div>
          </div>

          {/* PREVIEW 3: WORK EXPERIENCE */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Work Experience
            </h4>
            {experienceList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {experienceList.map(exp => (
                  <div key={exp.id} style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>{exp.role}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563EB', margin: '2px 0 6px 0' }}>{exp.company} • {exp.duration}</div>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '0.88rem', fontStyle: 'italic' }}>
                {experienceYears > 0 ? `${experienceYears} Years of verified experience` : 'No work experience listed.'}
              </div>
            )}
          </div>

          {/* PREVIEW 4: EDUCATION */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Education & Qualifications
            </h4>
            {educationList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {educationList.map(edu => (
                  <div key={edu.id} style={{ padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>{edu.degree}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>{edu.institution} {edu.year ? `• ${edu.year}` : ''}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '0.88rem', fontStyle: 'italic' }}>No education details listed.</div>
            )}
          </div>

          {/* PREVIEW 5: PROJECTS */}
          {projectList.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Key Technical Projects
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {projectList.map(p => (
                  <div key={p.id} style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>{p.title}</div>
                    <p style={{ margin: '4px 0 8px 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{p.description}</p>
                    {p.technologies && (
                      <span style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>Stack: {p.technologies}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREVIEW 6: RESUME STATUS */}
          <div style={{ padding: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={24} color="#2563EB" />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E40AF' }}>Resume Attachment</div>
                <div style={{ fontSize: '0.82rem', color: '#1D4ED8' }}>
                  {profileData?.resumePath ? `Attachment: ${profileData.resumePath}` : 'No resume PDF currently attached.'}
                </div>
              </div>
            </div>
            {onOpenResumeTab && (
              <button
                type="button"
                onClick={onOpenResumeTab}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Manage Resume Document
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
