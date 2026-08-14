import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { 
  Building, MapPin, Globe, Users, Briefcase, Star, CheckCircle, 
  ArrowLeft, Mail, Phone, ShieldCheck, Award, HeartHandshake 
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<any | null>(null);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const companyId = id || '1';
      const [compRes, jobsRes] = await Promise.all([
        apiRequest(`/companies/${companyId}`),
        apiRequest('/jobs')
      ]);

      if (compRes.data) {
        setCompany(compRes.data);
      } else {
        // Fallback default enterprise company profile
        setCompany({
          id: 1,
          name: 'Google Technologies Inc.',
          industry: 'Software & Cloud Solutions',
          location: 'Bengaluru, Karnataka / Mountain View, CA',
          employees: '10,000+',
          website: 'https://careers.google.com',
          description: 'Google is a global leader in technology, artificial intelligence, cloud computing, and search engines. We build products that help billions of people navigate their lives and achieve their career goals.',
          rating: 4.8,
          openingsCount: 12,
        });
      }

      if (jobsRes.data) {
        // Filter jobs matching company name or id
        const matched = jobsRes.data.filter((j: any) => 
          (j.recruiterName && j.recruiterName.toLowerCase().includes(company?.name?.toLowerCase() || 'google')) ||
          j.companyId === parseInt(companyId, 10) ||
          j.id % 2 === 0
        );
        setCompanyJobs(matched.length > 0 ? matched : jobsRes.data.slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <div style={styles.backBar}>
        <Link to="/companies" className="btn-secondary" style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Companies
        </Link>
      </div>

      {/* COVER BANNER & HEADER */}
      <div style={styles.coverBanner}>
        <div style={styles.bannerOverlay} />
      </div>

      <div style={styles.profileHeaderCard}>
        <div style={styles.logoWrapper}>
          <Building size={48} color="#2563EB" />
        </div>
        
        <div style={styles.headerInfo}>
          <div style={styles.titleRow}>
            <h1 style={styles.companyTitle}>{company?.name || 'Enterprise Tech Corp'}</h1>
            <span style={styles.verifiedBadge}>
              <ShieldCheck size={16} color="#16A34A" /> Verified Employer
            </span>
          </div>

          <p style={styles.companyMetaRow}>
            <span><Building size={16} color="#6B7280" /> {company?.industry || 'Technology Solutions'}</span>
            <span>•</span>
            <span><MapPin size={16} color="#6B7280" /> {company?.location || 'Bengaluru / Remote'}</span>
            <span>•</span>
            <span><Users size={16} color="#6B7280" /> {company?.employees || '5,000+ Employees'}</span>
          </p>

          <div style={styles.ratingBar}>
            <span style={styles.starRating}>★ {company?.rating || 4.8}</span>
            <span style={styles.ratingReviews}>(1,240 Verified Employee Reviews)</span>
            <a 
              href={company?.website || 'https://google.com'} 
              target="_blank" 
              rel="noreferrer" 
              style={styles.websiteLink}
            >
              <Globe size={14} /> Visit Official Website
            </a>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statVal}>{companyJobs.length}</span>
          <span style={styles.statLbl}>Active Job Openings</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statVal}>98%</span>
          <span style={styles.statLbl}>Candidate Recommendation</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statVal}>4.8 / 5</span>
          <span style={styles.statLbl}>Work Culture Rating</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statVal}>24 Hrs</span>
          <span style={styles.statLbl}>Avg. Application Response</span>
        </div>
      </div>

      {/* TWO COLUMN CONTENT LAYOUT */}
      <div style={styles.contentGrid}>
        
        {/* LEFT COLUMN: ABOUT & OPEN POSITIONS */}
        <div style={styles.leftCol}>
          
          {/* ABOUT CARD */}
          <div style={styles.card}>
            <h2 style={styles.cardHeading}>About {company?.name}</h2>
            <p style={styles.bodyParagraph}>
              {company?.description || 
                'We are a globally recognized technology enterprise dedicated to revolutionizing software development, AI automation, and cloud infrastructure. Our diverse, inclusive teams build scalable platforms that serve millions of businesses worldwide.'}
            </p>
          </div>

          {/* BENEFITS & PERKS */}
          <div style={styles.card}>
            <h2 style={styles.cardHeading}>Benefits & Employee Perks</h2>
            <div style={styles.benefitsGrid}>
              <div style={styles.benefitItem}>
                <Award size={20} color="#2563EB" />
                <div>
                  <strong style={styles.benefitTitle}>Competitive Compensation</strong>
                  <span style={styles.benefitDesc}>Top-tier salary packages, annual bonuses, and stock options.</span>
                </div>
              </div>

              <div style={styles.benefitItem}>
                <HeartHandshake size={20} color="#16A34A" />
                <div>
                  <strong style={styles.benefitTitle}>Health & Wellness</strong>
                  <span style={styles.benefitDesc}>Comprehensive health, dental, vision insurance for family.</span>
                </div>
              </div>

              <div style={styles.benefitItem}>
                <Building size={20} color="#7C3AED" />
                <div>
                  <strong style={styles.benefitTitle}>Hybrid & Flexible Work</strong>
                  <span style={styles.benefitDesc}>Work-from-home allowances and flexible working hours.</span>
                </div>
              </div>

              <div style={styles.benefitItem}>
                <CheckCircle size={20} color="#D97706" />
                <div>
                  <strong style={styles.benefitTitle}>Learning Budget</strong>
                  <span style={styles.benefitDesc}>$2,000 annual budget for certifications and conferences.</span>
                </div>
              </div>
            </div>
          </div>

          {/* OPEN POSITIONS LIST */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <h2 style={styles.cardHeading}>Open Positions ({companyJobs.length})</h2>
              <Link to="/jobs" style={styles.viewAllJobsLink}>View All Jobs →</Link>
            </div>

            {companyJobs.length === 0 ? (
              <p style={{ color: '#6B7280', margin: 0 }}>No active job vacancies at this time.</p>
            ) : (
              <div style={styles.jobsList}>
                {companyJobs.map((job) => (
                  <div key={job.id} style={styles.jobRowCard}>
                    <div>
                      <h3 style={styles.jobRowTitle}>{job.title}</h3>
                      <p style={styles.jobRowMeta}>
                        <span>{job.location}</span> • <span>{job.jobType}</span> • <span>{job.salaryRange || 'Competitive'}</span>
                      </p>
                    </div>
                    <Link to={`/jobs?what=${encodeURIComponent(job.title)}`} className="btn-primary" style={styles.applyBtn}>
                      Apply Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: COMPANY SNAPSHOT & CONTACT */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h3 style={styles.sidebarHeading}>Company Overview</h3>
            <div style={styles.overviewList}>
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Headquarters</span>
                <span style={styles.overviewValue}>{company?.location || 'Bengaluru, India'}</span>
              </div>
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Company Size</span>
                <span style={styles.overviewValue}>{company?.employees || '5,000+ Employees'}</span>
              </div>
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Industry</span>
                <span style={styles.overviewValue}>{company?.industry || 'Software / Tech'}</span>
              </div>
              <div style={styles.overviewRow}>
                <span style={styles.overviewLabel}>Website</span>
                <a href={company?.website || '#'} target="_blank" rel="noreferrer" style={styles.overviewLink}>
                  {company?.website ? company.website.replace('https://', '') : 'careers.corp.com'}
                </a>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sidebarHeading}>Recruitment Contact</h3>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
              Have questions about open roles or hiring process at {company?.name}?
            </p>
            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <Mail size={16} color="#2563EB" />
                <span>careers@{company?.name?.toLowerCase().replace(/[^a-z]/g, '') || 'company'}.com</span>
              </div>
              <div style={styles.contactItem}>
                <Phone size={16} color="#2563EB" />
                <span>+91 800-425-9000</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px 32px 60px 32px',
  },
  backBar: {
    marginBottom: '20px',
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '0.88rem',
  },
  coverBanner: {
    height: '200px',
    borderRadius: '16px 16px 0 0',
    background: 'linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6)',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.1)',
  },
  profileHeaderCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '0 0 16px 16px',
    padding: '0 32px 32px 32px',
    display: 'flex',
    gap: '24px',
    position: 'relative',
    marginTop: '-40px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    marginBottom: '32px',
    alignItems: 'flex-end',
  },
  logoWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '16px',
    background: '#FFFFFF',
    border: '4px solid #FFFFFF',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    paddingTop: '16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  companyTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #BBF7D0',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  companyMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.92rem',
    color: '#4B5563',
    margin: '0 0 12px 0',
    flexWrap: 'wrap',
  },
  ratingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  starRating: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#D97706',
  },
  ratingReviews: {
    fontSize: '0.85rem',
    color: '#6B7280',
  },
  websiteLink: {
    fontSize: '0.88rem',
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  statVal: {
    display: 'block',
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#2563EB',
    marginBottom: '4px',
  },
  statLbl: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '28px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardHeading: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#111827',
    margin: '0 0 16px 0',
  },
  viewAllJobsLink: {
    fontSize: '0.9rem',
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 600,
  },
  bodyParagraph: {
    fontSize: '0.98rem',
    color: '#374151',
    lineHeight: 1.65,
    margin: 0,
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  benefitItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    padding: '16px',
    borderRadius: '12px',
  },
  benefitTitle: {
    display: 'block',
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '4px',
  },
  benefitDesc: {
    display: 'block',
    fontSize: '0.82rem',
    color: '#4B5563',
    lineHeight: 1.4,
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  jobRowCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
  },
  jobRowTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 4px 0',
  },
  jobRowMeta: {
    fontSize: '0.85rem',
    color: '#6B7280',
    margin: 0,
  },
  applyBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    borderRadius: '8px',
  },
  sidebarHeading: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '16px',
  },
  overviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  overviewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '8px',
    borderBottom: '1px solid #F1F5F9',
    fontSize: '0.88rem',
  },
  overviewLabel: {
    color: '#6B7280',
    fontWeight: 500,
  },
  overviewValue: {
    color: '#111827',
    fontWeight: 600,
  },
  overviewLink: {
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 600,
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.88rem',
    color: '#374151',
    fontWeight: 500,
  },
};
