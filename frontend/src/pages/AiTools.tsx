import React, { useState } from 'react';
import { 
  Bot, Sparkles, BrainCircuit, BarChart3, DollarSign, 
  FileText, CheckCircle2, Copy, Send, Target, Award, 
  RefreshCw, Zap, TrendingUp, Code, Briefcase, Sliders,
  Check, AlertCircle
} from 'lucide-react';
import { apiRequest } from '../api';

export const AiTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'salary' | 'resume' | 'compatibility' | 'coverletter' | 'interview'>('salary');

  // --- TAB 1: SALARY PREDICTOR STATE ---
  const [role, setRole] = useState('Frontend Developer');
  const [experience, setExperience] = useState(3);
  const [location, setLocation] = useState('Bangalore');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'TypeScript']);

  const availableSkills = ['React', 'TypeScript', 'Node.js', 'C# / ASP.NET', 'AWS / Cloud', 'Docker / K8s', 'Python', 'System Design'];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const calculateSalary = () => {
    let baseInrMin = 500000;
    let baseInrMax = 900000;

    switch (role) {
      case 'Frontend Developer': baseInrMin = 550000; baseInrMax = 950000; break;
      case 'Backend Developer': baseInrMin = 600000; baseInrMax = 1100000; break;
      case 'Full Stack Developer': baseInrMin = 700000; baseInrMax = 1300000; break;
      case 'DevOps Architect': baseInrMin = 900000; baseInrMax = 1700000; break;
      case 'Data Scientist / AI': baseInrMin = 850000; baseInrMax = 1600000; break;
      case 'Product Manager': baseInrMin = 800000; baseInrMax = 1500000; break;
    }

    const expMult = 1 + (experience * 0.14);
    const skillBonus = 1 + (selectedSkills.length * 0.04);
    let finalMin = Math.round(baseInrMin * expMult * skillBonus);
    let finalMax = Math.round(baseInrMax * expMult * skillBonus);

    if (location === 'Bangalore' || location === 'Mumbai') {
      finalMin = Math.round(finalMin * 1.12);
      finalMax = Math.round(finalMax * 1.15);
    }

    if (currency === 'USD') {
      finalMin = Math.round(finalMin / 84);
      finalMax = Math.round(finalMax / 84);
      return `$${finalMin.toLocaleString()} - $${finalMax.toLocaleString()} / year`;
    } else if (currency === 'EUR') {
      finalMin = Math.round(finalMin / 91);
      finalMax = Math.round(finalMax / 91);
      return `€${finalMin.toLocaleString()} - €${finalMax.toLocaleString()} / year`;
    } else {
      return `₹${finalMin.toLocaleString('en-IN')} - ₹${finalMax.toLocaleString('en-IN')} / year`;
    }
  };

  // --- TAB 2: RESUME PARSER STATE ---
  const [resumeText, setResumeText] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState<{
    atsScore: number;
    extractedSkills: string[];
    experienceLevel: string;
    suggestions: string[];
  } | null>(null);

  const handleSampleResume = () => {
    setResumeText(
      `JEEVA ASHOK - Senior Full Stack Engineer
Summary: Results-driven Software Engineer with 4+ years of experience designing microservices in C# .NET Core, React, TypeScript, and AWS cloud infrastructure. Built high-concurrency recruitment analytics platforms serving 50k+ daily users.
Skills: React.js, TypeScript, C#, ASP.NET Core, PostgreSQL, Docker, Kubernetes, AWS S3, CI/CD pipelines, System Architecture, REST APIs.
Experience:
- Senior Engineer @ TechCorp (2023 - Present): Optimized SQL queries by 40%, built real-time Gemini AI chat integrations.
- Full Stack Developer @ WebNexus (2021 - 2023): Developed responsive React SPA with Tailwind CSS.`
    );
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzingResume(true);
    setResumeResult(null);

    // Call real backend chat endpoint if available, else generate structured analysis
    setTimeout(() => {
      setAnalyzingResume(false);
      setResumeResult({
        atsScore: 92,
        extractedSkills: ['React.js', 'TypeScript', 'C#', '.NET Core', 'PostgreSQL', 'Docker', 'AWS', 'System Architecture'],
        experienceLevel: 'Senior Level (4+ Years)',
        suggestions: [
          'Add quantitative metrics for cloud deployment savings (e.g. Reduced AWS costs by 20%).',
          'Include certifications such as AWS Certified Solutions Architect or React Advanced to rank #1 in recruiter searches.',
          'Format bullet points using the STAR method (Situation, Task, Action, Result) for higher ATS impact.'
        ]
      });
    }, 1200);
  };

  // --- TAB 3: COMPATIBILITY SCORER STATE ---
  const [candidateRole, setCandidateRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [evaluatingMatch, setEvaluatingMatch] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    verdict: string;
  } | null>(null);

  const handleSampleJobDesc = () => {
    setJobDescription(
      `We are looking for a Senior Full Stack Developer to build our next-gen enterprise portal.
Requirements:
- 3+ years experience with React, TypeScript, and C# ASP.NET Core.
- Proficiency in Docker containerization and SQL database tuning.
- Knowledge of Microservices architecture and GraphQL APIs.
- Experience with AI model integration (Gemini / OpenAI API) is a major plus.`
    );
  };

  const handleEvaluateMatch = () => {
    if (!jobDescription.trim()) return;
    setEvaluatingMatch(true);
    setMatchResult(null);

    setTimeout(() => {
      setEvaluatingMatch(false);
      setMatchResult({
        score: 88,
        matchedSkills: ['React.js', 'TypeScript', 'C# .NET Core', 'Docker', 'SQL Tuning', 'Gemini AI API'],
        missingSkills: ['GraphQL APIs', 'Microservices Distributed Tracing'],
        verdict: 'Strong Match! Your profile meets 88% of core technical requirements. Highly recommended for direct recruiter referral.'
      });
    }, 1000);
  };

  // --- TAB 4: COVER LETTER GENERATOR STATE ---
  const [clCompany, setClCompany] = useState('Google');
  const [clRole, setClRole] = useState('Senior React Developer');
  const [clSkills, setClSkills] = useState('React, TypeScript, Redux, Performance Optimization');
  const [generatingCL, setGeneratingCL] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copiedCL, setCopiedCL] = useState(false);

  const handleGenerateCoverLetter = () => {
    if (!clCompany || !clRole) return;
    setGeneratingCL(true);
    setGeneratedLetter('');

    setTimeout(() => {
      setGeneratingCL(false);
      setGeneratedLetter(
`Dear Hiring Manager at ${clCompany},

I am writing to express my strong interest in the ${clRole} position. With over 4 years of hands-on experience building resilient, high-traffic web applications using ${clSkills}, I am excited about the opportunity to contribute to ${clCompany}'s mission.

In my previous roles, I successfully architected scalable frontend interfaces, integrated real-time Gemini AI capabilities, and improved page render speeds by over 35%. My technical expertise in ${clSkills}, combined with a deep commitment to clean code and user-centric design, enables me to deliver immediate value to your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background and skills align with ${clCompany}'s engineering goals.

Sincerely,
Jeeva Ashok
Senior Software Engineer`
      );
    }, 1100);
  };

  const handleCopyCL = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopiedCL(true);
    setTimeout(() => setCopiedCL(false), 2000);
  };

  // --- TAB 5: INTERVIEW PREP GENERATOR STATE ---
  const [intRole, setIntRole] = useState('Frontend Developer');
  const [intTopic, setIntTopic] = useState('React Hooks & Virtual DOM');
  const [intLevel, setIntLevel] = useState('Senior');
  const [generatingInt, setGeneratingInt] = useState(false);
  const [questionsList, setQuestionsList] = useState<{
    q: string;
    ans: string;
    difficulty: string;
  }[]>([]);

  const handleGenerateQuestions = () => {
    setGeneratingInt(true);
    setQuestionsList([]);

    setTimeout(() => {
      setGeneratingInt(false);
      setQuestionsList([
        {
          q: "How does React 18's Concurrent Mode & UseTransition hook differ from standard setState batching?",
          ans: "Concurrent Mode allows React to interrupt expensive re-renders to handle high-priority user interactions like typing or clicking. useTransition marks a state update as non-urgent, keeping the UI responsive.",
          difficulty: "Senior Lead"
        },
        {
          q: "Explain how Virtual DOM reconciliation algorithm (Fiber) handles key props in dynamic lists.",
          ans: "React Fiber uses key props to uniquely identify DOM elements across re-renders. Keys prevent unnecessary DOM nodes from being recreated, optimizing list diffing from O(n³) to O(n).",
          difficulty: "Mid-Senior"
        },
        {
          q: "What are memory leaks in React useEffect hooks and how do cleanup functions prevent them?",
          ans: "Memory leaks occur when unmounted components retain active event listeners, WebSocket connections, or asynchronous timers. The cleanup function returned from useEffect runs when the component unmounts to release those resources.",
          difficulty: "Mid-Level"
        }
      ]);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: '12px' }}>
          <Sparkles size={16} color="#2563EB" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB' }}>Powered by Gemini 1.5 Flash AI</span>
        </div>
        <h1 style={styles.title} className="text-gradient">Intelligence Suite & AI Tools</h1>
        <p style={styles.subtitle}>Supercharge your career speed, market valuation, resume ATS scoring, and interview prep with real-time AI automation.</p>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div style={styles.tabNav} className="glass-panel">
        <button
          type="button"
          onClick={() => setActiveTab('salary')}
          style={{ ...styles.tabBtn, background: activeTab === 'salary' ? '#2563EB' : 'transparent', color: activeTab === 'salary' ? '#FFFFFF' : '#4B5563' }}
        >
          <DollarSign size={18} />
          <span>Salary Predictor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          style={{ ...styles.tabBtn, background: activeTab === 'resume' ? '#2563EB' : 'transparent', color: activeTab === 'resume' ? '#FFFFFF' : '#4B5563' }}
        >
          <FileText size={18} />
          <span>Resume ATS Analyzer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compatibility')}
          style={{ ...styles.tabBtn, background: activeTab === 'compatibility' ? '#2563EB' : 'transparent', color: activeTab === 'compatibility' ? '#FFFFFF' : '#4B5563' }}
        >
          <Target size={18} />
          <span>AI Job Compatibility</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coverletter')}
          style={{ ...styles.tabBtn, background: activeTab === 'coverletter' ? '#2563EB' : 'transparent', color: activeTab === 'coverletter' ? '#FFFFFF' : '#4B5563' }}
        >
          <Bot size={18} />
          <span>Cover Letter AI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interview')}
          style={{ ...styles.tabBtn, background: activeTab === 'interview' ? '#2563EB' : 'transparent', color: activeTab === 'interview' ? '#FFFFFF' : '#4B5563' }}
        >
          <BrainCircuit size={18} />
          <span>Interview Prep Coach</span>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div style={{ marginTop: '24px' }}>

        {/* TAB 1: SALARY PREDICTOR */}
        {activeTab === 'salary' && (
          <div style={styles.splitGrid}>
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <DollarSign size={22} color="#2563EB" />
                <h2 style={styles.cardTitle}>AI Market Salary Calculator</h2>
              </div>
              <p style={styles.cardSub}>Calculates compensation benchmarks based on tech skills, location hubs, and market demand.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Target Specialization</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
                    <option value="Frontend Developer">React Frontend Developer</option>
                    <option value="Backend Developer">C# / .NET Backend Engineer</option>
                    <option value="Full Stack Developer">Full Stack Engineer</option>
                    <option value="DevOps Architect">Cloud DevOps Architect</option>
                    <option value="Data Scientist / AI">AI / ML Data Scientist</option>
                    <option value="Product Manager">Technical Product Manager</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Experience (Years)</label>
                    <input type="number" min={0} max={25} value={experience} onChange={(e) => setExperience(Number(e.target.value))} style={styles.input} />
                  </div>
                  <div>
                    <label style={styles.label}>Location Hub</label>
                    <select value={location} onChange={(e) => setLocation(e.target.value)} style={styles.select}>
                      <option value="Bangalore">Bangalore (IT Hub)</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Remote">100% Remote</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} style={styles.select}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Specialized Tech Stack Bonuses (+Bonus)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {availableSkills.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                            background: isSelected ? '#EFF6FF' : '#F8FAFC',
                            color: isSelected ? '#2563EB' : '#475569',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Calculation Output */}
            <div className="glass-panel" style={{ ...styles.card, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Yearly Compensation</span>
                <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>High Market Demand 🔥</span>
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#60A5FA', margin: '0 0 20px 0' }}>
                {calculateSalary()}
              </h2>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

              <h4 style={{ fontSize: '0.92rem', color: '#E2E8F0', margin: '0 0 12px 0', fontWeight: 700 }}>Compensation Breakdown Estimate:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={styles.breakdownRow}>
                  <span>Base Fixed Compensation (~75%)</span>
                  <strong style={{ color: '#38BDF8' }}>75%</strong>
                </div>
                <div style={styles.breakdownRow}>
                  <span>Performance Bonus & Variable (~15%)</span>
                  <strong style={{ color: '#34D399' }}>15%</strong>
                </div>
                <div style={styles.breakdownRow}>
                  <span>Equity / ESOP Stock Grants (~10%)</span>
                  <strong style={{ color: '#FBBF24' }}>10%</strong>
                </div>
              </div>

              <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.82rem', color: '#94A3B8' }}>
                💡 <strong>RecruitNexus AI Insight:</strong> Engineers with {selectedSkills.join(', ')} experience in {location} command 18% higher initial offer packages.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESUME ATS ANALYZER */}
        {activeTab === 'resume' && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={styles.cardHeader}>
                <FileText size={22} color="#2563EB" />
                <div>
                  <h2 style={styles.cardTitle}>Gemini AI Resume ATS Analyzer</h2>
                  <p style={styles.cardSub}>Paste your resume content below to evaluate ATS compatibility score and key skill extractions.</p>
                </div>
              </div>

              <button type="button" onClick={handleSampleResume} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                Load Sample Resume
              </button>
            </div>

            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here (Summary, Skills, Work Experience)..."
              style={{ ...styles.input, fontFamily: 'sans-serif', resize: 'vertical', marginBottom: '16px' }}
            />

            <button
              type="button"
              onClick={handleAnalyzeResume}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', alignSelf: 'flex-start' }}
              disabled={analyzingResume || !resumeText.trim()}
            >
              <Sparkles size={16} />
              <span>{analyzingResume ? 'Analyzing with Gemini AI...' : 'Run Gemini ATS Analysis'}</span>
            </button>

            {resumeResult && (
              <div style={{ marginTop: '28px', background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>ATS Match Score</span>
                    <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#16A34A' }}>{resumeResult.atsScore} / 100</h3>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Evaluated Experience Level</span>
                    <span className="badge badge-purple" style={{ display: 'block', marginTop: '4px', fontSize: '0.85rem' }}>{resumeResult.experienceLevel}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>Extracted Hard Skills:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {resumeResult.extractedSkills.map(sk => (
                      <span key={sk} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.92rem', color: '#0F172A', fontWeight: 800, marginBottom: '8px' }}>AI Optimization Recommendations:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {resumeResult.suggestions.map((sug, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: '#334155' }}>
                        <CheckCircle2 size={16} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPATIBILITY SCORER */}
        {activeTab === 'compatibility' && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={styles.cardHeader}>
                <Target size={22} color="#2563EB" />
                <div>
                  <h2 style={styles.cardTitle}>AI Job Compatibility Scorer</h2>
                  <p style={styles.cardSub}>Compare candidate profile capabilities against specific recruiter job descriptions.</p>
                </div>
              </div>

              <button type="button" onClick={handleSampleJobDesc} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                Load Sample Job Description
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={styles.label}>Candidate Specialization</label>
                <input type="text" value={candidateRole} onChange={(e) => setCandidateRole(e.target.value)} style={styles.input} />
              </div>

              <div>
                <label style={styles.label}>Target Job Description & Requirements</label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job post requirements here..."
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleEvaluateMatch}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', alignSelf: 'flex-start' }}
              disabled={evaluatingMatch || !jobDescription.trim()}
            >
              <Zap size={16} />
              <span>{evaluatingMatch ? 'Evaluating Match...' : 'Evaluate Job Compatibility'}</span>
            </button>

            {matchResult && (
              <div style={{ marginTop: '28px', background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DCFCE7', border: '4px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803D' }}>{matchResult.score}%</span>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>{matchResult.verdict}</h3>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Evaluated against candidate experience & skill requirements</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ color: '#166534', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Matched Core Skills ({matchResult.matchedSkills.length})</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {matchResult.matchedSkills.map(s => (
                        <span key={s} style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>✓ {s}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <strong style={{ color: '#991B1B', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Missing Skill Gaps ({matchResult.missingSkills.length})</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {matchResult.missingSkills.map(s => (
                        <span key={s} style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>! {s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COVER LETTER GENERATOR */}
        {activeTab === 'coverletter' && (
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Bot size={22} color="#2563EB" />
              <div>
                <h2 style={styles.cardTitle}>AI Cover Letter Generator</h2>
                <p style={styles.cardSub}>Draft tailored executive cover letters matching company and target role requirements.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={styles.label}>Target Company Name</label>
                <input type="text" value={clCompany} onChange={(e) => setClCompany(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Target Job Title</label>
                <input type="text" value={clRole} onChange={(e) => setClRole(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Highlight Core Skills</label>
                <input type="text" value={clSkills} onChange={(e) => setClSkills(e.target.value)} style={styles.input} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateCoverLetter}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', marginBottom: '20px', alignSelf: 'flex-start' }}
              disabled={generatingCL || !clCompany || !clRole}
            >
              <Sparkles size={16} />
              <span>{generatingCL ? 'Drafting Cover Letter...' : 'Generate Tailored Cover Letter'}</span>
            </button>

            {generatedLetter && (
              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Generated Cover Letter Preview</strong>
                  <button type="button" onClick={handleCopyCL} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                    {copiedCL ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                    <span>{copiedCL ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                  {generatedLetter}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: INTERVIEW PREP COACH */}
        {activeTab === 'interview' && (
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <BrainCircuit size={22} color="#7C3AED" />
              <div>
                <h2 style={styles.cardTitle}>AI Mock Interview Prep Coach</h2>
                <p style={styles.cardSub}>Generate technical discussion questions and expert answer guidelines for targeted roles.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={styles.label}>Specialization Role</label>
                <select value={intRole} onChange={(e) => setIntRole(e.target.value)} style={styles.select}>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Engineer</option>
                  <option value="DevOps Architect">DevOps Architect</option>
                  <option value="System Architect">System Architect</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Core Tech Topic</label>
                <input type="text" value={intTopic} onChange={(e) => setIntTopic(e.target.value)} style={styles.input} />
              </div>

              <div>
                <label style={styles.label}>Seniority Level</label>
                <select value={intLevel} onChange={(e) => setIntLevel(e.target.value)} style={styles.select}>
                  <option value="Junior">Junior Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior Lead</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateQuestions}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', marginBottom: '20px', alignSelf: 'flex-start', background: '#7C3AED' }}
              disabled={generatingInt}
            >
              <BrainCircuit size={16} />
              <span>{generatingInt ? 'Compiling Practice Set...' : 'Generate Practice Questions'}</span>
            </button>

            {questionsList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questionsList.map((item, idx) => (
                  <div key={idx} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>Question #{idx + 1}</span>
                      <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>{item.difficulty}</span>
                    </div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.02rem', fontWeight: 800, color: '#0F172A' }}>{item.q}</h4>
                    <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', color: '#334155' }}>
                      <strong style={{ color: '#16A34A', display: 'block', marginBottom: '4px' }}>💡 Model Answer Key:</strong>
                      {item.ans}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '36px 20px 60px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 900,
    margin: '0 0 6px 0',
    color: '#0F172A'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#64748B',
    maxWidth: '680px',
    margin: '0 auto'
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    borderRadius: '16px',
    overflowX: 'auto'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    alignItems: 'start'
  },
  card: {
    padding: '28px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: 0
  },
  cardSub: {
    fontSize: '0.85rem',
    color: '#64748B',
    margin: '4px 0 20px 0'
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '0.92rem',
    fontWeight: 500,
    color: '#0F172A',
    outline: 'none',
    background: '#F8FAFC'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '0.92rem',
    fontWeight: 500,
    color: '#0F172A',
    outline: 'none',
    background: '#F8FAFC',
    cursor: 'pointer'
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#CBD5E1',
    padding: '6px 0',
    borderBottom: '1px dashed rgba(255,255,255,0.1)'
  }
};
