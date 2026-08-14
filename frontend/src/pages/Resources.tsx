import React from 'react';
import { BookOpen, FileCode, GraduationCap, ChevronRight, FileDown, Layers } from 'lucide-react';

interface ResourceItem {
  id: number;
  type: string;
  title: string;
  badge: string;
  snippet: string;
}

export const Resources: React.FC = () => {
  const resources: ResourceItem[] = [
    {
      id: 1,
      type: 'Template',
      title: 'Premium ATS-Friendly Developer Resume Markdown',
      badge: 'Markdown',
      snippet: '# John Doe\nEmail: john@gmail.com | Phone: +91 9876543210\n\n## Technical Skills\n- Languages: C#, JavaScript, Python, SQL\n- Frameworks: React, ASP.NET Core, Node.js\n- Tools: Git, Docker, AWS'
    },
    {
      id: 2,
      type: 'Preparation',
      title: 'C# / .NET Core Interview Cheat Sheet',
      badge: 'Interview Guide',
      snippet: '- What is Dependency Injection (DI)? DI is a software design pattern where objects are passed their dependencies rather than creating them inside. In .NET, configured inside Program.cs using builder.Services.AddScoped/Singleton/Transient().'
    },
    {
      id: 3,
      type: 'Preparation',
      title: 'React hook lifecycle & performance optimization',
      badge: 'React Guide',
      snippet: '- Use React.memo() to prevent child renders when parent components state updates.\n- Use useMemo() and useCallback() to cache CPU heavy functions and event callbacks.'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title} className="text-gradient">Career Hub & Resources</h1>
        <p style={styles.subtitle}>Equip yourself with ATS-ready resume outlines, interview preparation guidelines, and tech roadmaps.</p>
      </div>

      <div style={styles.grid}>
        
        {/* Left Side: Study Resources */}
        <div style={styles.resourcesList}>
          {resources.map((r) => (
            <div key={r.id} className="glass-panel" style={styles.resourceCard}>
              <div style={styles.resourceHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {r.type === 'Template' ? <FileCode size={18} color="#2563EB" /> : <GraduationCap size={18} color="#8b5cf6" />}
                  <h3 style={styles.resourceTitle}>{r.title}</h3>
                </div>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{r.badge}</span>
              </div>
              
              <div style={styles.codeSnippetBox}>
                <pre style={styles.preText}>{r.snippet}</pre>
              </div>

              <div style={styles.resourceFooter}>
                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Resource type: {r.type}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(r.snippet);
                    alert('Copied resource code content to clipboard!');
                  }}
                  className="btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                >
                  <FileDown size={12} />
                  <span>Copy Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: FAQ / Tips Panels */}
        <div style={styles.sidebar}>
          <div className="glass-panel" style={styles.sideCard}>
            <div style={styles.sideHeader}>
              <Layers size={18} color="#2563EB" />
              <h3 style={styles.sideTitle}>ATS Optimization Checklist</h3>
            </div>
            <ul style={styles.checkList}>
              <li style={styles.checkItem}>
                <ChevronRight size={14} color="#2563EB" />
                <span>Avoid text inside image shapes or canvas elements. ATS bots cannot read drawings.</span>
              </li>
              <li style={styles.checkItem}>
                <ChevronRight size={14} color="#2563EB" />
                <span>Place precise keywords corresponding to the recruiter requirements.</span>
              </li>
              <li style={styles.checkItem}>
                <ChevronRight size={14} color="#2563EB" />
                <span>Specify total experience years clearly in the profile bio text.</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel" style={styles.sideCard}>
            <div style={styles.sideHeader}>
              <BookOpen size={18} color="#8b5cf6" />
              <h3 style={styles.sideTitle}>Useful Documentation Links</h3>
            </div>
            <ul style={styles.linkList}>
              <li style={styles.listItem}>
                <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                  React Documentation <ChevronRight size={12} />
                </a>
              </li>
              <li style={styles.listItem}>
                <a href="https://learn.microsoft.com/en-us/dotnet/" target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                  Microsoft .NET Documentation <ChevronRight size={12} />
                </a>
              </li>
              <li style={styles.listItem}>
                <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" style={styles.docLink}>
                  Google Gemini API Guides <ChevronRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
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
    gridTemplateColumns: '1.4fr 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  resourcesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  resourceCard: {
    padding: '24px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-card)',
  },
  resourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  resourceTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  codeSnippetBox: {
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    overflowX: 'auto' as const,
  },
  preText: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.82rem',
    color: '#1E293B',
    whiteSpace: 'pre-wrap' as const,
    lineHeight: '1.5',
  },
  resourceFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  sideCard: {
    padding: '24px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-card)',
  },
  sideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  sideTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
  },
  checkList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  checkItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#374151',
    lineHeight: '1.5',
    alignItems: 'flex-start',
  },
  linkList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  listItem: {
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '8px',
  },
  docLink: {
    color: '#2563EB',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s',
  }
};
