import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { 
  Search, MapPin, Briefcase, ArrowUpRight, Sparkles, Bot, 
  BrainCircuit, FileText, Award, ShieldCheck, CheckCircle2, 
  ArrowRight, Users, Building, Target, Layers, UserPlus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchWhat, setSearchWhat] = useState('');
  const [searchWhere, setSearchWhere] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('All');

  const [stats, setStats] = useState<{
    activeJobs: number | null;
    hiringCompanies: number | null;
    qualifiedCandidates: number | null;
    aiMatchAccuracy: number | null;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const { data } = await apiRequest('/platform/stats');
      if (data) {
        setStats(data);
      }
    } catch {
      // Fallback handled gracefully in UI
    } finally {
      setLoadingStats(false);
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

  const featuredBrands = [
    { name: 'Google', rating: 4.8, jobs: '1,240+ Open Roles', logoColor: '#4285F4' },
    { name: 'Microsoft', rating: 4.7, jobs: '980+ Open Roles', logoColor: '#F25022' },
    { name: 'Amazon', rating: 4.5, jobs: '1,500+ Open Roles', logoColor: '#FF9900' },
    { name: 'Zoho', rating: 4.6, jobs: '420+ Open Roles', logoColor: '#00A859' },
    { name: 'Wipro', rating: 4.1, jobs: '810+ Open Roles', logoColor: '#8b5cf6' },
    { name: 'TCS', rating: 4.2, jobs: '2,100+ Open Roles', logoColor: '#0033A0' },
    { name: 'Flipkart', rating: 4.4, jobs: '350+ Open Roles', logoColor: '#2874F0' },
  ];

  const aiFeatures = [
    {
      icon: <BrainCircuit size={28} color="#2563EB" />,
      title: 'Gemini Resume Parsing',
      desc: 'Instant structured extraction of technical skills, work history, and education from candidate PDFs.',
      tag: 'Day 1 Feature'
    },
    {
      icon: <Target size={28} color="#2563EB" />,
      title: 'AI Candidate Ranking',
      desc: 'Multi-factor compatibility scoring comparing resume qualifications directly against job requirements.',
      tag: 'Day 3 Feature'
    },
    {
      icon: <Bot size={28} color="#2563EB" />,
      title: 'Interview Question Generator',
      desc: 'Synthesizes custom technical, behavioral, and situational questions tailored to candidate skill gaps.',
      tag: 'Day 2 Feature'
    },
    {
      icon: <Sparkles size={28} color="#2563EB" />,
      title: 'Hiring Decision Assistant',
      desc: 'Executive summaries detailing candidate strengths, risks, recommendation status, and confidence scores.',
      tag: 'Day 5 Feature'
    },
    {
      icon: <FileText size={28} color="#2563EB" />,
      title: 'AI Offer Letter Generator',
      desc: 'Automated offer letter drafting with approval workflow, PDF export, and email dispatch.',
      tag: 'Day 6 Feature'
    },
    {
      icon: <Award size={28} color="#2563EB" />,
      title: 'Pre-Joining Onboarding Portal',
      desc: '30-60-90 day success roadmaps, Day 1 orientation agendas, and manager welcome kits.',
      tag: 'Day 7 Feature'
    }
  ];

  const candidateFlowSteps = [
    {
      step: '01',
      icon: <UserPlus size={22} color="#2563EB" />,
      title: 'Create Your Account',
      desc: 'Register as a candidate and create your RecruitNexus account.'
    },
    {
      step: '02',
      icon: <FileText size={22} color="#2563EB" />,
      title: 'Build Your Profile',
      desc: 'Add your education, technical skills, experience, professional bio, and resume.'
    },
    {
      step: '03',
      icon: <Search size={22} color="#2563EB" />,
      title: 'Find the Right Job',
      desc: 'Search jobs by title, skills, location, and experience level.'
    },
    {
      step: '04',
      icon: <BrainCircuit size={22} color="#2563EB" />,
      title: 'Get Your AI Match Score',
      desc: 'RecruitNexus analyzes your profile and job requirements to show your compatibility score.'
    },
    {
      step: '05',
      icon: <Briefcase size={22} color="#2563EB" />,
      title: 'Apply for the Job',
      desc: 'Review the job details and submit your application directly through RecruitNexus.'
    },
    {
      step: '06',
      icon: <Layers size={22} color="#2563EB" />,
      title: 'Track Your Application',
      desc: 'Monitor your application status from Applied to Reviewing, Interviewing, Selected, or Rejected.'
    },
    {
      step: '07',
      icon: <Bot size={22} color="#2563EB" />,
      title: 'Practice With AI Interview Simulator',
      desc: 'Prepare for interviews using AI-generated questions, answer evaluation, and personalized feedback.'
    },
    {
      step: '08',
      icon: <Building size={22} color="#2563EB" />,
      title: 'Attend Your Interview',
      desc: 'View your interview schedule, HR details, meeting link, venue, reporting time, and required documents.'
    },
    {
      step: '09',
      icon: <Award size={22} color="#2563EB" />,
      title: 'Get Hired & Complete Onboarding',
      desc: 'After selection, complete the pre-joining and onboarding process through RecruitNexus.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Post Open Positions',
      desc: 'Recruiters create job postings defining key technical requirements, location, and salary ranges.'
    },
    {
      step: '02',
      title: 'AI Matching & Ranking',
      desc: 'Our matching engine parses applicant profiles in real-time, ranking top talent with instant compatibility scores.'
    },
    {
      step: '03',
      title: 'Interview & Onboard',
      desc: 'Schedule interviews, generate custom question sets, approve offer letters, and deliver pre-joining onboarding kits.'
    }
  ];

  return (
    <div style={styles.pageContainer}>
      
      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={14} color="#2563EB" />
            <span>Next-Generation AI Recruitment System</span>
          </div>
          <h1 style={styles.heroTitle}>
            Find Your Dream Job Faster with AI
          </h1>
          <p style={styles.heroSubtitle}>
            Connect directly with top enterprise tech companies using Gemini AI precision resume parsing, compatibility scoring, and automated application tracking.
          </p>

          {/* 2. SEARCH BAR CARD */}
          <form onSubmit={handleSearch} style={styles.searchCard}>
            <div style={styles.searchGroup}>
              <label style={styles.searchLabel}>Job Title or Skills</label>
              <div style={styles.inputWrapper}>
                <Search size={20} color="#6B7280" />
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, React, Python"
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
                  placeholder="City, state, or Remote"
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

          {/* 3. STATISTICS ROW */}
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
        </div>
      </section>

      {/* 4. HOW RECRUITNEXUS WORKS - CANDIDATE JOURNEY TUTORIAL */}
      <section style={{ ...styles.section, background: '#F8FAFC', borderRadius: '24px', padding: '60px 40px', border: '1px solid #E5E7EB', margin: '40px 0' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How RecruitNexus Works</h2>
          <p style={styles.sectionSubtitle}>From discovering the right job to getting hired — RecruitNexus guides you through every step.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', margin: '40px 0' }}>
          {candidateFlowSteps.map((item) => (
            <div
              key={item.step}
              className="glass-panel"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB', background: '#DBEAFE', padding: '4px 10px', borderRadius: '20px' }}>
                  Step {item.step}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA BOTTOM BANNER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '30px', textAlign: 'center', background: '#FFFFFF', padding: '30px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Ready to find your next opportunity?
          </h3>
          <Link to="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700 }}>
            Get Started
          </Link>
        </div>
      </section>

      {/* 4. TRUSTED BRANDS / FEATURED COMPANIES */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured Enterprise Hiring Partners</h2>
          <p style={styles.sectionSubtitle}>Top global technology companies actively recruiting talent through RecruitNexus</p>
        </div>
        <div style={styles.companiesGrid}>
          {featuredBrands.map((brand, idx) => (
            <div key={idx} style={styles.companyCard}>
              <div style={styles.companyHeader}>
                <div style={{ ...styles.companyLogo, borderColor: brand.logoColor }}>
                  <Building size={20} color={brand.logoColor} />
                </div>
                <div>
                  <h3 style={styles.companyName}>{brand.name}</h3>
                  <span style={styles.companyRating}>★ {brand.rating} Rating</span>
                </div>
              </div>
              <p style={styles.companyMeta}>{brand.jobs}</p>
              <Link to={`/jobs?what=${brand.name}`} className="btn-secondary" style={styles.viewJobsBtn}>
                <span>View Openings</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AI FEATURES SHOWCASE */}
      <section style={{ ...styles.section, background: '#F8FAFC', borderRadius: '24px', padding: '60px 40px' }}>
        <div style={styles.sectionHeader}>
          <span style={styles.badgeLabel}>AI-Powered HR Automation</span>
          <h2 style={styles.sectionTitle}>Built for End-to-End Enterprise Hiring</h2>
          <p style={styles.sectionSubtitle}>From resume matching to pre-joining onboarding, leverage Gemini AI across your recruitment pipeline.</p>
        </div>
        <div style={styles.featuresGrid}>
          {aiFeatures.map((feat, idx) => (
            <div key={idx} style={styles.featureCard}>
              <div style={styles.featureIconBox}>{feat.icon}</div>
              <span style={styles.featureTag}>{feat.tag}</span>
              <h3 style={styles.featureTitle}>{feat.title}</h3>
              <p style={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS WORKFLOW */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How RecruitNexus Works</h2>
          <p style={styles.sectionSubtitle}>A seamless 3-step platform designed for both job seekers and corporate recruiters</p>
        </div>
        <div style={styles.stepsGrid}>
          {workflowSteps.map((step, idx) => (
            <div key={idx} style={styles.stepCard}>
              <span style={styles.stepBadge}>{step.step}</span>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Accelerate Your Hiring?</h2>
          <p style={styles.ctaSubtitle}>Join thousands of recruiters and candidates using AI-driven matching today.</p>
          <div style={styles.ctaButtons}>
            <Link to="/register" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Get Started Free
            </Link>
            <Link to="/pricing" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Explore Pricing
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
  heroSection: {
    padding: '60px 0 40px 0',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#2563EB',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.88rem',
    fontWeight: 600,
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.15,
    letterSpacing: '-1.5px',
    marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#4B5563',
    lineHeight: 1.6,
    maxWidth: '780px',
    margin: '0 auto 40px auto',
  },
  searchCard: {
    background: '#FFFFFF',
    border: '1px solid #6B7280',
    borderRadius: '16px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    marginBottom: '50px',
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
    background: '#E5E7EB',
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
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px 20px',
    boxShadow: 'var(--shadow-card)',
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
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  section: {
    padding: '60px 0',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '48px',
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
    color: '#111827',
    letterSpacing: '-0.5px',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '1.05rem',
    color: '#4B5563',
    maxWidth: '650px',
    margin: '0 auto',
  },
  companiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  companyCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
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
    color: '#111827',
    margin: '0 0 2px 0',
  },
  companyRating: {
    fontSize: '0.8rem',
    color: '#D97706',
    fontWeight: 700,
  },
  companyMeta: {
    fontSize: '0.88rem',
    color: '#4B5563',
    marginBottom: '20px',
  },
  viewJobsBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    width: '100%',
    justifyContent: 'center',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '28px',
  },
  featureCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '32px 28px',
    boxShadow: 'var(--shadow-card)',
    textAlign: 'left',
  },
  featureIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTag: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#2563EB',
    background: '#EFF6FF',
    padding: '2px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    marginBottom: '12px',
    border: '1px solid #BFDBFE',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '10px',
  },
  featureDesc: {
    fontSize: '0.92rem',
    color: '#4B5563',
    lineHeight: 1.6,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
  },
  stepCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '36px 28px',
    boxShadow: 'var(--shadow-card)',
    textAlign: 'left',
    position: 'relative',
  },
  stepBadge: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#2563EB',
    marginBottom: '16px',
    display: 'block',
  },
  stepTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '12px',
  },
  stepDesc: {
    fontSize: '0.92rem',
    color: '#4B5563',
    lineHeight: 1.6,
  },
  ctaBanner: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '24px',
    padding: '60px 40px',
    margin: '40px 0 80px 0',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '16px',
  },
  ctaSubtitle: {
    fontSize: '1.1rem',
    color: '#4B5563',
    marginBottom: '32px',
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
};
