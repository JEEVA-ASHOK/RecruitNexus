import React, { useState } from 'react';
import { Bot, Sparkles, BrainCircuit, BarChart3, HelpCircle, DollarSign } from 'lucide-react';

interface ToolItem {
  id: number;
  title: string;
  badge: string;
  description: string;
  status: string;
}

export const AiTools: React.FC = () => {
  const tools: ToolItem[] = [
    {
      id: 1,
      title: 'Gemini Resume Parser',
      badge: 'Active Service',
      description: 'Upload your PDF resume inside your profile page. The integrated Gemini AI reads the text content, extracts your primary skills, drafts a bio, and inserts them into your dashboard automatically.',
      status: 'Live'
    },
    {
      id: 2,
      title: 'AI Compatibility Scorer',
      badge: 'Active Service',
      description: 'When applying for positions, JobAI automatically evaluates your parsed experience, skills, and background against the recruiter\'s criteria and scores the match compatibility between 0-100%.',
      status: 'Live'
    },
    {
      id: 3,
      title: 'Floating Talent Copilot',
      badge: 'Active Service',
      description: 'Need help optimization? Toggle the robot helper in the bottom-right corner. It uses contextual memory to answer questions, recommend jobs, and help prepare recruiter letters.',
      status: 'Live'
    },
    {
      id: 4,
      title: 'Mock Interview Prep Coach',
      badge: 'Automated Service',
      description: 'Generate specific interview questions based on target requirements. Recruiters can auto-compile custom test questions instantly to test candidate skills.',
      status: 'Live'
    }
  ];

  // Interactive Salary Estimator State
  const [role, setRole] = useState('Frontend Developer');
  const [experience, setExperience] = useState(2);
  const [location, setLocation] = useState('Bangalore');
  const [estimatedSalary, setEstimatedSalary] = useState<string>('₹6,50,000 - ₹9,50,000');

  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    
    let baseMin = 400000;
    let baseMax = 700000;

    switch (role) {
      case 'Frontend Developer':
        baseMin = 450000;
        baseMax = 800000;
        break;
      case 'Backend Developer':
        baseMin = 500000;
        baseMax = 900000;
        break;
      case 'DevOps Architect':
        baseMin = 800000;
        baseMax = 1500000;
        break;
      case 'Product Manager':
        baseMin = 750000;
        baseMax = 1400000;
        break;
      case 'Data Scientist':
        baseMin = 650000;
        baseMax = 1200000;
        break;
    }

    // Add experience multiplier
    const expMultiplier = 1 + (experience * 0.15);
    let finalMin = Math.round(baseMin * expMultiplier);
    let finalMax = Math.round(baseMax * expMultiplier);

    // Location modifier
    if (location === 'Bangalore' || location === 'Mumbai') {
      finalMin = Math.round(finalMin * 1.1);
      finalMax = Math.round(finalMax * 1.15);
    } else if (location === 'Remote') {
      finalMin = Math.round(finalMin * 1.05);
      finalMax = Math.round(finalMax * 1.05);
    }

    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });

    setEstimatedSalary(`${formatter.format(finalMin)} - ${formatter.format(finalMax)} a year`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title} className="text-gradient">Intelligence Suite & AI Tools</h1>
        <p style={styles.subtitle}>Supercharge your job application speed and hiring accuracy with our Gemini integration.</p>
      </div>

      <div style={styles.splitGrid}>
        
        {/* Left Side: Interactive Salary Estimator */}
        <div className="glass-panel" style={styles.calculatorCard}>
          <div style={styles.cardHeaderTitle}>
            <BrainCircuit size={20} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 4px #00f2fe)' }} />
            <h2 style={styles.cardTitle}>AI Salary Predictor (India Market)</h2>
          </div>
          <p style={styles.calcDesc}>Estimate your market value dynamically using historical recruitment records and role criteria.</p>

          <form onSubmit={calculateEstimate} style={styles.calcForm}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Target Specialization</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="glass-input"
                style={{ padding: '10px' }}
              >
                <option value="Frontend Developer">React Frontend Developer</option>
                <option value="Backend Developer">C# Backend Engineer</option>
                <option value="DevOps Architect">Cloud DevOps Architect</option>
                <option value="Product Manager">Technical Product Manager</option>
                <option value="Data Scientist">AI/ML Data Scientist</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Experience (Years)</label>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  value={experience} 
                  onChange={(e) => setExperience(Number(e.target.value))} 
                  className="glass-input" 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Preferred Hub</label>
                <select 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="glass-input"
                  style={{ padding: '10px' }}
                >
                  <option value="Bangalore">Bangalore (IT hub)</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Remote">Fully Remote</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Calculate Market Value Estimate
            </button>
          </form>

          <div style={styles.resultBox}>
            <span style={styles.resultLabel}>Estimated Yearly Compensation</span>
            <h3 style={styles.resultValue} className="text-gradient">{estimatedSalary}</h3>
          </div>
        </div>

        {/* Right Side: Showcase AI Features */}
        <div style={styles.toolsList}>
          {tools.map((t) => (
            <div key={t.id} className="glass-panel" style={styles.toolCard}>
              <div style={styles.toolHeader}>
                <div style={styles.toolTitleWrapper}>
                  <Bot size={18} color="#8b5cf6" />
                  <h3 style={styles.toolTitle}>{t.title}</h3>
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{t.badge}</span>
              </div>
              <p style={styles.toolDesc}>{t.description}</p>
            </div>
          ))}
        </div>

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
  },
  subtitle: {
    fontSize: '1rem',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '32px',
    alignItems: 'start',
  },
  calculatorCard: {
    padding: '28px',
  },
  cardHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  calcDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  calcForm: {
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    marginBottom: '16px',
  },
  formLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
  },
  resultBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px 20px',
    textAlign: 'center' as const,
  },
  resultLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'block',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
  },
  resultValue: {
    fontSize: '1.45rem',
    fontWeight: '800',
  },
  toolsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
  },
  toolCard: {
    padding: '20px',
  },
  toolHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  toolTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toolTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
  },
  toolDesc: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: '1.5',
  }
};
