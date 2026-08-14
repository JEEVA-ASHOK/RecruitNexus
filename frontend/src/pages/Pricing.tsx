import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Building, Briefcase } from 'lucide-react';

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  recommended: boolean;
  buttonText: string;
}

export const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans: Plan[] = [
    {
      name: 'Starter Plan',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Post 1 active job opening',
        'Standard dashboard tracking',
        'Basic matching metrics',
        'Email notifications support'
      ],
      recommended: false,
      buttonText: 'Get Started Free'
    },
    {
      name: 'Professional Copilot',
      monthlyPrice: 4999,
      yearlyPrice: 3999,
      features: [
        'Unlimited active job posts',
        'Real-time Gemini resume parsing',
        'AI compatibility scoring (>90% accuracy)',
        'Personal Talent chatbot helper',
        'Priority email/chat support'
      ],
      recommended: true,
      buttonText: 'Start Free 14-Day Trial'
    },
    {
      name: 'Enterprise Hub',
      monthlyPrice: 19999,
      yearlyPrice: 14999,
      features: [
        'Everything in Professional',
        'Direct coding test integrations',
        'In-app video interview scheduling',
        'Multiple recruiter seats (10+ users)',
        'Custom REST API access & SLA'
      ],
      recommended: false,
      buttonText: 'Contact Sales Team'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title} className="text-gradient">Flexible Recruitment Pricing</h1>
        <p style={styles.subtitle}>Empower your recruitment team with Gemini AI job-matching, resume parser filters, and candidate pipeline tracking.</p>

        {/* Pricing Toggle */}
        <div style={styles.toggleContainer}>
          <span style={{ ...styles.toggleLabel, color: !isYearly ? '#2563EB' : '#4B5563' }}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)} 
            style={styles.toggleBtn}
          >
            <div style={{
              ...styles.toggleCircle,
              transform: isYearly ? 'translateX(24px)' : 'translateX(0px)',
              backgroundColor: '#2563EB',
            }} />
          </button>
          <span style={{ ...styles.toggleLabel, color: isYearly ? '#2563EB' : '#4B5563' }}>
            Yearly <span style={styles.discountBadge}>Save 20%</span>
          </span>
        </div>
      </div>

      <div style={styles.grid}>
        {plans.map((p, idx) => {
          const price = isYearly ? p.yearlyPrice : p.monthlyPrice;
          
          return (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{
                ...styles.card,
                borderColor: p.recommended ? '#2563EB' : '#E5E7EB',
                boxShadow: p.recommended ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'var(--shadow-card)'
              }}
            >
              {p.recommended && (
                <div style={styles.recommendedBadge}>
                  <Sparkles size={12} /> RECOMMENDED
                </div>
              )}

              <div>
                <h3 style={styles.planName}>{p.name}</h3>
                <div style={styles.priceRow}>
                  <span style={styles.currencySymbol}>₹</span>
                  <span style={styles.price}>{price.toLocaleString()}</span>
                  <span style={styles.pricePeriod}>/month</span>
                </div>
                <span style={styles.yearlyBillingNote}>
                  {isYearly ? 'Billed annually' : 'Billed monthly'}
                </span>

                <ul style={styles.featuresList}>
                  {p.features.map((f, fIdx) => (
                    <li key={fIdx} style={styles.featureItem}>
                      <Check size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={p.recommended ? 'btn-primary' : 'btn-secondary'}
                style={styles.planBtn}
              >
                {p.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise SLA Guarantee Banner */}
      <div className="glass-panel" style={styles.guaranteeBox}>
        <ShieldCheck size={32} color="#2563EB" />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#111827', fontWeight: '700' }}>
            14-Day Money-Back Guarantee
          </h4>
          <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: '1.4', margin: 0 }}>
            Try any of our premium plans free for 14 days. If you are not completely satisfied, cancel your subscription at any time with no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
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
    maxWidth: '650px',
    margin: '0 auto',
    marginBottom: '24px',
  },
  toggleContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '30px',
    padding: '6px 16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  toggleLabel: {
    fontSize: '0.88rem',
    fontWeight: '600' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  discountBadge: {
    background: '#EFF6FF',
    color: '#2563EB',
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '700' as const,
    border: '1px solid #BFDBFE',
  },
  toggleBtn: {
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    background: '#F1F5F9',
    border: '1px solid #6B7280',
    cursor: 'pointer',
    position: 'relative' as const,
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  toggleCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    alignItems: 'stretch',
    marginBottom: '40px',
  },
  card: {
    padding: '30px 24px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    position: 'relative' as const,
    background: '#FFFFFF',
  },
  recommendedBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#2563EB',
    color: '#FFFFFF',
    fontSize: '0.7rem',
    fontWeight: '800' as const,
    padding: '4px 12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
  },
  planName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '16px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '4px',
  },
  currencySymbol: {
    fontSize: '1.45rem',
    fontWeight: '700',
    color: '#111827',
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-1px',
  },
  pricePeriod: {
    fontSize: '0.88rem',
    color: '#6B7280',
    marginLeft: '4px',
  },
  yearlyBillingNote: {
    fontSize: '0.78rem',
    color: '#6B7280',
    display: 'block',
    marginBottom: '16px',
  },
  featuresList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    margin: '24px 0',
    flex: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '0.88rem',
    color: '#374151',
    lineHeight: '1.4',
  },
  planBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  guaranteeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
  }
};
