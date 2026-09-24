import React from 'react';
import { MapPin, Briefcase, Star, Search, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompanyLogo } from '../components/CompanyLogo';

interface Company {
  id: number;
  name: string;
  industry: string;
  location: string;
  employees: string;
  rating: number;
  openJobsCount: number;
  description: string;
  logoGlow: string;
}

export const Companies: React.FC = () => {
  const companies: Company[] = [
    {
      id: 1,
      name: 'Google India',
      industry: 'Software & Technology',
      location: 'Bangalore, Karnataka',
      employees: '10,000+',
      rating: 4.8,
      openJobsCount: 1,
      description: 'Organizing the world\'s information and making it universally accessible and useful. Google is a global pioneer in AI, cloud computing, and web search systems.',
      logoGlow: '#4285F4'
    },
    {
      id: 2,
      name: 'Microsoft India',
      industry: 'Cloud & Hardware',
      location: 'Hyderabad, Telangana',
      employees: '10,000+',
      rating: 4.7,
      openJobsCount: 1,
      description: 'Empowering every person and organization on the planet to achieve more. Microsoft focuses on intelligent cloud architectures, cognitive AI systems, and enterprise tools.',
      logoGlow: '#F25022'
    },
    {
      id: 3,
      name: 'Amazon India',
      industry: 'E-Commerce & AWS Cloud',
      location: 'Chennai, Tamil Nadu',
      employees: '15,000+',
      rating: 4.5,
      openJobsCount: 1,
      description: 'A global leader in customer-centric retail systems, automated shipping logistics, and AWS cloud engineering operations.',
      logoGlow: '#FF9900'
    },
    {
      id: 4,
      name: 'Zoho Corporation',
      industry: 'SaaS & Productivity',
      location: 'Chennai, Tamil Nadu',
      employees: '8,000+',
      rating: 4.6,
      openJobsCount: 1,
      description: 'Crafting premium enterprise software to run entire businesses. Zoho is famous for writing cost-effective customer relations management (CRM) and workplace suites.',
      logoGlow: '#00A859'
    },
    {
      id: 5,
      name: 'Flipkart',
      industry: 'E-Commerce & Logistics',
      location: 'Bangalore, Karnataka',
      employees: '12,000+',
      rating: 4.4,
      openJobsCount: 1,
      description: 'India\'s largest online retail marketplace, leading tech advancements in supply chain management, recommendations engines, and unified payments.',
      logoGlow: '#2874F0'
    },
    {
      id: 6,
      name: 'Cognizant Technologies',
      industry: 'Consulting & IT Services',
      location: 'Pune, Maharashtra',
      employees: '25,000+',
      rating: 4.1,
      openJobsCount: 1,
      description: 'Helping clients update technology, redefine operations, and optimize backend software for a rapidly changing digital economy.',
      logoGlow: '#0033A0'
    },
    {
      id: 7,
      name: 'HCLTech',
      industry: 'Engineering & IT Services',
      location: 'Noida, Uttar Pradesh',
      employees: '20,000+',
      rating: 4.2,
      openJobsCount: 1,
      description: 'Empowering forward-thinking enterprises with industry-leading digital engineering, software products, and global network systems support.',
      logoGlow: '#005FA9'
    },
    {
      id: 8,
      name: 'TCS',
      industry: 'Enterprise Consultancy',
      location: 'Mumbai, Maharashtra',
      employees: '50,000+',
      rating: 4.3,
      openJobsCount: 1,
      description: 'A global leader in IT services, consulting, and business solutions. Partnering with the world\'s largest businesses to drive technological growth.',
      logoGlow: '#1B365D'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title} className="text-gradient">Explore Top Tech Employers</h1>
        <p style={styles.subtitle}>Discover profiles, reviews, and open positions at verified companies hiring on JobAI.</p>
      </div>

      <div style={styles.grid}>
        {companies.map((c) => (
          <div key={c.id} className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <CompanyLogo name={c.name} size={48} fallbackColor={c.logoGlow} />
              <div style={{ flex: 1 }}>
                <h3 style={styles.companyName}>{c.name}</h3>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{c.industry}</span>
              </div>
              <div style={styles.ratingBadge}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <span>{c.rating}</span>
              </div>
            </div>

            <p style={styles.desc}>{c.description}</p>

            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <MapPin size={14} color="#6B7280" />
                <span>{c.location}</span>
              </div>
              <div style={styles.metaItem}>
                <Briefcase size={14} color="#6B7280" />
                <span style={{ color: '#2563EB', fontWeight: 'bold' }}>{c.openJobsCount} Open Role</span>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Size: {c.employees} employees</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link 
                  to={`/company/${c.id}`} 
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                >
                  <span>Profile</span>
                  <ArrowUpRight size={12} />
                </Link>
                <Link 
                  to={`/jobs?what=${encodeURIComponent(c.name)}`} 
                  className="btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                >
                  <span>View Jobs</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
    color: '#111827',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#4B5563',
    maxWidth: '600px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    height: '350px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-card)',
  },
  cardHeader: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  logoPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: '1px solid #6B7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8FAFC',
  },
  companyName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#FEF3C7',
    color: '#D97706',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '700' as const,
  },
  desc: {
    fontSize: '0.85rem',
    color: '#374151',
    lineHeight: '1.5',
    flex: 1,
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderTop: '1px solid #F1F5F9',
    paddingTop: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#4B5563',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
};
