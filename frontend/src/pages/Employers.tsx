import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Sparkles, Users, Calendar, ShieldCheck, ChevronDown, ChevronUp, 
  ArrowRight, CheckCircle2, TrendingUp, Cpu, Clock, Award, Building2, 
  FileText, Search, Zap, Star, HelpCircle, BookOpen, Layers
} from 'lucide-react';

export const Employers: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'interviews'>('jobs');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How does RecruitNexus AI resume matching work?",
      answer: "Our AI engine analyzes candidate resumes using natural language processing (NLP) and skill-vector alignment. It extracts skills, work experience, and domain expertise, comparing them directly against your job requirements to generate a real-time Match Score percentage."
    },
    {
      question: "Is it free to create a Recruiter account on RecruitNexus?",
      answer: "Yes! Recruiters can sign up for free, post job openings, manage applicant pipelines, and utilize AI screening features without any upfront costs."
    },
    {
      question: "How do automated interview reminders work?",
      answer: "When you schedule an interview in your Recruiter Dashboard, our automated background service dispatches email reminders to candidates 24 hours prior to the scheduled time, helping reduce no-shows and keep your pipeline on track."
    },
    {
      question: "Can I manage candidate application statuses in real time?",
      answer: "Absolutely. The Recruiter Dashboard features a streamlined application tracking system where you can move candidates from Applied -> Shortlisted -> Interview Scheduled -> Offered with instant email notifications dispatched to candidates."
    },
    {
      question: "What resume file formats are supported for automated processing?",
      answer: "RecruitNexus securely processes PDF and DOCX resume files, automatically extracting profile details, skill highlights, and contact information."
    }
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* 1. HERO SECTION WITH CURVED WAVE */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <Zap size={16} color="#60A5FA" />
              <span>For Employers & Hiring Managers</span>
            </div>
            <h1 style={styles.heroTitle}>
              Let's hire your next great candidate. <span style={styles.highlightText}>Fast.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Post jobs, score candidates with precision AI, and streamline your entire hiring workflow from application to offer release on RecruitNexus.
            </p>
            <div style={styles.heroCtaGroup}>
              <button 
                onClick={() => navigate('/register?role=Recruiter')} 
                style={styles.primaryCtaBtn}
              >
                Post a Job Now <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
              <button 
                onClick={() => navigate('/login')} 
                style={styles.secondaryCtaBtn}
              >
                Sign In to Dashboard
              </button>
            </div>
            <div style={styles.trustBadgesRow}>
              <div style={styles.trustItem}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>Zero Upfront Fee</span>
              </div>
              <div style={styles.trustItem}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>Instant AI Scoring</span>
              </div>
              <div style={styles.trustItem}>
                <CheckCircle2 size={16} color="#34D399" />
                <span>24h Email Reminders</span>
              </div>
            </div>
          </div>

          <div style={styles.heroVisualCard}>
            <div style={styles.heroCardHeader}>
              <Building2 size={24} color="#3B82F6" />
              <div>
                <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '1.05rem' }}>RecruitNexus Hiring Suite</div>
                <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Active Recruiter Session</div>
              </div>
            </div>
            
            <div style={styles.heroCardStatsGrid}>
              <div style={styles.miniStatBox}>
                <div style={styles.miniStatVal}>10x</div>
                <div style={styles.miniStatLbl}>Faster Screening</div>
              </div>
              <div style={styles.miniStatBox}>
                <div style={styles.miniStatVal}>98.4%</div>
                <div style={styles.miniStatLbl}>AI Match Rate</div>
              </div>
              <div style={styles.miniStatBox}>
                <div style={styles.miniStatVal}>99.2%</div>
                <div style={styles.miniStatLbl}>Interview RSVP</div>
              </div>
            </div>

            <div style={styles.liveMatchPreviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '0.9rem' }}>Senior Full-Stack Developer</span>
                <span style={styles.matchScoreBadge}>98% Match</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={styles.miniTag}>C# .NET</span>
                <span style={styles.miniTag}>React.js</span>
                <span style={styles.miniTag}>SQL Server</span>
                <span style={styles.miniTag}>Docker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Curved Wave Mask SVG */}
        <div style={styles.waveContainer}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path d="M0 60C240 120 480 120 720 60C960 0 1200 0 1440 60V120H0V60Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* 2. 4-STEP HIRING WORKFLOW GRID */}
      <section style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <span style={styles.subHeadingTag}>END-TO-END HIRING</span>
          <h2 style={styles.sectionTitle}>Manage your hiring from start to finish</h2>
          <p style={styles.sectionDescription}>
            RecruitNexus empowers your HR team with powerful AI automation tools to find, evaluate, and hire top software engineering talent.
          </p>
        </div>

        <div style={styles.fourStepsGrid}>
          {/* Step 1 */}
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepIconBox, background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>
              <FileText size={28} />
            </div>
            <div style={styles.stepNumber}>01</div>
            <h3 style={styles.stepTitle}>Post a job</h3>
            <p style={styles.stepText}>
              Create detailed job descriptions with skill tags, salary ranges, and role requirements in under 2 minutes.
            </p>
          </div>

          {/* Step 2 */}
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepIconBox, background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <Cpu size={28} />
            </div>
            <div style={styles.stepNumber}>02</div>
            <h3 style={styles.stepTitle}>Find quality applicants</h3>
            <p style={styles.stepText}>
              Our AI engine automatically screens candidate resumes, scoring and ranking applicants based on exact job fit.
            </p>
          </div>

          {/* Step 3 */}
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepIconBox, background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
              <Calendar size={28} />
            </div>
            <div style={styles.stepNumber}>03</div>
            <h3 style={styles.stepTitle}>Make connections</h3>
            <p style={styles.stepText}>
              Schedule interviews directly from your dashboard with automated 24-hour candidate email notifications.
            </p>
          </div>

          {/* Step 4 */}
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepIconBox, background: 'rgba(139, 92, 246, 0.1)', color: '#7C3AED' }}>
              <ShieldCheck size={28} />
            </div>
            <div style={styles.stepNumber}>04</div>
            <h3 style={styles.stepTitle}>Hire confidently</h3>
            <p style={styles.stepText}>
              Track application status changes in real time, communicate feedback, and extend official offer letters seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE DASHBOARD SHOWCASE TABS */}
      <section style={styles.showcaseSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.subHeadingTag}>RECRUITER WORKSPACE</span>
            <h2 style={styles.sectionTitle}>Your dashboard features</h2>
            <p style={styles.sectionDescription}>
              Explore how RecruitNexus simplifies your candidate pipeline with intuitive recruiter management tools.
            </p>
          </div>

          {/* Tab Switcher Controls */}
          <div style={styles.tabsHeaderContainer}>
            <button 
              onClick={() => setActiveTab('jobs')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'jobs' ? styles.tabBtnActive : {})
              }}
            >
              <Briefcase size={18} />
              <span>Manage your jobs</span>
            </button>

            <button 
              onClick={() => setActiveTab('candidates')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'candidates' ? styles.tabBtnActive : {})
              }}
            >
              <Sparkles size={18} />
              <span>Choose who moves forward</span>
            </button>

            <button 
              onClick={() => setActiveTab('interviews')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'interviews' ? styles.tabBtnActive : {})
              }}
            >
              <Calendar size={18} />
              <span>Interview anywhere</span>
            </button>
          </div>

          {/* Active Tab Showcase View */}
          <div style={styles.tabContentCard}>
            {activeTab === 'jobs' && (
              <div style={styles.tabGrid}>
                <div style={styles.tabTextColumn}>
                  <div style={styles.tabBadge}>
                    <Briefcase size={14} color="#2563EB" />
                    <span>Job Management</span>
                  </div>
                  <h3 style={styles.tabHeading}>Track active postings & applicant volume</h3>
                  <p style={styles.tabBody}>
                    View all your open requisitions in one place. Monitor applicant volume, update job statuses, and post new opportunities with custom skill criteria.
                  </p>
                  <ul style={styles.tabBulletList}>
                    <li><CheckCircle2 size={16} color="#059669" /> Real-time application count updates</li>
                    <li><CheckCircle2 size={16} color="#059669" /> One-click job status toggle (Active / Closed)</li>
                    <li><CheckCircle2 size={16} color="#059669" /> Direct access to candidate submissions</li>
                  </ul>
                </div>

                <div style={styles.tabMockUiBox}>
                  <div style={styles.mockUiHeader}>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Active Job Postings</span>
                    <span style={styles.mockUiBadge}>3 Roles Open</span>
                  </div>
                  <div style={styles.mockJobRow}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>Senior Backend Engineer</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Remote • ₹18 - ₹25 LPA</div>
                    </div>
                    <span style={styles.mockAppCount}>14 Applicants</span>
                  </div>
                  <div style={styles.mockJobRow}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>Lead Frontend Developer (React)</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Bangalore • ₹15 - ₹22 LPA</div>
                    </div>
                    <span style={styles.mockAppCount}>28 Applicants</span>
                  </div>
                  <div style={styles.mockJobRow}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>DevOps & Cloud Specialist</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Hybrid • ₹20 - ₹28 LPA</div>
                    </div>
                    <span style={styles.mockAppCount}>9 Applicants</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div style={styles.tabGrid}>
                <div style={styles.tabTextColumn}>
                  <div style={{ ...styles.tabBadge, background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                    <Sparkles size={14} color="#059669" />
                    <span>AI Candidate Ranking</span>
                  </div>
                  <h3 style={styles.tabHeading}>Instantly identify top talent with AI match scores</h3>
                  <p style={styles.tabBody}>
                    Save hours of manual resume scanning. RecruitNexus AI ranks candidates automatically by comparing skills, experience, and domain relevance.
                  </p>
                  <ul style={styles.tabBulletList}>
                    <li><CheckCircle2 size={16} color="#059669" /> 0-100% Match Suitability Score</li>
                    <li><CheckCircle2 size={16} color="#059669" /> Instant Status Updates with Candidate Email Notification</li>
                    <li><CheckCircle2 size={16} color="#059669" /> Direct Resume PDF inspection</li>
                  </ul>
                </div>

                <div style={styles.tabMockUiBox}>
                  <div style={styles.mockUiHeader}>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Applicant Evaluation Matrix</span>
                    <span style={{ ...styles.mockUiBadge, background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>AI Ranked</span>
                  </div>
                  <div style={styles.mockCandidateRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={styles.mockAvatar}>RP</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>Rahul Prasad</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>5 yrs exp • React, Node, C#</div>
                      </div>
                    </div>
                    <span style={{ ...styles.matchScoreBadge, background: '#DCFCE7', color: '#15803D' }}>95% Match</span>
                  </div>
                  <div style={styles.mockCandidateRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={styles.mockAvatar}>AS</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>Ananya Sharma</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>3 yrs exp • Python, SQL, Docker</div>
                      </div>
                    </div>
                    <span style={{ ...styles.matchScoreBadge, background: '#FEF3C7', color: '#B45309' }}>88% Match</span>
                  </div>
                  <div style={styles.mockCandidateRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={styles.mockAvatar}>VK</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>Vikram Kumar</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>4 yrs exp • Java, Spring Boot</div>
                      </div>
                    </div>
                    <span style={{ ...styles.matchScoreBadge, background: '#E0F2FE', color: '#0369A1' }}>76% Match</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interviews' && (
              <div style={styles.tabGrid}>
                <div style={styles.tabTextColumn}>
                  <div style={{ ...styles.tabBadge, background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
                    <Calendar size={14} color="#D97706" />
                    <span>Automated Scheduling</span>
                  </div>
                  <h3 style={styles.tabHeading}>Never miss an interview with 24h background reminders</h3>
                  <p style={styles.tabBody}>
                    Set interview schedules with meeting links and locations. RecruitNexus background service automatically dispatches 24-hour pre-interview reminder emails to ensure 100% alignment.
                  </p>
                  <ul style={styles.tabBulletList}>
                    <li><CheckCircle2 size={16} color="#059669" /> IST Timezone-aware scheduling</li>
                    <li><CheckCircle2 size={16} color="#059669" /> Background worker prevents missed interviews</li>
                    <li><CheckCircle2 size={16} color="#059669" /> One-click interview status management</li>
                  </ul>
                </div>

                <div style={styles.tabMockUiBox}>
                  <div style={styles.mockUiHeader}>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Upcoming Interviews</span>
                    <span style={{ ...styles.mockUiBadge, background: 'rgba(245, 158, 11, 0.15)', color: '#B45309' }}>2 Scheduled</span>
                  </div>
                  <div style={styles.mockInterviewCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>Technical Round - Rahul Prasad</span>
                      <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 12 }}>Reminder Sent</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#D97706" /> Tomorrow at 10:00 AM IST • Google Meet
                    </div>
                  </div>
                  <div style={styles.mockInterviewCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>HR Round - Ananya Sharma</span>
                      <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 12 }}>Scheduled</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#D97706" /> Friday at 02:30 PM IST • Office HQ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. HIRING RESOURCES FOR EVERY STEP */}
      <section style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <span style={styles.subHeadingTag}>EMPLOYER KNOWLEDGE HUB</span>
          <h2 style={styles.sectionTitle}>Hiring resources for every step of the process</h2>
          <p style={styles.sectionDescription}>
            Explore guides, tech recruiting trends, and hiring insights written by talent acquisition specialists.
          </p>
        </div>

        <div style={styles.resourcesGrid}>
          <div style={styles.resourceCard}>
            <div style={styles.resourceTag}>GUIDE</div>
            <h3 style={styles.resourceTitle}>How to Write Tech Job Descriptions That Attract Top 5% Talent</h3>
            <p style={styles.resourceSnippet}>
              Discover key requirements, salary transparency tips, and skill-tagging strategies to increase qualified applicant rate by 40%.
            </p>
            <Link to="/resources" style={styles.resourceLink}>
              Read Article <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Link>
          </div>

          <div style={styles.resourceCard}>
            <div style={{ ...styles.resourceTag, background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>INSIGHTS</div>
            <h3 style={styles.resourceTitle}>Leveraging AI Resume Screening Without Bias in Software Hiring</h3>
            <p style={styles.resourceSnippet}>
              Learn how automated vector matching evaluates objective developer skills while eliminating unconscious demographic bias.
            </p>
            <Link to="/resources" style={styles.resourceLink}>
              Read Article <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Link>
          </div>

          <div style={styles.resourceCard}>
            <div style={{ ...styles.resourceTag, background: 'rgba(139, 92, 246, 0.1)', color: '#7C3AED' }}>CHECKLIST</div>
            <h3 style={styles.resourceTitle}>The Ultimate 24-Hour Candidate Engagement & Retention Checklist</h3>
            <p style={styles.resourceSnippet}>
              How automated status emails and timely interview reminders reduce candidate drop-off and improve offer acceptance rates.
            </p>
            <Link to="/resources" style={styles.resourceLink}>
              Read Article <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section style={styles.faqSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.subHeadingTag}>GOT QUESTIONS?</span>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p style={styles.sectionDescription}>
              Everything you need to know about hiring, posting jobs, and AI scoring on RecruitNexus.
            </p>
          </div>

          <div style={styles.faqAccordionContainer}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} style={styles.faqItem}>
                  <button 
                    onClick={() => toggleFaq(index)} 
                    style={styles.faqQuestionBtn}
                  >
                    <span style={styles.faqQuestionText}>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp size={20} color="#2563EB" />
                    ) : (
                      <ChevronDown size={20} color="#64748B" />
                    )}
                  </button>
                  {isOpen && (
                    <div style={styles.faqAnswerBox}>
                      <p style={styles.faqAnswerText}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA BANNER */}
      <section style={styles.bottomCtaSection}>
        <div style={styles.bottomCtaContainer}>
          <h2 style={styles.bottomCtaTitle}>Ready to hire your next engineering lead?</h2>
          <p style={styles.bottomCtaSubtitle}>
            Join 500+ top tech companies using RecruitNexus AI to recruit software developers faster.
          </p>
          <button 
            onClick={() => navigate('/register?role=Recruiter')} 
            style={styles.bottomCtaBtn}
          >
            Get Started For Free <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </section>
    </div>
  );
};

// Inline Styles Object
const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    minHeight: '100vh',
  },
  heroSection: {
    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E293B 100%)',
    color: '#FFFFFF',
    position: 'relative',
    paddingTop: '60px',
    overflow: 'hidden',
  },
  heroContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px 80px 24px',
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '48px',
    alignItems: 'center',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(96, 165, 250, 0.4)',
    color: '#93C5FD',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: '20px',
    color: '#F8FAFC',
    letterSpacing: '-0.02em',
  },
  highlightText: {
    color: '#60A5FA',
    position: 'relative',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#94A3B8',
    lineHeight: 1.6,
    marginBottom: '32px',
    maxWidth: '560px',
  },
  heroCtaGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  primaryCtaBtn: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
    transition: 'all 0.2s ease',
  },
  secondaryCtaBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '14px 24px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  trustBadgesRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    color: '#CBD5E1',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  heroVisualCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  heroCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  heroCardStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  miniStatBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
  },
  miniStatVal: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#60A5FA',
  },
  miniStatLbl: {
    fontSize: '0.72rem',
    color: '#94A3B8',
    marginTop: '2px',
  },
  liveMatchPreviewCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '14px',
    padding: '16px',
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    color: '#4ADE80',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  miniTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#CBD5E1',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.72rem',
  },
  waveContainer: {
    width: '100%',
    overflow: 'hidden',
    lineHeight: 0,
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 56px auto',
  },
  subHeadingTag: {
    color: '#2563EB',
    fontWeight: 800,
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    marginBottom: '8px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.25,
    marginBottom: '16px',
  },
  sectionDescription: {
    fontSize: '1.05rem',
    color: '#64748B',
    lineHeight: 1.6,
  },
  fourStepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '28px 24px',
    position: 'relative',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
  },
  stepIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  stepNumber: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#E2E8F0',
  },
  stepTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '10px',
  },
  stepText: {
    fontSize: '0.9rem',
    color: '#64748B',
    lineHeight: 1.5,
  },
  showcaseSection: {
    backgroundColor: '#F1F5F9',
    borderTop: '1px solid #E2E8F0',
    borderBottom: '1px solid #E2E8F0',
  },
  tabsHeaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    borderColor: '#2563EB',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  tabContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  tabGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    alignItems: 'center',
  },
  tabTextColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  tabBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: '#2563EB',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '16px',
    width: 'fit-content',
  },
  tabHeading: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.25,
    marginBottom: '14px',
  },
  tabBody: {
    fontSize: '0.98rem',
    color: '#64748B',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  tabBulletList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#334155',
    fontWeight: 500,
  },
  tabMockUiBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px',
  },
  mockUiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E2E8F0',
  },
  mockUiBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: '#2563EB',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  mockJobRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  mockAppCount: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  mockCandidateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  mockAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockInterviewCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    padding: '14px 16px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  resourcesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
  },
  resourceTag: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    color: '#2563EB',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    marginBottom: '14px',
  },
  resourceTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#0F172A',
    lineHeight: 1.4,
    marginBottom: '10px',
  },
  resourceSnippet: {
    fontSize: '0.88rem',
    color: '#64748B',
    lineHeight: 1.5,
    marginBottom: '20px',
    flex: 1,
  },
  resourceLink: {
    color: '#2563EB',
    fontWeight: 700,
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
  },
  faqAccordionContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  faqItem: {
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  faqQuestionBtn: {
    width: '100%',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqQuestionText: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0F172A',
  },
  faqAnswerBox: {
    padding: '0 24px 20px 24px',
    backgroundColor: '#F8FAFC',
  },
  faqAnswerText: {
    fontSize: '0.95rem',
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  bottomCtaSection: {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
    color: '#FFFFFF',
    padding: '80px 24px',
    textAlign: 'center',
  },
  bottomCtaContainer: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  bottomCtaTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    marginBottom: '16px',
  },
  bottomCtaSubtitle: {
    fontSize: '1.1rem',
    color: '#93C5FD',
    marginBottom: '32px',
    lineHeight: 1.5,
  },
  bottomCtaBtn: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    padding: '16px 36px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
  },
};
