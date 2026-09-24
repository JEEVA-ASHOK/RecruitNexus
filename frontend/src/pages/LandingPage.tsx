import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { CompanyLogo } from '../components/CompanyLogo';
import { CompanyOrbitSphere } from '../components/CompanyOrbitSphere';
import { 
  Search, MapPin, Briefcase, ArrowUpRight, Sparkles, Bot, 
  BrainCircuit, FileText, ShieldCheck, 
  ArrowRight, Building, Target, Layers, UserPlus, 
  ChevronLeft, ChevronRight, Code, BarChart3, Cloud, Globe, 
  CheckCircle2, Award, Zap, Users, Calendar, Check
} from 'lucide-react';

interface Job {
  id: number;
  recruiterName: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  companyName?: string;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchWhat, setSearchWhat] = useState('');
  const [searchWhere, setSearchWhere] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('All');

  // Hero Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Platform stats & Featured Jobs state
  const [stats, setStats] = useState<{
    activeJobs: number | null;
    hiringCompanies: number | null;
    qualifiedCandidates: number | null;
    aiMatchAccuracy: number | null;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const heroSlides = [
    {
      badge: 'Discover Opportunities',
      title: 'Find the Right Opportunity. Build Your Future.',
      subtitle: 'Connect directly with top enterprise tech companies using AI precision resume matching, compatibility scoring, and automated application tracking.',
      primaryCta: 'Find Jobs',
      primaryLink: '/jobs',
      secondaryCta: 'Get Started',
      secondaryLink: '/register',
      accentColor: '#2563EB',
      gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
      cardTitle: 'Senior Full Stack Engineer',
      cardSubtitle: 'Matched vs Tech Lead Role',
      matchScore: '94% AI Match',
      skills: ['React 19', 'TypeScript', 'ASP.NET Core', 'Python'],
      statusText: 'ATS Verification Passed',
      statusSub: 'Real-time Skill Alignment',
      floatingBadge1Title: 'AI Match 94%',
      floatingBadge1Sub: 'High Skill Alignment',
      floatingBadge2Title: 'Interview Ready',
      floatingBadge2Sub: 'Confirmed Schedule'
    },
    {
      badge: 'Enterprise AI Engine',
      title: 'Smarter Hiring Starts Here. Powered by Gemini AI.',
      subtitle: 'Match candidate qualifications to job requirements instantly with multi-factor compatibility scoring, skill gap insights, and auto-generated interview questions.',
      primaryCta: 'Explore Jobs',
      primaryLink: '/jobs',
      secondaryCta: 'For Recruiters',
      secondaryLink: '/register',
      accentColor: '#0284C7',
      gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
      cardTitle: 'AI Recruitment Engine',
      cardSubtitle: 'Automated Candidate Ranking',
      matchScore: 'Gemini 3.6',
      skills: ['Resume Parsing', 'Skill Extraction', 'Gap Analysis', 'Interview Generator'],
      statusText: 'Pipeline Automated',
      statusSub: 'Instant Candidate Screening',
      floatingBadge1Title: 'Instant Parsing',
      floatingBadge1Sub: 'Structured PDF Data',
      floatingBadge2Title: 'AI Question Set',
      floatingBadge2Sub: 'Tailored Gaps'
    },
    {
      badge: 'Skill-Based Discovery',
      title: 'Your Skills. Your Opportunity. Matched in Seconds.',
      subtitle: 'Upload your resume to parse technical stack skills automatically and discover curated roles with real-time application status tracking.',
      primaryCta: 'Search Roles',
      primaryLink: '/jobs',
      secondaryCta: 'View Companies',
      secondaryLink: '/companies',
      accentColor: '#7C3AED',
      gradient: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 50%, #DDD6FE 100%)',
      cardTitle: 'Verified Candidate Profile',
      cardSubtitle: 'Skill Stack & Portfolio',
      matchScore: 'Top 5% Talent',
      skills: ['Cloud Architecture', 'System Design', 'Docker', 'REST APIs'],
      statusText: 'Profile 100% Complete',
      statusSub: 'Direct Employer Sourcing',
      floatingBadge1Title: 'Skill Verified',
      floatingBadge1Sub: 'Instant Candidate Badge',
      floatingBadge2Title: 'Direct Apply',
      floatingBadge2Sub: 'One-Click Submission'
    },
    {
      badge: 'End-to-End Workflow',
      title: 'From Application to Interview. One Connected Platform.',
      subtitle: 'Track real-time status updates, view HR contacts and meeting venues, and prepare using interactive AI technical interview simulations.',
      primaryCta: 'Join RecruitNexus',
      primaryLink: '/register',
      secondaryCta: 'Learn More',
      secondaryLink: '/resources',
      accentColor: '#16A34A',
      gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)',
      cardTitle: 'Interview Coordinator',
      cardSubtitle: 'Scheduled Round 1 Technical',
      matchScore: 'Scheduled',
      skills: ['Google Meet', 'HR Contact Info', 'Venue Address', 'Dress Code'],
      statusText: 'Calendar Sync Active',
      statusSub: '24h Email Reminders',
      floatingBadge1Title: 'Scheduled',
      floatingBadge1Sub: 'Google Meet / Venue',
      floatingBadge2Title: 'AI Simulator',
      floatingBadge2Sub: 'Interactive Practice'
    }
  ];

  // Slideshow auto-advance timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length]);

  useEffect(() => {
    fetchPlatformStats();
    fetchFeaturedJobs();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const { data } = await apiRequest('/platform/stats');
      if (data) {
        setStats(data);
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchFeaturedJobs = async () => {
    try {
      const { data } = await apiRequest('/jobs');
      if (data && Array.isArray(data)) {
        setFeaturedJobs(data.slice(0, 6));
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoadingJobs(false);
    }
  };

  const formatStatNumber = (val: number | null | undefined, isPercentage: boolean = false): string => {
    if (val === null || val === undefined) return 'N/A';
    if (isPercentage) return `${val}%`;
    
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return val.toString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchWhat) params.set('what', searchWhat);
    if (searchWhere) params.set('where', searchWhere);
    if (selectedExperience !== 'All') params.set('exp', selectedExperience);
    navigate(`/jobs?${params.toString()}`);
  };

  const popularCategories = [
    { name: 'Software Development', icon: <Code size={24} color="#2563EB" />, count: '1,240+ Openings' },
    { name: 'AI & Machine Learning', icon: <Bot size={24} color="#0284C7" />, count: '850+ Openings' },
    { name: 'Data Science & Analytics', icon: <BarChart3 size={24} color="#7C3AED" />, count: '620+ Openings' },
    { name: 'Full Stack Development', icon: <Globe size={24} color="#16A34A" />, count: '940+ Openings' },
    { name: 'Cloud & DevOps', icon: <Cloud size={24} color="#EA580C" />, count: '510+ Openings' },
    { name: 'Testing & QA', icon: <ShieldCheck size={24} color="#DC2626" />, count: '380+ Openings' },
  ];

  const featuredBrands = [
    { name: 'Google', rating: 4.8, jobs: '1,240+ Open Roles', logoColor: '#4285F4' },
    { name: 'Microsoft', rating: 4.7, jobs: '980+ Open Roles', logoColor: '#F25022' },
    { name: 'Amazon', rating: 4.5, jobs: '1,500+ Open Roles', logoColor: '#FF9900' },
    { name: 'Zoho', rating: 4.6, jobs: '420+ Open Roles', logoColor: '#00A859' },
    { name: 'Wipro', rating: 4.1, jobs: '810+ Open Roles', logoColor: '#8B5CF6' },
    { name: 'TCS', rating: 4.2, jobs: '2,100+ Open Roles', logoColor: '#0033A0' },
    { name: 'Flipkart', rating: 4.4, jobs: '350+ Open Roles', logoColor: '#2874F0' },
  ];

  const whyRecruitNexus = [
    {
      icon: <BrainCircuit size={28} color="#2563EB" />,
      title: 'AI-Powered Matching',
      desc: 'Multi-factor compatibility scoring comparing candidate skills directly against job descriptions in real-time.'
    },
    {
      icon: <FileText size={28} color="#0284C7" />,
      title: 'ATS Resume Analysis',
      desc: 'Gemini AI parsing extracts technical skills, work history, and personalized gap analysis from PDF resumes.'
    },
    {
      icon: <Building size={28} color="#7C3AED" />,
      title: 'Interview Management',
      desc: 'Automated interview scheduling with HR details, venue address, meeting links, and candidate confirmation.'
    },
    {
      icon: <BarChart3 size={28} color="#16A34A" />,
      title: 'Recruiter Analytics',
      desc: 'Real-time hiring pipeline metrics, applicant ranking, decision summaries, and time-to-hire insights.'
    }
  ];

  const currentSlideData = heroSlides[currentSlide];

  return (
    <div style={styles.pageContainer}>
      
      {/* 1. HERO SLIDESHOW SECTION */}
      <section 
        style={styles.heroWrapper}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          style={{
            ...styles.heroSlideCard,
            background: currentSlideData.gradient,
          }}
        >
          <div style={styles.heroGrid}>
            
            {/* LEFT COLUMN: TEXT CONTENT & ACTIONS */}
            <div style={styles.heroLeftCol}>
              <div style={{ ...styles.heroBadge, borderColor: currentSlideData.accentColor }}>
                <Sparkles size={14} color={currentSlideData.accentColor} />
                <span style={{ color: currentSlideData.accentColor }}>{currentSlideData.badge}</span>
              </div>

              <h1 style={styles.heroTitle}>
                {currentSlideData.title}
              </h1>

              <p style={styles.heroSubtitle}>
                {currentSlideData.subtitle}
              </p>

              <div style={styles.heroActionRow}>
                <Link 
                  to={currentSlideData.primaryLink} 
                  className="btn-primary" 
                  style={{ ...styles.heroPrimaryBtn, background: currentSlideData.accentColor, borderColor: currentSlideData.accentColor }}
                >
                  <span>{currentSlideData.primaryCta}</span>
                  <ArrowRight size={18} />
                </Link>

                <Link 
                  to={currentSlideData.secondaryLink} 
                  className="btn-secondary" 
                  style={styles.heroSecondaryBtn}
                >
                  <span>{currentSlideData.secondaryCta}</span>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: RECRUITMENT PLATFORM AI VISUAL CARD */}
            <div style={styles.heroRightCol}>
              <div style={styles.mockWindow}>
                {/* Browser bar */}
                <div style={styles.mockHeader}>
                  <div style={styles.mockDots}>
                    <span style={{ ...styles.mockDot, background: '#EF4444' }} />
                    <span style={{ ...styles.mockDot, background: '#F59E0B' }} />
                    <span style={{ ...styles.mockDot, background: '#10B981' }} />
                  </div>
                  <div style={styles.mockSearchPill}>recruitnexus.ai / candidates</div>
                </div>

                {/* Card Body */}
                <div style={styles.mockBody}>
                  <div style={styles.mockCandidateCard}>
                    <div style={{ ...styles.mockAvatar, background: currentSlideData.accentColor }}>
                      <BrainCircuit size={20} color="#FFFFFF" />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={styles.mockName}>{currentSlideData.cardTitle}</div>
                      <div style={styles.mockSubtitle}>{currentSlideData.cardSubtitle}</div>
                    </div>
                    <span style={{ ...styles.mockScoreBadge, background: '#EFF6FF', color: currentSlideData.accentColor, border: `1px solid ${currentSlideData.accentColor}33` }}>
                      {currentSlideData.matchScore}
                    </span>
                  </div>

                  {/* Skill Pills */}
                  <div style={styles.mockSkillsRow}>
                    {currentSlideData.skills.map((skill, sIdx) => (
                      <span key={sIdx} style={styles.mockSkillTag}>
                        <Check size={12} color={currentSlideData.accentColor} />
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Status Footer */}
                  <div style={styles.mockStatusRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#16A34A' }}>{currentSlideData.statusText}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{currentSlideData.statusSub}</span>
                  </div>
                </div>
              </div>

              {/* FLOATING DECORATIVE GLASS BADGES */}
              <div style={styles.floatingGlassBadgeTop}>
                <div style={styles.floatingIconBg}>
                  <Target size={18} color={currentSlideData.accentColor} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{currentSlideData.floatingBadge1Title}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{currentSlideData.floatingBadge1Sub}</div>
                </div>
              </div>

              <div style={styles.floatingGlassBadgeBottom}>
                <div style={{ ...styles.floatingIconBg, background: '#DCFCE7' }}>
                  <CheckCircle2 size={18} color="#16A34A" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{currentSlideData.floatingBadge2Title}</div>
                  <div style={{ fontSize: '0.68rem', color: '#16A34A' }}>{currentSlideData.floatingBadge2Sub}</div>
                </div>
              </div>
            </div>

          </div>

          {/* CAROUSEL ARROW CONTROLS */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            style={styles.carouselArrowPrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} color="#374151" />
          </button>

          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            style={styles.carouselArrowNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={22} color="#374151" />
          </button>

          {/* CAROUSEL INDICATOR DOTS */}
          <div style={styles.carouselDotsContainer}>
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  ...styles.carouselDot,
                  width: currentSlide === idx ? '28px' : '8px',
                  background: currentSlide === idx ? currentSlideData.accentColor : '#9CA3AF',
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 2. JOB SEARCH PANEL */}
        <form onSubmit={handleSearch} style={styles.searchCard}>
          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>Job Title or Skills</label>
            <div style={styles.inputWrapper}>
              <Search size={20} color="#6B7280" />
              <input
                type="text"
                placeholder="e.g. React Developer, Python, Data Scientist"
                value={searchWhat}
                onChange={(e) => setSearchWhat(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
          
          <div style={styles.searchDivider} />

          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>Location</label>
            <div style={styles.inputWrapper}>
              <MapPin size={20} color="#6B7280" />
              <input
                type="text"
                placeholder="City, State, or Remote"
                value={searchWhere}
                onChange={(e) => setSearchWhere(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.searchDivider} />

          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>Experience Level</label>
            <div style={styles.inputWrapper}>
              <Briefcase size={20} color="#6B7280" />
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                style={styles.searchSelect}
              >
                <option value="All">Any Experience</option>
                <option value="0">Fresher (0 years)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="5">5 years</option>
                <option value="8">8+ years</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={styles.searchBtn}>
            <span>Search Jobs</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* 3. PLATFORM STATISTICS ROW */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {loadingStats ? '...' : formatStatNumber(stats?.activeJobs)}
            </span>
            <span style={styles.statLabel}>Active Job Openings</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {loadingStats ? '...' : formatStatNumber(stats?.hiringCompanies)}
            </span>
            <span style={styles.statLabel}>Hiring Companies</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {loadingStats ? '...' : formatStatNumber(stats?.qualifiedCandidates)}
            </span>
            <span style={styles.statLabel}>Qualified Candidates</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>
              {loadingStats ? '...' : formatStatNumber(stats?.aiMatchAccuracy, true)}
            </span>
            <span style={styles.statLabel}>AI Match Accuracy</span>
          </div>
        </div>
      </section>

      {/* 4. POPULAR JOB CATEGORIES */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.badgeLabel}>Explore Roles</span>
          <h2 style={styles.sectionTitle}>Popular Job Categories</h2>
          <p style={styles.sectionSubtitle}>Discover high-demand technology tracks curated across enterprise hiring partners</p>
        </div>

        <div style={styles.categoriesGrid}>
          {popularCategories.map((cat, idx) => (
            <div 
              key={idx} 
              style={styles.categoryCard}
              onClick={() => navigate(`/jobs?what=${encodeURIComponent(cat.name)}`)}
            >
              <div style={styles.categoryIconBox}>{cat.icon}</div>
              <h3 style={styles.categoryName}>{cat.name}</h3>
              <span style={styles.categoryCount}>{cat.count}</span>
              <div style={styles.categoryLinkRow}>
                <span>Browse Jobs</span>
                <ArrowUpRight size={14} color="#2563EB" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED / LATEST JOBS */}
      <section style={{ ...styles.section, background: '#F8FAFC', borderRadius: '24px', padding: '60px 40px', border: '1px solid #E5E7EB' }}>
        <div style={styles.sectionHeader}>
          <span style={styles.badgeLabel}>Live Opportunities</span>
          <h2 style={styles.sectionTitle}>Featured Job Listings</h2>
          <p style={styles.sectionSubtitle}>Explore recent job postings seeking qualified talent across engineering & AI teams</p>
        </div>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            Loading latest opportunities...
          </div>
        ) : featuredJobs.length > 0 ? (
          <div style={styles.jobsGrid}>
            {featuredJobs.map((job) => (
              <div key={job.id} style={styles.jobCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <span style={styles.jobCompany}>
                      {job.companyName ? job.companyName : (job.recruiterName ? job.recruiterName : 'Enterprise Partner')}
                    </span>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                    {job.jobType || 'Full Time'}
                  </span>
                </div>

                <div style={styles.jobMetaRow}>
                  <div style={styles.jobMetaItem}>
                    <MapPin size={14} color="#6B7280" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  {job.salaryRange && (
                    <div style={styles.jobMetaItem}>
                      <Briefcase size={14} color="#6B7280" />
                      <span>{job.salaryRange}</span>
                    </div>
                  )}
                </div>

                <p style={styles.jobDescSnippet}>
                  {job.description ? (job.description.length > 110 ? `${job.description.substring(0, 110)}...` : job.description) : 'No description provided.'}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <Link to="/jobs" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem', height: '36px' }}>
                    <span>View Details</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            No jobs found at the moment. Check back soon!
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/jobs" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
            <span>Explore All Jobs</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 6. TRUSTED ENTERPRISE HIRING PARTNERS & 360 ORBIT SPHERE */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Hiring Partners</h2>
          <p style={styles.sectionSubtitle}>Top technology leaders actively recruiting talent through the RecruitNexus ecosystem</p>
        </div>

        {/* Dynamic 360-Degree Revolving Company Orbit Sphere */}
        <CompanyOrbitSphere brands={featuredBrands} />
        <div style={styles.companiesGrid}>
          {featuredBrands.map((brand, idx) => (
            <div key={idx} style={styles.companyCard}>
              <div style={styles.companyHeader}>
                <CompanyLogo name={brand.name} size={42} fallbackColor={brand.logoColor} />
                <div>
                  <h3 style={styles.companyName}>{brand.name}</h3>
                  <span style={styles.companyRating}>★ {brand.rating} Rating</span>
                </div>
              </div>
              <p style={styles.companyMeta}>{brand.jobs}</p>
              <Link to={`/jobs?what=${encodeURIComponent(brand.name)}`} className="btn-secondary" style={styles.viewJobsBtn}>
                <span>View Openings</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY RECRUITNEXUS (4 FEATURE CARDS) */}
      <section style={{ ...styles.section, background: '#F8FAFC', borderRadius: '24px', padding: '60px 40px', margin: '40px 0' }}>
        <div style={styles.sectionHeader}>
          <span style={styles.badgeLabel}>Why RecruitNexus</span>
          <h2 style={styles.sectionTitle}>Built for Modern Recruitment Teams</h2>
          <p style={styles.sectionSubtitle}>Integrated tools designed to streamline sourcing, evaluation, and candidate engagement.</p>
        </div>

        <div style={styles.whyGrid}>
          {whyRecruitNexus.map((item, idx) => (
            <div key={idx} style={styles.whyCard}>
              <div style={styles.whyIconBox}>{item.icon}</div>
              <h3 style={styles.whyTitle}>{item.title}</h3>
              <p style={styles.whyDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CTA SECTION (PREMIUM DARK BLUE GRADIENT) */}
      <section style={styles.finalCtaBanner}>
        <div style={styles.finalCtaContent}>
          <div style={styles.finalCtaBadge}>
            <Zap size={14} color="#60A5FA" />
            <span>Ready for Your Next Career Move?</span>
          </div>
          <h2 style={styles.finalCtaTitle}>Your Next Opportunity is Waiting</h2>
          <p style={styles.finalCtaSubtitle}>
            Take the first step towards your career. Join thousands of candidates and recruiters using RecruitNexus AI today.
          </p>
          <div style={styles.finalCtaButtons}>
            <Link to="/jobs" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', background: '#2563EB', borderColor: '#2563EB' }}>
              <span>Explore Jobs</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem', background: 'transparent', color: '#FFFFFF', borderColor: '#475569' }}>
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 32px',
  },
  heroWrapper: {
    padding: '30px 0 20px 0',
    position: 'relative',
  },
  heroSlideCard: {
    borderRadius: '24px',
    padding: '48px 48px 64px 48px',
    position: 'relative',
    transition: 'all 0.5s ease-in-out',
    border: '1px solid rgba(37, 99, 235, 0.15)',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
    minHeight: '440px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '40px',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    zIndex: 5,
  },
  heroLeftCol: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#FFFFFF',
    border: '1px solid',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.88rem',
    fontWeight: 700,
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.15,
    letterSpacing: '-1.2px',
    marginBottom: '16px',
  },
  heroSubtitle: {
    fontSize: '1.08rem',
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: '28px',
  },
  heroActionRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    padding: '12px 28px',
    fontSize: '0.98rem',
    fontWeight: 700,
  },
  heroSecondaryBtn: {
    padding: '12px 24px',
    fontSize: '0.98rem',
    fontWeight: 600,
  },
  heroRightCol: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
  },
  mockWindow: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #CBD5E1',
    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    textAlign: 'left',
  },
  mockHeader: {
    background: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mockDots: {
    display: 'flex',
    gap: '6px',
  },
  mockDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  mockSearchPill: {
    fontSize: '0.72rem',
    color: '#64748B',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    padding: '2px 10px',
    borderRadius: '10px',
    fontWeight: 500,
  },
  mockBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  mockCandidateCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#F8FAFC',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  mockAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mockName: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#0F172A',
  },
  mockSubtitle: {
    fontSize: '0.75rem',
    color: '#64748B',
  },
  mockScoreBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
  },
  mockSkillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  mockSkillTag: {
    fontSize: '0.74rem',
    fontWeight: 600,
    color: '#334155',
    background: '#F1F5F9',
    border: '1px solid #E2E8F0',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  mockStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid #F1F5F9',
  },
  floatingGlassBadgeTop: {
    position: 'absolute',
    top: '-12px',
    right: '10px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #CBD5E1',
    borderRadius: '12px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.08)',
    zIndex: 10,
    textAlign: 'left',
  },
  floatingGlassBadgeBottom: {
    position: 'absolute',
    bottom: '-12px',
    left: '10px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #CBD5E1',
    borderRadius: '12px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.08)',
    zIndex: 10,
    textAlign: 'left',
  },
  floatingIconBg: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  carouselArrowPrev: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    outline: 'none',
    zIndex: 10,
  },
  carouselArrowNext: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    outline: 'none',
    zIndex: 10,
  },
  carouselDotsContainer: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  carouselDot: {
    height: '8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
  },
  searchCard: {
    background: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.08)',
    margin: '-30px auto 40px auto',
    position: 'relative',
    zIndex: 20,
    maxWidth: '1100px',
    flexWrap: 'wrap',
  },
  searchGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '200px',
    textAlign: 'left',
  },
  searchLabel: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.98rem',
    color: '#111827',
    fontFamily: "'Inter', sans-serif",
    height: '40px',
  },
  searchSelect: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.98rem',
    color: '#111827',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    background: 'none',
    height: '40px',
  },
  searchDivider: {
    width: '1px',
    height: '48px',
    background: '#E2E8F0',
  },
  searchBtn: {
    height: '52px',
    padding: '0 32px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px 20px',
    boxShadow: 'var(--shadow-card)',
    textAlign: 'center',
  },
  statNumber: {
    display: 'block',
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#2563EB',
    letterSpacing: '-1px',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  section: {
    padding: '50px 0',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  badgeLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#0F172A',
    letterSpacing: '-0.5px',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '1.05rem',
    color: '#475569',
    maxWidth: '650px',
    margin: '0 auto',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  categoryCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '28px',
    cursor: 'pointer',
    transition: 'all 0.25s ease-in-out',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  categoryIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  categoryName: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '6px',
  },
  categoryCount: {
    fontSize: '0.88rem',
    color: '#64748B',
    marginBottom: '18px',
  },
  categoryLinkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#2563EB',
    marginTop: 'auto',
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  jobCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease',
  },
  jobTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 4px 0',
  },
  jobCompany: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: '#2563EB',
  },
  jobMetaRow: {
    display: 'flex',
    gap: '16px',
    margin: '12px 0',
    flexWrap: 'wrap',
  },
  jobMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    color: '#64748B',
  },
  jobDescSnippet: {
    fontSize: '0.88rem',
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  companiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  companyCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  companyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  companyLogo: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: '2px solid',
    background: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 2px 0',
  },
  companyRating: {
    fontSize: '0.8rem',
    color: '#D97706',
    fontWeight: 700,
  },
  companyMeta: {
    fontSize: '0.88rem',
    color: '#64748B',
    marginBottom: '20px',
  },
  viewJobsBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    width: '100%',
    justifyContent: 'center',
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '28px',
  },
  whyCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '32px 24px',
    boxShadow: 'var(--shadow-card)',
    textAlign: 'left',
  },
  whyIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  whyTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '10px',
  },
  whyDesc: {
    fontSize: '0.92rem',
    color: '#475569',
    lineHeight: 1.6,
  },
  finalCtaBanner: {
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)',
    borderRadius: '28px',
    padding: '70px 40px',
    margin: '40px 0 80px 0',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
    color: '#FFFFFF',
  },
  finalCtaContent: {
    maxWidth: '780px',
    margin: '0 auto',
  },
  finalCtaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#93C5FD',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.88rem',
    fontWeight: 600,
    marginBottom: '24px',
  },
  finalCtaTitle: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#FFFFFF',
    marginBottom: '16px',
    letterSpacing: '-1px',
  },
  finalCtaSubtitle: {
    fontSize: '1.15rem',
    color: '#94A3B8',
    marginBottom: '36px',
    lineHeight: 1.6,
  },
  finalCtaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
};
