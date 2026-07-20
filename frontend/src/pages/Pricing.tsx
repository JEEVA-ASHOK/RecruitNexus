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
          <span style={{ ...styles.toggleLabel, color: !isYearly ? '#00f2fe' : '#64748b' }}>Monthly</span>
          <button 
            onClick={() => setIsYearly(!isYearly)} 
            style={styles.toggleBtn}
          >
            <div style={{
              ...styles.toggleCircle,
              transform: isYearly ? 'translateX(24px)' : 'translateX(0px)',
              backgroundColor: isYearly ? '#8b5cf6' : '#00f2fe',
            }} />
          </button>
          <span style={{ ...styles.toggleLabel, color: isYearly ? '#8b5cf6' : '#64748b' }}>
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
                borderColor: p.recommended ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255,255,255,0.06)',
                boxShadow: p.recommended ? '0 0 30px rgba(0, 242, 254, 0.1)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
              }}
            >
              {p.recommended && (
                <div style={styles.recommendedBadge}>
                  <Sparkles size={10} color="#000" />
                  <span>MOST POPULAR</span>
                </div>
              )}

              <div>
                <h3 style={styles.planName}>{p.name}</h3>
                <div style={styles.priceRow}>
                  <span style={styles.currencySymbol}>₹</span>
                  <span style={styles.price}>{price.toLocaleString('en-IN')}</span>
                  <span style={styles.pricePeriod}>/{isYearly ? 'yr' : 'mo'}</span>
                </div>
                {isYearly && p.monthlyPrice > 0 && (
                  <span style={styles.yearlyBillingNote}>
                    Billed annually (₹{(p.yearlyPrice * 12).toLocaleString('en-IN')}/year)
                  </span>
                )}
              </div>

              <ul style={styles.featuresList}>
                {p.features.map((f, i) => (
                  <li key={i} style={styles.featureItem}>
                    <Check size={14} color="#00f2fe" style={{ flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => alert(`Redirecting to subscribe for ${p.name}...`)}
                style={{
                  ...styles.planBtn,
                  background: p.recommended ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.02)',
                  color: p.recommended ? '#0b0d19' : '#fff',
                  border: p.recommended ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {p.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={styles.guaranteeBox}>
        <ShieldCheck size={24} color="#34d399" />
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>
            100% Risk-Free Guarantee
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.4' }}>
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
  },
  subtitle: {
    fontSize: '1rem',
    color: '#94a3b8',
    maxWidth: '650px',
    margin: '0 auto',
    marginBottom: '24px',
  },
  toggleContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '30px',
    padding: '6px 16px',
  },
  toggleLabel: {
    fontSize: '0.82rem',
    fontWeight: '600' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s',
  },
  discountBadge: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#c084fc',
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  toggleBtn: {
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
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
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    position: 'relative' as const,
  },
  recommendedBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--accent-gradient)',
    color: '#0b0d19',
    fontSize: '0.65rem',
    fontWeight: '800' as const,
    padding: '4px 10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
  },
  planName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
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
    color: '#fff',
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-1px',
  },
  pricePeriod: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginLeft: '4px',
  },
  yearlyBillingNote: {
    fontSize: '0.72rem',
    color: '#64748b',
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
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  planBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  guaranteeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
  }
};
