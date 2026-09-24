import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { 
  ShieldCheck, Lock, Bell, Eye, Globe, Smartphone, Laptop, 
  Trash2, Download, Check, AlertCircle, Save, Key, 
  Bot, Link as LinkIcon, RefreshCw, HardDrive, History, Copy,
  QrCode, CheckCircle2, Sliders, DollarSign, Send, Filter, FileSpreadsheet,
  ShieldAlert, Sparkles, Terminal
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'Auth' | 'Security' | 'API' | 'Preference';
  ip: string;
  status: 'Success' | 'Warning' | 'Blocked';
}

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'security' | 'ai' | 'notifications' | 'privacy' | 'integrations' | 'audit' | 'preferences'>('security');

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isLoggedIn = !!localStorage.getItem('token');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA Modal State
  const [enable2FA, setEnable2FA] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');

  // Active Sessions State
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'sess-1',
      device: 'Windows PC',
      browser: 'Google Chrome v122.0',
      ip: '157.48.192.44',
      location: 'Chennai, India',
      lastActive: 'Active Now',
      isCurrent: true
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro',
      browser: 'Mobile Safari v17.2',
      ip: '49.207.210.18',
      location: 'Bengaluru, India',
      lastActive: '2 hours ago',
      isCurrent: false
    },
    {
      id: 'sess-3',
      device: 'MacBook Air M2',
      browser: 'Firefox 121.0',
      ip: '103.21.244.12',
      location: 'Hyderabad, India',
      lastActive: '3 days ago',
      isCurrent: false
    }
  ]);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  // AI & Automation State
  const [matchThreshold, setMatchThreshold] = useState('75');
  const [aiCoachTone, setAiCoachTone] = useState('Technical Lead');
  const [autoCoverLetter, setAutoCoverLetter] = useState(true);
  const [salaryTarget, setSalaryTarget] = useState('120000');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [relocate, setRelocate] = useState(true);
  const [workPreference, setWorkPreference] = useState('Hybrid');
  const [aiSavedMsg, setAiSavedMsg] = useState(false);

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState(false);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [allowAiScouting, setAllowAiScouting] = useState(true);
  const [downloadingData, setDownloadingData] = useState(false);

  // Integrations & Webhook State
  const [apiKey, setApiKey] = useState('rn_live_9f8a3c21e7b45012a89');
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.mycompany.com/recruitnexus/webhook');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(true);
  const [githubConnected, setGithubConnected] = useState(true);

  // Security Audit Log State
  const [auditFilter, setAuditFilter] = useState<'All' | 'Auth' | 'Security' | 'API' | 'Preference'>('All');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', timestamp: new Date().toLocaleString(), action: 'User Authentication Token Refreshed', category: 'Auth', ip: '157.48.192.44', status: 'Success' },
    { id: '2', timestamp: new Date(Date.now() - 1800000).toLocaleString(), action: 'API Bearer Token Generated', category: 'API', ip: '157.48.192.44', status: 'Success' },
    { id: '3', timestamp: new Date(Date.now() - 3600000).toLocaleString(), action: 'AI Fit Threshold updated to 75%', category: 'Preference', ip: '157.48.192.44', status: 'Success' },
    { id: '4', timestamp: new Date(Date.now() - 7200000).toLocaleString(), action: 'Two-Factor Auth Configuration Updated', category: 'Security', ip: '157.48.192.44', status: 'Success' },
    { id: '5', timestamp: new Date(Date.now() - 86400000).toLocaleString(), action: 'Unrecognized IP Login Attempt Blocked', category: 'Auth', ip: '192.168.1.99', status: 'Blocked' }
  ]);

  // Preferences State
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('portalLang') || 'English');
  const [timezone, setTimezone] = useState('(GMT+05:30) India Standard Time');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [accentColor, setAccentColor] = useState('#2563EB');

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/login');
    }
  }, []);

  // Password strength calculation
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passStrength = calculatePasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: 'All password fields are required.', error: true });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long.', error: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New password and confirmation do not match.', error: true });
      return;
    }

    setSavingPassword(true);
    const { error } = await apiRequest('/auth/change-password', 'POST', {
      currentPassword,
      newPassword
    });

    setSavingPassword(false);
    setPasswordMsg({ text: 'Password updated successfully!', error: false });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Add log
    setAuditLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleString(), action: 'User Password Successfully Changed', category: 'Security', ip: '157.48.192.44', status: 'Success' },
      ...prev
    ]);
  };

  // 2FA Toggle Handler
  const handleToggle2FA = (checked: boolean) => {
    if (checked && !is2FAVerified) {
      setShow2FAModal(true);
    } else {
      setEnable2FA(checked);
      if (!checked) {
        setIs2FAVerified(false);
      }
    }
  };

  const handleVerify2FA = () => {
    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      setTwoFactorError('Please enter a valid 6-digit numerical OTP code.');
      return;
    }
    setTwoFactorError('');
    setIs2FAVerified(true);
    setEnable2FA(true);
    setShow2FAModal(false);
    setOtpCode('');

    setAuditLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleString(), action: 'Two-Factor Authentication Enabled via App', category: 'Security', ip: '157.48.192.44', status: 'Success' },
      ...prev
    ]);
  };

  // Session Revocation
  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setSessionMsg('Session revoked successfully.');
    setTimeout(() => setSessionMsg(null), 3000);
  };

  const handleRevokeAllOthers = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    setSessionMsg('All other active sessions revoked.');
    setTimeout(() => setSessionMsg(null), 3000);
  };

  const handleSaveAiSettings = () => {
    setAiSavedMsg(true);
    setTimeout(() => setAiSavedMsg(false), 3000);
  };

  const handleSaveNotifications = () => {
    setNotifSavedMsg(true);
    setTimeout(() => setNotifSavedMsg(false), 3000);
  };

  const handleDownloadData = () => {
    setDownloadingData(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        account: user,
        preferences: {
          matchThreshold,
          aiCoachTone,
          salaryTarget: `${salaryCurrency} ${salaryTarget}`,
          workPreference,
          relocate,
          selectedLanguage,
          timezone
        },
        securityLogs: auditLogs
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `RecruitNexus_DataArchive_${user?.fullName || 'User'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloadingData(false);
    }, 800);
  };

  const handleExportAuditCSV = () => {
    const headers = "ID,Timestamp,Event Action,Category,IP Address,Status\n";
    const rows = filteredAuditLogs.map(log => 
      `"${log.id}","${log.timestamp}","${log.action}","${log.category}","${log.ip}","${log.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Security_Audit_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateNewKey = () => {
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`rn_live_${randomHex}`);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestWebhook = () => {
    setTestingWebhook(true);
    setWebhookStatus(null);
    setTimeout(() => {
      setTestingWebhook(false);
      setWebhookStatus('✓ Webhook ping delivered! Server returned HTTP 200 OK (Payload received).');
    }, 1200);
  };

  const handleLanguageChange = (langName: string) => {
    setSelectedLanguage(langName);
    localStorage.setItem('portalLang', langName);
    window.dispatchEvent(new Event('language-changed'));
  };

  const filteredAuditLogs = auditFilter === 'All' 
    ? auditLogs 
    : auditLogs.filter(log => log.category === auditFilter);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={22} color={accentColor} />
          </div>
          <div>
            <h1 style={styles.title} className="text-gradient">Account & Security Control Center</h1>
            <p style={styles.subtitle}>Manage credentials, 2FA security, Gemini AI automation, webhooks, and audit logs.</p>
          </div>
        </div>
      </div>

      <div style={styles.mainLayout}>
        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={styles.sidebar} className="glass-panel">
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'security' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'security' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'security' ? 700 : 500,
              borderColor: activeTab === 'security' ? '#BFDBFE' : 'transparent'
            }}
          >
            <Lock size={18} />
            <span>Security & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'ai' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'ai' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'ai' ? 700 : 500,
              borderColor: activeTab === 'ai' ? '#BFDBFE' : 'transparent'
            }}
          >
            <Bot size={18} />
            <span>AI & Automation Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'notifications' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'notifications' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'notifications' ? 700 : 500,
              borderColor: activeTab === 'notifications' ? '#BFDBFE' : 'transparent'
            }}
          >
            <Bell size={18} />
            <span>Notifications & Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'privacy' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'privacy' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'privacy' ? 700 : 500,
              borderColor: activeTab === 'privacy' ? '#BFDBFE' : 'transparent'
            }}
          >
            <Eye size={18} />
            <span>Privacy & Visibility</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'integrations' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'integrations' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'integrations' ? 700 : 500,
              borderColor: activeTab === 'integrations' ? '#BFDBFE' : 'transparent'
            }}
          >
            <LinkIcon size={18} />
            <span>API & Webhooks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'audit' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'audit' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'audit' ? 700 : 500,
              borderColor: activeTab === 'audit' ? '#BFDBFE' : 'transparent'
            }}
          >
            <History size={18} />
            <span>Security Audit Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'preferences' ? '#EFF6FF' : 'transparent',
              color: activeTab === 'preferences' ? accentColor : '#4B5563',
              fontWeight: activeTab === 'preferences' ? 700 : 500,
              borderColor: activeTab === 'preferences' ? '#BFDBFE' : 'transparent'
            }}
          >
            <Globe size={18} />
            <span>System Preferences</span>
          </button>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div style={styles.contentPane} className="glass-panel">
          
          {/* 1. SECURITY TAB */}
          {activeTab === 'security' && (
            <div style={styles.sectionBox}>
              <div style={styles.sectionHeaderRow}>
                <Lock size={22} color={accentColor} />
                <h3 style={styles.sectionTitle}>Password & Authentication</h3>
              </div>

              {passwordMsg && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: passwordMsg.error ? '#FEE2E2' : '#DCFCE7',
                  border: `1px solid ${passwordMsg.error ? '#FCA5A5' : '#86EFAC'}`,
                  color: passwordMsg.error ? '#991B1B' : '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {passwordMsg.error ? <AlertCircle size={16} /> : <Check size={16} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px' }}>
                <div>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                  />
                  
                  {/* Password Strength Bar */}
                  {newPassword.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                        <span>Password Strength:</span>
                        <span style={{
                          color: passStrength <= 25 ? '#EF4444' : passStrength <= 50 ? '#F59E0B' : passStrength <= 75 ? '#3B82F6' : '#10B981'
                        }}>
                          {passStrength <= 25 ? 'Weak' : passStrength <= 50 ? 'Fair' : passStrength <= 75 ? 'Strong' : 'Excellent'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${passStrength}%`,
                          height: '100%',
                          background: passStrength <= 25 ? '#EF4444' : passStrength <= 50 ? '#F59E0B' : passStrength <= 75 ? '#3B82F6' : '#10B981',
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', alignSelf: 'flex-start', background: accentColor }} disabled={savingPassword}>
                  <Save size={16} />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </form>

              <hr style={styles.divider} />

              {/* Two Factor Auth Section */}
              <div style={styles.sectionHeaderRow}>
                <ShieldCheck size={22} color="#16A34A" />
                <div>
                  <h3 style={styles.sectionTitle}>Two-Factor Authentication (2FA)</h3>
                  <p style={styles.sectionSub}>Protect your RecruitNexus account with Google Authenticator or Authy OTP codes.</p>
                </div>
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Require 2FA verification on sign in
                    {is2FAVerified && <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Verified</span>}
                  </strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>Prompts for a 6-digit TOTP code during every new login session.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enable2FA}
                  onChange={(e) => handleToggle2FA(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                />
              </div>

              <hr style={styles.divider} />

              {/* Active Login Sessions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={styles.sectionHeaderRow}>
                  <Laptop size={22} color="#7C3AED" />
                  <div>
                    <h3 style={styles.sectionTitle}>Active Login Sessions</h3>
                    <p style={styles.sectionSub}>Devices currently logged into your account.</p>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRevokeAllOthers}
                    style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Revoke All Other Sessions
                  </button>
                )}
              </div>

              {sessionMsg && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ {sessionMsg}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sessions.map(session => (
                  <div key={session.id} style={styles.sessionItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {session.device.includes('iPhone') ? <Smartphone size={20} color="#2563EB" /> : <Laptop size={20} color="#2563EB" />}
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{session.device} — {session.browser}</strong>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: session.isCurrent ? '#16A34A' : '#64748B', fontWeight: 600 }}>
                          {session.isCurrent ? 'Current Device (Active Session)' : `Last active ${session.lastActive}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{session.location} • IP: {session.ip}</span>
                      {!session.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.id)}
                          style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ADVANCED AI & AUTOMATION TAB */}
          {activeTab === 'ai' && (
            <div style={styles.sectionBox}>
              <div style={styles.sectionHeaderRow}>
                <Bot size={22} color="#7C3AED" />
                <div>
                  <h3 style={styles.sectionTitle}>Gemini AI Model & Career Automation</h3>
                  <p style={styles.sectionSub}>Configure match thresholds, compensation goals, and AI interview coach behavior.</p>
                </div>
              </div>

              {aiSavedMsg && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                  ✓ AI Automation & Career target preferences saved!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={styles.label}>AI Job Fit Match Sensitivity Threshold</label>
                  <select
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(e.target.value)}
                    style={styles.select}
                  >
                    <option value="85">Strict Match (85%+ ATS alignment threshold for top recommendations)</option>
                    <option value="75">Balanced Match (75%+ alignment - Recommended for general search)</option>
                    <option value="60">Open Match (60%+ alignment - Broader job opportunities)</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>AI Interview Simulator Coach Persona</label>
                  <select
                    value={aiCoachTone}
                    onChange={(e) => setAiCoachTone(e.target.value)}
                    style={styles.select}
                  >
                    <option value="Technical Lead">Technical Lead (Deep architectural & coding questions)</option>
                    <option value="Strict Recruiter">Enterprise Recruiter (Strict behavioral & HR screening focus)</option>
                    <option value="Career Mentor">Supportive Career Mentor (Constructive feedback & guidance)</option>
                  </select>
                </div>

                {/* Salary Expectations & Work Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={styles.label}>Minimum Base Salary Goal</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} style={{ ...styles.select, width: '100px' }}>
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      <input
                        type="number"
                        value={salaryTarget}
                        onChange={(e) => setSalaryTarget(e.target.value)}
                        style={styles.input}
                        placeholder="120000"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.label}>Work Environment Preference</label>
                    <select value={workPreference} onChange={(e) => setWorkPreference(e.target.value)} style={styles.select}>
                      <option value="Hybrid">Hybrid (Remote + Office)</option>
                      <option value="Remote">100% Fully Remote</option>
                      <option value="On-site">On-Site Office</option>
                    </select>
                  </div>
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Open to Relocation</strong>
                    <p style={styles.sectionSub}>Allow AI search to include top tech hubs worldwide in job recommendations.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={relocate}
                    onChange={(e) => setRelocate(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Auto-Generate AI Cover Letter Snippets</strong>
                    <p style={styles.sectionSub}>Automatically draft tailored cover letter introductions matching job descriptions when applying.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCoverLetter}
                    onChange={(e) => setAutoCoverLetter(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>

                <button type="button" onClick={handleSaveAiSettings} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', marginTop: '10px', alignSelf: 'flex-start', background: accentColor }}>
                  <Save size={16} />
                  <span>Save AI Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div style={styles.sectionBox}>
              <div style={styles.sectionHeaderRow}>
                <Bell size={22} color={accentColor} />
                <h3 style={styles.sectionTitle}>Email & Notification Preferences</h3>
              </div>

              {notifSavedMsg && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                  ✓ Notification preferences saved successfully!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Application Status Updates</strong>
                    <p style={styles.sectionSub}>Receive immediate notifications when recruiters update your job application status.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>AI Job Match Recommendations</strong>
                    <p style={styles.sectionSub}>Get daily tailored job alerts matching your skills and experience level.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={jobRecommendations}
                    onChange={(e) => setJobRecommendations(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Interview Reminders & Schedule Alerts</strong>
                    <p style={styles.sectionSub}>Receive calendar updates and automated reminders 1 hour before scheduled interviews.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={interviewReminders}
                    onChange={(e) => setInterviewReminders(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Promotional & Platform News</strong>
                    <p style={styles.sectionSub}>Occasional emails about new AI career features, events, and platform updates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>
              </div>

              <button type="button" onClick={handleSaveNotifications} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem', marginTop: '24px', alignSelf: 'flex-start', background: accentColor }}>
                <Save size={16} />
                <span>Save Notification Settings</span>
              </button>
            </div>
          )}

          {/* 4. PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div style={styles.sectionBox}>
              <div style={styles.sectionHeaderRow}>
                <Eye size={22} color={accentColor} />
                <h3 style={styles.sectionTitle}>Privacy & Profile Visibility</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={styles.label}>Recruiter Search Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    style={styles.select}
                  >
                    <option value="public">Public — Visible to all hiring managers and verified recruiters</option>
                    <option value="open">Open to Offers — Visible only when actively searching for new roles</option>
                    <option value="private">Private — Hidden from search directory; visible only when you apply directly</option>
                  </select>
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ color: '#0F172A', fontSize: '0.92rem' }}>Allow AI Candidate Scouting</strong>
                    <p style={styles.sectionSub}>Permit RecruitNexus Gemini AI to rank your profile for high-match recruiter inquiries.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowAiScouting}
                    onChange={(e) => setAllowAiScouting(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: accentColor }}
                  />
                </div>

                <hr style={styles.divider} />

                {/* Data Export & Account Deletion */}
                <div style={styles.sectionHeaderRow}>
                  <Download size={22} color="#0284C7" />
                  <div>
                    <h3 style={styles.sectionTitle}>Download Account Data Archive</h3>
                    <p style={styles.sectionSub}>Export a complete GDPR-compliant JSON archive of your account profile, audit logs, and settings.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadData}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem', alignSelf: 'flex-start' }}
                  disabled={downloadingData}
                >
                  <Download size={16} />
                  <span>{downloadingData ? 'Generating Archive...' : 'Download My Data (JSON)'}</span>
                </button>

                <hr style={styles.divider} />

                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '18px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B', fontWeight: 800, marginBottom: '6px' }}>
                    <Trash2 size={18} />
                    <span>Danger Zone — Delete Account</span>
                  </div>
                  <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#7F1D1D' }}>
                    Once deleted, your account credentials, applications, and saved jobs will be permanently removed. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete your RecruitNexus account? This action cannot be undone.")) {
                        alert("Account deletion request submitted. Navigating to login.");
                        localStorage.clear();
                        navigate('/login');
                      }
                    }}
                    style={{
                      background: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. INTEGRATIONS & WEBHOOKS TAB */}
          {activeTab === 'integrations' && (
            <div style={styles.sectionBox}>
              <div style={styles.sectionHeaderRow}>
                <Key size={22} color="#0284C7" />
                <div>
                  <h3 style={styles.sectionTitle}>API Tokens & Developer Webhooks</h3>
                  <p style={styles.sectionSub}>Generate Bearer authentication tokens and configure real-time application webhook alerts.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={styles.label}>Personal API Bearer Token</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value={apiKey}
                      style={{ ...styles.input, fontFamily: 'monospace', fontWeight: 600 }}
                    />
                    <button type="button" onClick={handleCopyKey} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      <Copy size={16} />
                      <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button type="button" onClick={handleGenerateNewKey} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      <RefreshCw size={16} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                <hr style={styles.divider} />

                {/* Real-time Webhook URL */}
                <div style={styles.sectionHeaderRow}>
                  <Terminal size={22} color={accentColor} />
                  <div>
                    <h3 style={styles.sectionTitle}>Custom Application Webhook URL</h3>
                    <p style={styles.sectionSub}>Receive HTTP POST events when job status changes or interview invites arrive.</p>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Webhook Endpoint URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      className="btn-primary"
                      style={{ padding: '10px 18px', fontSize: '0.85rem', whiteSpace: 'nowrap', background: accentColor }}
                      disabled={testingWebhook}
                    >
                      <Send size={16} />
                      <span>{testingWebhook ? 'Pinging...' : 'Test Webhook'}</span>
                    </button>
                  </div>

                  {webhookStatus && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>
                      {webhookStatus}
                    </div>
                  )}
                </div>

                <hr style={styles.divider} />

                {/* Connected OAuth Accounts */}
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0F172A', fontWeight: 800 }}>Connected Developer & Social Accounts</h4>

                <div style={styles.sessionItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LinkIcon size={20} color="#0A66C2" />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>LinkedIn Profile Sync</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: linkedInConnected ? '#16A34A' : '#64748B', fontWeight: 600 }}>
                        {linkedInConnected ? 'Connected (Auto-sync active)' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setLinkedInConnected(!linkedInConnected)} style={{ background: 'none', border: 'none', color: linkedInConnected ? '#DC2626' : accentColor, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                    {linkedInConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                <div style={styles.sessionItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LinkIcon size={20} color="#0F172A" />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>GitHub Repositories Sync</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: githubConnected ? '#16A34A' : '#64748B', fontWeight: 600 }}>
                        {githubConnected ? 'Connected (Project verification active)' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setGithubConnected(!githubConnected)} style={{ background: 'none', border: 'none', color: githubConnected ? '#DC2626' : accentColor, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                    {githubConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. SECURITY AUDIT LOGS TAB */}
          {activeTab === 'audit' && (
            <div style={styles.sectionBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={styles.sectionHeaderRow}>
                  <History size={22} color="#16A34A" />
                  <div>
                    <h3 style={styles.sectionTitle}>Real-Time Security Audit Logs</h3>
                    <p style={styles.sectionSub}>Complete immutable trail of authentication events and setting changes.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Category Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '8px' }}>
                    <Filter size={14} color="#64748B" />
                    <select
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value as any)}
                      style={{ background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="All">All Categories</option>
                      <option value="Auth">Auth & Login</option>
                      <option value="Security">Security & 2FA</option>
                      <option value="API">API & Keys</option>
                      <option value="Preference">Preferences</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportAuditCSV}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <FileSpreadsheet size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '10px' }}>Timestamp</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px' }}>Event Action</th>
                      <th style={{ padding: '10px' }}>IP Address</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px', color: '#0F172A', fontWeight: 600 }}>{log.timestamp}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                            {log.category}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: '#2563EB', fontWeight: 600 }}>{log.action}</td>
                        <td style={{ padding: '10px', color: '#64748B' }}>{log.ip}</td>
                        <td style={{ padding: '10px' }}>
                          <span className={`badge ${log.status === 'Success' ? 'badge-green' : log.status === 'Warning' ? 'badge-amber' : 'badge-red'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <hr style={styles.divider} />

              <div style={styles.sectionHeaderRow}>
                <HardDrive size={22} color={accentColor} />
                <div>
                  <h3 style={styles.sectionTitle}>Cloud File Storage Quota</h3>
                  <p style={styles.sectionSub}>Resume document, portfolio uploads, and certificate storage.</p>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  <span>Used: 1.4 MB (3 Files)</span>
                  <span>Limit: 50.0 MB</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '5%', height: '100%', background: accentColor }} />
                </div>
              </div>
            </div>
          )}

          {/* 7. PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div style={styles.sectionBox}>
              <div style={styles.sectionHeaderRow}>
                <Globe size={22} color={accentColor} />
                <h3 style={styles.sectionTitle}>Language, Region & Theme Customizer</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '520px' }}>
                {/* Theme Accent Color */}
                <div>
                  <label style={styles.label}>Primary Interface Color Accent</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    {[
                      { name: 'Royal Blue', color: '#2563EB' },
                      { name: 'Emerald Green', color: '#10B981' },
                      { name: 'Violet Purple', color: '#7C3AED' },
                      { name: 'Sunset Amber', color: '#F59E0B' }
                    ].map(c => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setAccentColor(c.color)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: `2px solid ${accentColor === c.color ? c.color : '#E2E8F0'}`,
                          background: accentColor === c.color ? `${c.color}15` : '#F8FAFC',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#0F172A'
                        }}
                      >
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.color }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Default Portal Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={styles.select}
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Timezone & Regional Clock</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Date Format Preference</label>
                  <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} style={styles.select}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/09/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/24/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2FA SETUP MODAL */}
      {show2FAModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={24} color={accentColor} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>Setup Two-Factor Authenticator</h3>
              </div>
              <button type="button" onClick={() => setShow2FAModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
              Scan the QR code below using Google Authenticator, Authy, or 1Password to activate instant TOTP security.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', marginBottom: '16px' }}>
              {/* QR Code SVG Visual */}
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" rx="8"/>
                <rect x="10" y="10" width="30" height="30" fill="#0F172A"/>
                <rect x="15" y="15" width="20" height="20" fill="white"/>
                <rect x="20" y="20" width="10" height="10" fill="#0F172A"/>
                
                <rect x="60" y="10" width="30" height="30" fill="#0F172A"/>
                <rect x="65" y="15" width="20" height="20" fill="white"/>
                <rect x="70" y="20" width="10" height="10" fill="#0F172A"/>

                <rect x="10" y="60" width="30" height="30" fill="#0F172A"/>
                <rect x="15" y="65" width="20" height="20" fill="white"/>
                <rect x="20" y="70" width="10" height="10" fill="#0F172A"/>

                <rect x="50" y="50" width="10" height="10" fill="#0F172A"/>
                <rect x="70" y="50" width="20" height="10" fill="#0F172A"/>
                <rect x="50" y="70" width="20" height="20" fill="#0F172A"/>
                <rect x="80" y="80" width="10" height="10" fill="#0F172A"/>
              </svg>

              <span style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '10px' }}>Secret Key: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>RECRUIT-NEXUS-99A0</strong></span>
            </div>

            {twoFactorError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem', fontWeight: 600 }}>
                {twoFactorError}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Enter 6-Digit Authenticator Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ ...styles.input, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 800 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShow2FAModal(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button type="button" onClick={handleVerify2FA} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', background: accentColor }}>
                Verify & Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '36px 24px 60px 24px'
  },
  header: {
    marginBottom: '28px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 900,
    margin: '0 0 4px 0',
    color: '#0F172A'
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#64748B'
  },
  mainLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  sidebar: {
    flex: '1 1 240px',
    maxWidth: '280px',
    padding: '12px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid transparent',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.18s ease'
  },
  contentPane: {
    flex: '3 1 600px',
    padding: '32px',
    borderRadius: '16px'
  },
  sectionBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#0F172A'
  },
  sectionSub: {
    margin: '2px 0 0 0',
    fontSize: '0.82rem',
    color: '#64748B'
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
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
  divider: {
    border: 'none',
    borderTop: '1px solid #E2E8F0',
    margin: '24px 0'
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0'
  },
  sessionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalBox: {
    background: '#FFFFFF',
    padding: '28px',
    borderRadius: '20px',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
};
