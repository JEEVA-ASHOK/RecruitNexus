import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { Plus, Briefcase, FileText, Calendar, Send, ShieldAlert, CheckCircle2, User, Award, Clock, X, Eye, BarChart3, Users, TrendingUp } from 'lucide-react';
import { Translate } from '../components/Translate';
import { t } from '../i18n';
import { useLanguage } from '../context/LanguageContext';
import { DashboardCard } from '../components/DashboardCard';
import { Pagination } from '../components/Pagination';

interface Job {
  id: number;
  recruiterId: number;
  title: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  applicationCount: number;
}

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobCompany?: string;
  candidateId: number;
  candidateName: string;
  coverLetter: string;
  resumePath: string;
  matchingScore: number;
  ai_Questions?: string;
  ai_Feedback?: string;
  recruiterNotes?: string;
  status: string;
  appliedAt: string;
  offerLetterContent?: string;
  offerStatus?: string;
}

interface Interview {
  id: number;
  applicationId: number;
  candidateName: string;
  jobTitle: string;
  interviewDate: string;
  status: string;
  meetingLink?: string;
  notes?: string;
  format?: string;
  ai_Questions?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  companyName?: string;
  officeAddress?: string;
  venue?: string;
  reportingTime?: string;
  dressCode?: string;
  requiredDocuments?: string;
  candidateConfirmation?: string;
  resultStatus?: string;
  feedback?: string;
  remarks?: string;
}

export const RecruiterDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState<'analytics' | 'jobs' | 'applications' | 'interviews' | 'admin' | 'calendar' | 'company'>('analytics');
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchRecruiterAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    const { data, error } = await apiRequest<any>('/analytics/recruiter-dashboard');
    setLoadingAnalytics(false);
    if (!error && data) {
      setAnalyticsData(data);
    }
  }, []);

  useEffect(() => {
    fetchRecruiterAnalytics();
  }, [fetchRecruiterAnalytics]);

  // Pagination State
  const [jobsPage, setJobsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const pageSize = 5;
  
  // Job Post Form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [reqs, setReqs] = useState('');
  const [loc, setLoc] = useState('');
  const [type, setType] = useState('FullTime');
  const [salary, setSalary] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewingCalendarInt, setViewingCalendarInt] = useState<Interview | null>(null);
  
  // Smart Interview Calendar Filter & View State
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [calStatusFilter, setCalStatusFilter] = useState('All');
  const [calTypeFilter, setCalTypeFilter] = useState('All');
  const [calModeFilter, setCalModeFilter] = useState('All');
  const [calSearchQuery, setCalSearchQuery] = useState('');
  const [selectedCalDate, setSelectedCalDate] = useState<Date>(new Date());
  
  // Interview Schedule Form Modal
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [intDate, setIntDate] = useState('');
  const [intFormat, setIntFormat] = useState('Online');
  const [intLink, setIntLink] = useState('');
  const [intNotes, setIntNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // New Interview Fields State
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPhone, setHrPhone] = useState('');
  const [intCompanyName, setIntCompanyName] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [venue, setVenue] = useState('');
  const [reportingTime, setReportingTime] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');

  // AI Questions Modal View
  const [viewingQuestionsInt, setViewingQuestionsInt] = useState<Interview | null>(null);

  const [companyProfile, setCompanyProfile] = useState<any | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyLogo, setEditCompanyLogo] = useState('');
  const [editCompanyIndustry, setEditCompanyIndustry] = useState('');
  const [editCompanyWebsite, setEditCompanyWebsite] = useState('');
  const [editCompanyLocation, setEditCompanyLocation] = useState('');
  const [editCompanyAbout, setEditCompanyAbout] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  // Resume Preview state
  const [previewingResume, setPreviewingResume] = useState<string | null>(null);

  // Offer Letter Generation state
  const [generatingOfferApp, setGeneratingOfferApp] = useState<any | null>(null);
  const [offerContent, setOfferContent] = useState('');

  // AI Interview Questions Generator Modal state
  const [aiGenAppModal, setAiGenAppModal] = useState<Application | null>(null);
  const [aiGenQuestionsResult, setAiGenQuestionsResult] = useState<any | null>(null);
  const [loadingAiGenQuestions, setLoadingAiGenQuestions] = useState(false);
  const [savingQuestionsNotice, setSavingQuestionsNotice] = useState(false);

  // AI Hiring Decision Assistant Modal state
  const [aiHiringDecisionModalApp, setAiHiringDecisionModalApp] = useState<Application | null>(null);
  const [aiHiringDecisionResult, setAiHiringDecisionResult] = useState<any | null>(null);
  const [loadingAiHiringDecision, setLoadingAiHiringDecision] = useState(false);
  const [savingDecisionNotice, setSavingDecisionNotice] = useState(false);

  // ATS Analysis Modal state
  const [atsModalApp, setAtsModalApp] = useState<Application | null>(null);
  const [atsAnalysisData, setAtsAnalysisData] = useState<any | null>(null);
  const [loadingAtsModal, setLoadingAtsModal] = useState(false);

  const handleViewAtsAnalysis = async (app: Application) => {
    setAtsModalApp(app);
    setAtsAnalysisData(null);
    setLoadingAtsModal(true);

    const { data, error } = await apiRequest<any>(`/applications/${app.id}/ats-analysis`, 'POST');
    setLoadingAtsModal(false);
    if (!error && data) {
      setAtsAnalysisData(data);
    }
  };

  const handleGenerateHiringDecision = async (app: Application) => {
    setAiHiringDecisionModalApp(app);
    setAiHiringDecisionResult(null);
    setLoadingAiHiringDecision(true);
    setSavingDecisionNotice(false);

    const { data, error } = await apiRequest<any>('/ai/hiring-decision', 'POST', {
      applicationId: app.id
    });

    setLoadingAiHiringDecision(false);
    if (!error && data) {
      setAiHiringDecisionResult(data);
    }
  };

  // AI Candidate Ranking Filter States
  const [rankingStatusFilter, setRankingStatusFilter] = useState<string>('All');
  const [rankingRecommendationFilter, setRankingRecommendationFilter] = useState<string>('All');
  const [rankingJobFilter, setRankingJobFilter] = useState<string>('All');

  const getRecommendationBadge = (score: number) => {
    if (score >= 95) return { label: '⭐ Highly Recommended', badgeClass: 'badge-green', color: '#10b981' };
    if (score >= 85) return { label: '👍 Recommended', badgeClass: 'badge-purple', color: '#8b5cf6' };
    if (score >= 70) return { label: '💡 Consider', badgeClass: 'badge-orange', color: '#f59e0b' };
    return { label: '⚠️ Not Recommended', badgeClass: 'badge-red', color: '#ef4444' };
  };

  const getStatusPriority = (status: string) => {
    if (status === 'Offered' || status === 'Interviewing') return 4;
    if (status === 'Reviewing') return 3;
    if (status === 'Applied') return 2;
    return 1; // Rejected / others
  };

  const getRankedApplications = () => {
    let list = [...applications];

    if (rankingStatusFilter !== 'All') {
      list = list.filter(a => a.status === rankingStatusFilter);
    }
    if (rankingJobFilter !== 'All') {
      list = list.filter(a => a.jobTitle === rankingJobFilter);
    }
    if (rankingRecommendationFilter !== 'All') {
      if (rankingRecommendationFilter === 'HighlyRecommended') list = list.filter(a => a.matchingScore >= 95);
      else if (rankingRecommendationFilter === 'Recommended') list = list.filter(a => a.matchingScore >= 85 && a.matchingScore < 95);
      else if (rankingRecommendationFilter === 'Consider') list = list.filter(a => a.matchingScore >= 70 && a.matchingScore < 85);
      else if (rankingRecommendationFilter === 'NotRecommended') list = list.filter(a => a.matchingScore < 70);
    }

    list.sort((a, b) => {
      if (b.matchingScore !== a.matchingScore) {
        return b.matchingScore - a.matchingScore;
      }
      const statusDiff = getStatusPriority(b.status) - getStatusPriority(a.status);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

    return list;
  };

  const handleGenerateAiQuestions = async (app: Application) => {
    setAiGenAppModal(app);
    setAiGenQuestionsResult(null);
    setLoadingAiGenQuestions(true);
    setSavingQuestionsNotice(false);

    const { data, error } = await apiRequest<any>('/ai/generate-questions', 'POST', {
      applicationId: app.id
    });

    setLoadingAiGenQuestions(false);
    if (!error && data) {
      setAiGenQuestionsResult(data);
    }
  };

  const [loadingAiOffer, setLoadingAiOffer] = useState(false);
  const [offerMode, setOfferMode] = useState<'edit' | 'preview'>('edit');
  const [approvalState, setApprovalState] = useState<string>('Draft');

  const handleOpenOfferGenerator = (app: any) => {
    setGeneratingOfferApp(app);
    setOfferMode('edit');
    setApprovalState(app.offerStatus === 'Pending' ? 'Sent' : 'Draft');
    const today = new Date().toLocaleDateString();
    const defaultTemplate = `Date: ${today}\nTo: ${app.candidateName}\n\nDear ${app.candidateName},\n\nWe are pleased to offer you the position of "${app.jobTitle}" at our organization.\n\nKey terms:\n- Compensation: Competitive Salary\n- Location: Remote / Office\n- Start Date: Standard 2-week notice period\n\nPlease review the terms and respond (Accept/Reject) directly via your dashboard portal.\n\nSincerely,\nHiring Team`;
    setOfferContent(app.offerLetterContent || defaultTemplate);
  };

  const handleGenerateAiOffer = async (forceOverwrite = false) => {
    if (!generatingOfferApp) return;

    if (offerContent && offerContent.trim().length > 30 && !forceOverwrite) {
      if (!window.confirm("An offer letter draft already exists. Do you want to generate a new AI version?")) {
        return;
      }
    }

    setLoadingAiOffer(true);
    const { data, error } = await apiRequest<any>('/ai/generate-offer-letter', 'POST', {
      applicationId: generatingOfferApp.id
    });
    setLoadingAiOffer(false);

    if (!error && data?.offerLetterContent) {
      setOfferContent(data.offerLetterContent);
      setApprovalState('Draft');
    }
  };

  const handleSaveOfferLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatingOfferApp) return;
    
    const { error } = await apiRequest(`/applications/${generatingOfferApp.id}/offer`, 'PUT', {
      offerLetterContent: offerContent
    });
    
    if (!error) {
      alert("Offer letter sent to candidate successfully!");
      setGeneratingOfferApp(null);
      loadData();
    } else {
      alert(error);
    }
  };

  const handleDownloadOfferPdf = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert("Please allow popups to print/download offer letter.");
      return;
    }
    printWin.document.write(`
      <html>
        <head>
          <title>Job Offer Letter - ${generatingOfferApp?.candidateName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            pre { font-family: inherit; white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECRUITNEXUS OFFICIAL JOB OFFER LETTER</h2>
          </div>
          <pre>${offerContent}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Onboarding State
  const [onboardingModalApp, setOnboardingModalApp] = useState<any>(null);
  const [onboardingResult, setOnboardingResult] = useState<any>(null);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [savingOnboardingNotice, setSavingOnboardingNotice] = useState(false);

  const handleGenerateOnboarding = async (app: any) => {
    setOnboardingModalApp(app);
    setLoadingOnboarding(true);
    setSavingOnboardingNotice(false);

    const { data, error } = await apiRequest<any>('/ai/generate-onboarding', 'POST', {
      applicationId: app.id
    });

    setLoadingOnboarding(false);
    if (!error && data) {
      setOnboardingResult(data);
    }
  };

  // Completing Interview State
  const [completingInterview, setCompletingInterview] = useState<Interview | null>(null);
  const [resultStatus, setResultStatus] = useState('Selected');
  const [feedback, setFeedback] = useState('');
  const [remarks, setRemarks] = useState('');
  const [completing, setCompleting] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ text: string; error: boolean } | null>(null);

  const loadData = async () => {
    // Load Recruiter's posted jobs
    const { data: jobsData, error: jobsErr } = await apiRequest<Job[]>('/jobs');
    if (!jobsErr && jobsData) {
      // Filter jobs posted by current recruiter (managed on backend, but dashboard displays all recruiter owned)
      const recruiterUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (recruiterUser.role === 'Admin') {
        setJobs(jobsData);
      } else {
        setJobs(jobsData.filter(j => j.recruiterId === recruiterUser.userId));
      }
    }

    // Load applications for current recruiter's jobs
    const { data: appsData, error: appsErr } = await apiRequest<Application[]>('/applications');
    if (!appsErr && appsData) {
      setApplications(appsData);
    }

    // Load interviews
    const { data: intsData, error: intsErr } = await apiRequest<Interview[]>('/interviews');
    if (!intsErr && intsData) {
      setInterviews(intsData);
    }

    // Load company profile
    fetchCompanyProfile();
  };

  const fetchCompanyProfile = async () => {
    const { data, error } = await apiRequest('/companies/my-company');
    if (!error && data) {
      setCompanyProfile(data);
      setEditCompanyName(data.name || '');
      setEditCompanyLogo(data.logo || '');
      setEditCompanyIndustry(data.industry || '');
      setEditCompanyWebsite(data.website || '');
      setEditCompanyLocation(data.location || '');
      setEditCompanyAbout(data.about || '');
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    setStatusMsg(null);

    const { error } = await apiRequest('/companies/my-company', 'PUT', {
      name: editCompanyName,
      logo: editCompanyLogo,
      industry: editCompanyIndustry,
      website: editCompanyWebsite,
      location: editCompanyLocation,
      about: editCompanyAbout
    });

    setSavingCompany(false);
    if (error) {
      setStatusMsg({ text: error, error: true });
    } else {
      setStatusMsg({ text: 'Company profile updated successfully!', error: false });
      fetchCompanyProfile();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleInterviewAction = () => {
      loadData();
    };
    window.addEventListener('interview-action-completed', handleInterviewAction);
    return () => window.removeEventListener('interview-action-completed', handleInterviewAction);
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setPostingJob(true);

    const { error } = await apiRequest('/jobs', 'POST', {
      title,
      companyName,
      description: desc,
      requirements: reqs,
      location: loc,
      jobType: type,
      salaryRange: salary,
      applicationDeadline: applicationDeadline || null,
    });

    setPostingJob(false);

    if (error) {
      setStatusMsg({ text: error, error: true });
    } else {
      setStatusMsg({ text: 'Job posted successfully!', error: false });
      setTitle('');
      setCompanyName('');
      setDesc('');
      setReqs('');
      setLoc('');
      setSalary('');
      setApplicationDeadline('');
      loadData();
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp) return;
    setStatusMsg(null);
    setScheduling(true);

    const { error } = await apiRequest('/interviews', 'POST', {
      applicationId: schedulingApp.id,
      interviewDate: intDate,
      format: intFormat,
      meetingLink: intFormat === 'Online' ? intLink : '',
      notes: intNotes,
      hrName,
      hrEmail,
      hrPhone,
      companyName: intFormat === 'InPerson' ? intCompanyName : '',
      officeAddress: intFormat === 'InPerson' ? officeAddress : '',
      venue: intFormat === 'InPerson' ? venue : '',
      reportingTime: intFormat === 'InPerson' ? reportingTime : '',
      dressCode: intFormat === 'InPerson' ? dressCode : '',
      requiredDocuments: intFormat === 'InPerson' ? requiredDocuments : '',
    });

    setScheduling(false);
    if (error) {
      setStatusMsg({ text: error, error: true });
    } else {
      setStatusMsg({ text: 'Interview scheduled successfully! Gemini AI has generated tailored questions.', error: false });
      setSchedulingApp(null);
      setIntDate('');
      setIntLink('');
      setIntNotes('');
      setHrName('');
      setHrEmail('');
      setHrPhone('');
      setIntCompanyName('');
      setOfficeAddress('');
      setVenue('');
      setReportingTime('');
      setDressCode('');
      setRequiredDocuments('');
      loadData();
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingInterview) return;
    setCompleting(true);
    setStatusMsg(null);

    const { error } = await apiRequest(`/interviews/${completingInterview.id}/complete`, 'PUT', {
      resultStatus,
      feedback,
      remarks
    });

    setCompleting(false);
    if (error) {
      setStatusMsg({ text: error, error: true });
    } else {
      setStatusMsg({ text: 'Interview completed and candidate status updated successfully!', error: false });
      setCompletingInterview(null);
      setFeedback('');
      setRemarks('');
      loadData();
      window.dispatchEvent(new Event('interview-action-completed'));
    }
  };

  const updateApplicationStatus = async (appId: number, status: string) => {
    const { error } = await apiRequest(`/applications/${appId}/status`, 'PUT', { status });
    if (!error) {
      loadData();
    }
  };

  const savePrivateNotes = async (appId: number, notesText: string) => {
    await apiRequest(`/applications/${appId}/notes`, 'PUT', { notes: notesText });
    loadData();
  };

  const exportToCSV = () => {
    const headers = ["ID", "Candidate Name", "Job Title", "Company", "Status", "Fit Score", "Applied Date"];
    
    const rows = applications.map(app => [
      app.id,
      `"${app.candidateName.replace(/"/g, '""')}"`,
      `"${app.jobTitle.replace(/"/g, '""')}"`,
      `"${(app.jobCompany || '').replace(/"/g, '""')}"`,
      `"${app.status}"`,
      `${app.matchingScore}%`,
      new Date(app.appliedAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `applications_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export to PDF.");
      return;
    }

    let rowsHtml = '';
    applications.forEach(app => {
      let badgeClass = 'badge-applied';
      if (app.status === 'Reviewing') badgeClass = 'badge-review';
      else if (app.status === 'Interviewing') badgeClass = 'badge-interview';
      else if (app.status === 'Offered') badgeClass = 'badge-offered';
      else if (app.status === 'Rejected') badgeClass = 'badge-rejected';

      rowsHtml += `
        <tr>
          <td>${app.id}</td>
          <td><strong>${app.candidateName}</strong></td>
          <td>${app.jobTitle}</td>
          <td>${app.jobCompany || 'N/A'}</td>
          <td><span class="badge ${badgeClass}">${app.status}</span></td>
          <td><strong>${app.matchingScore}%</strong></td>
          <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Applications Export</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 24px; color: #0f172a; margin-bottom: 5px; }
            .meta { font-size: 13px; color: #6B7280; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; font-weight: bold; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .badge-applied { background-color: #e0f2fe; color: #0369a1; }
            .badge-review { background-color: #fef3c7; color: #d97706; }
            .badge-interview { background-color: #f3e8ff; color: #7e22ce; }
            .badge-offered { background-color: #dcfce7; color: #15803d; }
            .badge-rejected { background-color: #fee2e2; color: #b91c1c; }
          </style>
        </head>
        <body>
          <h1>RecruitNexus Applications Report</h1>
          <div class="meta">Generated on ${new Date().toLocaleString()} | Total: ${applications.length} Candidates</div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate Name</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Fit Score</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const parseAiQuestions = (questionsJson: string) => {
    try {
      return JSON.parse(questionsJson) as { questionText: string; rationale: string }[];
    } catch {
      return [];
    }
  };

  const getCompanyStats = () => {
    const statsMap: Record<string, {
      companyName: string;
      applicationsCount: number;
      interviewsScheduled: number;
      confirmed: number;
      selected: number;
      rejected: number;
      pending: number;
      onHold: number;
    }> = {};

    applications.forEach(a => {
      const comp = a.jobCompany || 'Independent / Unknown';
      if (!statsMap[comp]) {
        statsMap[comp] = {
          companyName: comp,
          applicationsCount: 0,
          interviewsScheduled: 0,
          confirmed: 0,
          selected: 0,
          rejected: 0,
          pending: 0,
          onHold: 0
        };
      }
      statsMap[comp].applicationsCount += 1;
      
      if (a.status === 'Selected') statsMap[comp].selected += 1;
      else if (a.status === 'Rejected') statsMap[comp].rejected += 1;
      else if (a.status === 'Under Review') statsMap[comp].onHold += 1;
    });

    interviews.forEach(i => {
      const comp = i.companyName || 'Independent / Unknown';
      if (!statsMap[comp]) {
        statsMap[comp] = {
          companyName: comp,
          applicationsCount: 0,
          interviewsScheduled: 0,
          confirmed: 0,
          selected: 0,
          rejected: 0,
          pending: 0,
          onHold: 0
        };
      }
      
      statsMap[comp].interviewsScheduled += 1;
      if (i.candidateConfirmation === 'Confirmed') statsMap[comp].confirmed += 1;
      else if (i.candidateConfirmation === 'Pending') statsMap[comp].pending += 1;
      
      if (i.status === 'Completed') {
        if (i.resultStatus === 'Selected') statsMap[comp].selected += 1;
        else if (i.resultStatus === 'Rejected') statsMap[comp].rejected += 1;
        else if (i.resultStatus === 'OnHold') statsMap[comp].onHold += 1;
      }
    });

    return Object.values(statsMap);
  };

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFilteredCalendarInterviews = useCallback(() => {
    return interviews.filter(i => {
      if (calStatusFilter !== 'All' && i.status !== calStatusFilter) return false;
      if (calTypeFilter !== 'All' && (i.format || '').toLowerCase() !== calTypeFilter.toLowerCase()) return false;
      if (calSearchQuery.trim()) {
        const q = calSearchQuery.toLowerCase();
        const cand = (i.candidateName || '').toLowerCase();
        const jTitle = (i.jobTitle || '').toLowerCase();
        if (!cand.includes(q) && !jTitle.includes(q)) return false;
      }
      return true;
    });
  }, [interviews, calStatusFilter, calTypeFilter, calSearchQuery]);

  const getTodayInterviews = useCallback(() => {
    const todayStr = new Date().toDateString();
    return interviews.filter(i => new Date(i.interviewDate).toDateString() === todayStr);
  }, [interviews]);

  const getStartDayOfWeek = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title} className="text-gradient">{t('recruiter_view')}</h1>
          <p style={styles.subtitle}>
            Welcome back, <strong>{JSON.parse(localStorage.getItem('user') || '{}').fullName || 'Recruiter'}</strong> ({JSON.parse(localStorage.getItem('user') || '{}').email || ''})! Here's your hiring pipeline.
          </p>
        </div>
        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'analytics' ? '#2563EB' : '#4B5563',
              fontWeight: activeTab === 'analytics' ? 700 : 500,
              borderBottomColor: activeTab === 'analytics' ? '#2563EB' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BarChart3 size={16} color={activeTab === 'analytics' ? '#2563EB' : '#4B5563'} />
            <span>📊 Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'applications' ? '#2563EB' : '#4B5563',
              fontWeight: activeTab === 'applications' ? 700 : 500,
              borderBottomColor: activeTab === 'applications' ? '#2563EB' : 'transparent',
            }}
          >
            🎯 Candidate Ranking ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'jobs' ? '#2563EB' : '#4B5563',
              fontWeight: activeTab === 'jobs' ? 700 : 500,
              borderBottomColor: activeTab === 'jobs' ? '#2563EB' : 'transparent',
            }}
          >
            📋 Applications ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'interviews' ? '#2563EB' : '#4B5563',
              fontWeight: activeTab === 'interviews' ? 700 : 500,
              borderBottomColor: activeTab === 'interviews' ? '#2563EB' : 'transparent',
            }}
          >
            📅 Interviews & Schedule ({interviews.length})
          </button>

          <button
            onClick={() => setActiveTab('company')}
            style={{
              ...styles.tabBtn,
              color: activeTab === 'company' ? '#2563EB' : '#4B5563',
              fontWeight: activeTab === 'company' ? 700 : 500,
              borderBottomColor: activeTab === 'company' ? '#2563EB' : 'transparent',
            }}
          >
            🏢 Company Profile
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                ...styles.tabBtn,
                color: activeTab === 'admin' ? '#2563EB' : '#4B5563',
                fontWeight: activeTab === 'admin' ? 700 : 500,
                borderBottomColor: activeTab === 'admin' ? '#2563EB' : 'transparent',
              }}
            >
              👑 Admin Console
            </button>
          )}
        </div>
      </div>

      {/* Recruiter Stats Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
        <DashboardCard 
          title={t('recruiter.total_jobs')} 
          value={jobs.length} 
          subtext="Total created vacancies" 
          icon={<Briefcase size={20} />} 
          accentColor="var(--accent-cyan)"
        />
        <DashboardCard 
          title={t('jobs.status_active')} 
          value={jobs.filter(j => j.status === 'Open').length} 
          subtext="Positions open for applications" 
          icon={<Clock size={20} />} 
          accentColor="#10b981"
        />
        <DashboardCard 
          title={t('recruiter.total_applications')} 
          value={applications.length} 
          subtext="Resumes received pipeline" 
          icon={<FileText size={20} />} 
          accentColor="var(--accent-blue)"
        />
        <DashboardCard 
          title={t('recruiter.active_interviews')} 
          value={interviews.filter(i => new Date(i.interviewDate).toDateString() === new Date().toDateString()).length} 
          subtext="Scheduled for today" 
          icon={<Calendar size={20} />} 
          accentColor="#eab308"
        />
      </div>

      {/* RECRUITER ANALYTICS DASHBOARD TAB */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Header Banner */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px', borderLeft: '4px solid #2563EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
                📊 Recruiter Talent Analytics & Insights
              </h2>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '0.9rem' }}>
                Real-time recruitment pipeline metrics, hiring funnel conversion, and candidate ATS quality scores.
              </p>
            </div>
            
            <button
              onClick={() => fetchRecruiterAnalytics()}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#2563EB', borderColor: '#2563EB', fontWeight: 600 }}
              disabled={loadingAnalytics}
            >
              {loadingAnalytics ? 'Refreshing...' : '🔄 Refresh Analytics'}
            </button>
          </div>

          {/* SECTION 1: 13 ENTERPRISE KPI CARDS GRID */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
              📌 Key Recruitment Metrics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
              
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>TOTAL JOBS</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827' }}>{analyticsData?.totalJobs || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Total Created Vacancies</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ACTIVE JOBS</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A' }}>{analyticsData?.activeJobs || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Open for Applications</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CLOSED JOBS</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6B7280' }}>{analyticsData?.closedJobs || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Positions Filled</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>APPLICATIONS</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB' }}>{analyticsData?.applicationsReceived || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Total Submissions</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>SHORTLISTED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7C3AED' }}>{analyticsData?.shortlistedCandidates || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>In Review / Interviewing</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>INTERVIEWS SCHEDULED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#EA580C' }}>{analyticsData?.interviewsScheduled || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 600 }}>Upcoming Meetings</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>INTERVIEWS COMPLETED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284C7' }}>{analyticsData?.interviewsCompleted || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }}>Evaluations Done</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OFFERS GENERATED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7C3AED' }}>{analyticsData?.offersGenerated || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Offer Letters Issued</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>OFFERS ACCEPTED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A' }}>{analyticsData?.offersAccepted || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Signed Agreements</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>SUCCESSFULLY HIRED</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16A34A' }}>{analyticsData?.successfullyHired || 0}</div>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Onboarded Employees</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>HIRING SUCCESS RATE</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563EB' }}>{analyticsData?.hiringSuccessRate || 0}%</div>
                <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Hired vs Applied</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>AVG ATS SCORE</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7C3AED' }}>{analyticsData?.averageATSScore || 0}%</div>
                <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Resume Match Quality</span>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block', marginBottom: '4px' }}>AVG INTERVIEW SCORE</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#EA580C' }}>{analyticsData?.averageInterviewScore || 0}%</div>
                <span style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 600 }}>Candidate Evaluation</span>
              </div>

            </div>
          </div>

          {/* SECTION 2: HIRING FUNNEL CARDS */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
              🔻 Candidate Recruitment Funnel
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>STAGE 1: APPLIED</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', display: 'block', margin: '4px 0' }}>
                  {analyticsData?.applicationsReceived || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>100% Pipeline</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>STAGE 2: SHORTLISTED</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7C3AED', display: 'block', margin: '4px 0' }}>
                  {analyticsData?.shortlistedCandidates || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700 }}>
                  {((analyticsData?.shortlistedCandidates || 0) / Math.max(analyticsData?.applicationsReceived || 1, 1) * 100).toFixed(1)}% Conversion
                </span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>STAGE 3: INTERVIEWED</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#EA580C', display: 'block', margin: '4px 0' }}>
                  {analyticsData?.interviewsCompleted || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 700 }}>
                  {((analyticsData?.interviewsCompleted || 0) / Math.max(analyticsData?.applicationsReceived || 1, 1) * 100).toFixed(1)}% Conversion
                </span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>STAGE 4: OFFERED</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284C7', display: 'block', margin: '4px 0' }}>
                  {analyticsData?.offersGenerated || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>
                  {((analyticsData?.offersGenerated || 0) / Math.max(analyticsData?.applicationsReceived || 1, 1) * 100).toFixed(1)}% Conversion
                </span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>STAGE 5: HIRED</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A', display: 'block', margin: '4px 0' }}>
                  {analyticsData?.successfullyHired || 0}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>
                  {((analyticsData?.successfullyHired || 0) / Math.max(analyticsData?.applicationsReceived || 1, 1) * 100).toFixed(1)}% Conversion
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: MONTHLY TREND & DEPARTMENT BREAKDOWN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Monthly Hiring Trend */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                📈 Monthly Application Submissions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(analyticsData?.monthlyHiringTrend || []).map((m: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '80px', fontSize: '0.82rem', fontWeight: 700, color: '#4B5563' }}>{m.month}</span>
                    <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '6px', height: '24px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                      <div style={{ height: '16px', background: '#2563EB', borderRadius: '4px', width: `${Math.min(m.count * 10, 100)}%`, minWidth: m.count > 0 ? '20px' : '0px', transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', width: '30px', textAlign: 'right' }}>{m.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Hiring Breakdown */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                🏢 Department & Job Type Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(analyticsData?.departmentHiring || []).map((dept: any, idx: number) => (
                  <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827', display: 'block' }}>{dept.department}</span>
                      <span style={{ fontSize: '0.78rem', color: '#4B5563' }}>{dept.jobsCount} Open Positions</span>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '0.82rem' }}>
                      {dept.applicationsCount} Applications
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECTION 4: TOP PERFORMING JOBS TABLE */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
              🏆 Job Opening Performance Matrix
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: '#111827', fontWeight: 800 }}>JOB TITLE</th>
                    <th style={{ padding: '12px 16px', color: '#111827', fontWeight: 800 }}>TYPE</th>
                    <th style={{ padding: '12px 16px', color: '#111827', fontWeight: 800 }}>APPLICATIONS</th>
                    <th style={{ padding: '12px 16px', color: '#111827', fontWeight: 800 }}>SHORTLISTED</th>
                    <th style={{ padding: '12px 16px', color: '#111827', fontWeight: 800 }}>AVG ATS MATCH</th>
                    <th style={{ padding: '12px 16px', color: '#111827', fontWeight: 800 }}>HIRED</th>
                  </tr>
                </thead>
                <tbody>
                  {(analyticsData?.jobPerformance || []).map((job: any) => (
                    <tr key={job.jobId} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>{job.jobTitle}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{job.category}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563EB' }}>{job.applicationsCount}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#7C3AED' }}>{job.shortlistedCount}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16A34A' }}>{job.averageAtsScore}%</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16A34A' }}>{job.hiredCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 5: AI RECOMMENDATION DISTRIBUTION CARDS */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
              🧠 Candidate AI Fit Classification
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', padding: '20px', borderRadius: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803D', display: 'block', marginBottom: '6px' }}>STRONG HIRE (ATS ≥ 85%)</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#15803D' }}>
                  {analyticsData?.aiRecommendationDistribution?.find((r: any) => r.category === 'Strong Hire')?.count || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>High Priority Candidates</span>
              </div>

              <div style={{ background: '#DBEAFE', border: '1px solid #BFDBFE', padding: '20px', borderRadius: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '6px' }}>CONSIDER (ATS 70–84%)</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1E40AF' }}>
                  {analyticsData?.aiRecommendationDistribution?.find((r: any) => r.category === 'Consider')?.count || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: 600 }}>Solid Alternative Match</span>
              </div>

              <div style={{ background: '#FFEDD5', border: '1px solid #FED7AA', padding: '20px', borderRadius: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#C2410C', display: 'block', marginBottom: '6px' }}>REQUIRES UPSKILLING (&lt; 70%)</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#C2410C' }}>
                  {analyticsData?.aiRecommendationDistribution?.find((r: any) => r.category === 'Requires Upskilling')?.count || 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#9A3412', fontWeight: 600 }}>Skill Development Recommended</span>
              </div>
            </div>
          </div>

          {/* SECTION 6: RECRUITER PERFORMANCE SUMMARY */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
              📋 Executive Hiring Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>AVG TIME TO HIRE</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563EB' }}>14 Days</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>AVG ATS MATCH</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7C3AED' }}>{analyticsData?.averageATSScore || 0}%</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>AVG INTERVIEW SCORE</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#EA580C' }}>{analyticsData?.averageInterviewScore || 0}%</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>HIRING SUCCESS %</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16A34A' }}>{analyticsData?.hiringSuccessRate || 0}%</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 700, display: 'block' }}>ACTIVE RECRUITMENTS</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284C7' }}>{analyticsData?.activeJobs || 0}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'jobs' && (
        <div style={styles.grid}>
          {/* Post Job Form */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Plus size={20} color="#2563EB" />
              <h2 style={styles.cardTitle}>{t('jobs.post_new')}</h2>
            </div>
            
            <form onSubmit={handlePostJob} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t('jobs.title')}</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder={t('jobs.title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>{t('jobs.company_name')}</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder={t('jobs.company_name')}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Location</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Job Type</label>
                  <select
                    className="glass-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ background: '#FFFFFF' }}
                  >
                    <option value="FullTime">Full Time</option>
                    <option value="PartTime">Part Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Salary Range</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. $120,000 - $150,000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Application Deadline</label>
                <input
                  type="date"
                  className="glass-input"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  style={{ background: '#FFFFFF', color: '#111827' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Job Description</label>
                <textarea
                  required
                  className="glass-input"
                  rows={4}
                  placeholder="Describe the role, team environment, and daily activities..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Requirements (Technical skills, years of experience)</label>
                <textarea
                  required
                  className="glass-input"
                  rows={3}
                  placeholder="List requirements e.g. 5+ years React, C#/.NET background..."
                  value={reqs}
                  onChange={(e) => setReqs(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={postingJob} style={{ justifyContent: 'center' }}>
                {postingJob ? 'Creating...' : 'Post Job Opening'}
              </button>
            </form>
          </div>

          {/* Active Jobs List */}
          <div style={styles.rightColumn}>
            <div className="glass-panel" style={{ ...styles.card, flex: 1 }}>
              <div style={styles.cardHeader}>
                <Briefcase size={20} color="#8b5cf6" />
                <h2 style={styles.cardTitle}>My Active Postings</h2>
              </div>

              {jobs.length === 0 ? (
                <div style={styles.emptyMsg}>No job openings created yet. Use the form to post one.</div>
              ) : (
                <div style={styles.gridList}>
                  {jobs.slice((jobsPage - 1) * pageSize, jobsPage * pageSize).map((job) => (
                    <div key={job.id} className="glass-panel" style={styles.jobItem}>
                      <div style={styles.jobItemHeader}>
                        <h4>{job.title}</h4>
                        <span className="badge">{job.jobType}</span>
                      </div>
                      <div style={styles.jobItemMeta}>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.applicationCount} applicants</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Pagination 
                currentPage={jobsPage} 
                totalPages={Math.ceil(jobs.length / pageSize)} 
                onPageChange={setJobsPage} 
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Cards */}
          <div style={styles.statsGrid}>
            <DashboardCard
              title="Total Candidates"
              value={applications.length}
              icon={<Users size={20} color="#2563EB" />}
              subtext="All Pool"
            />
            <DashboardCard
              title="Highly Recommended"
              value={applications.filter(a => a.matchingScore >= 95).length}
              icon={<Award size={20} color="#10b981" />}
              subtext="95-100 Score"
            />
            <DashboardCard
              title="Interview Ready"
              value={applications.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length}
              icon={<Calendar size={20} color="#8b5cf6" />}
              subtext="Shortlisted"
            />
            <DashboardCard
              title="Average Match Score"
              value={applications.length > 0 ? Math.round(applications.reduce((acc, a) => acc + (a.matchingScore || 0), 0) / applications.length) + '%' : '0%'}
              icon={<BarChart3 size={20} color="#f59e0b" />}
              subtext="Pool Mean"
            />
          </div>

          <div className="glass-panel" style={styles.card}>
            <div style={{ ...styles.cardHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#2563EB" />
                <h2 style={styles.cardTitle}><Translate text="AI Candidate Ranking Dashboard" /></h2>
              </div>
              {applications.length > 0 && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={exportToCSV}
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#22c55e', color: '#22c55e' }}
                  >
                    📥 Export to Excel (CSV)
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    📄 Export to PDF
                  </button>
                </div>
              )}
            </div>

            {/* AI Candidate Ranking Metric Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '20px 0' }}>
              <DashboardCard
                title={t('Total Candidates')}
                value={applications.length}
                icon={<Users size={20} />}
                accentColor="#2563EB"
              />
              <DashboardCard
                title={t('Highly Recommended')}
                value={applications.filter(a => a.matchingScore >= 95).length}
                icon={<Award size={20} />}
                accentColor="#10b981"
              />
              <DashboardCard
                title={t('Interview Ready')}
                value={applications.filter(a => a.status === 'Interviewing' || a.matchingScore >= 85).length}
                icon={<CheckCircle2 size={20} />}
                accentColor="#8b5cf6"
              />
              <DashboardCard
                title={t('Average Match Score')}
                value={`${applications.length > 0 ? Math.round(applications.reduce((acc, a) => acc + a.matchingScore, 0) / applications.length) : 0}%`}
                icon={<TrendingUp size={20} />}
                accentColor="#f59e0b"
              />
            </div>

            {/* Filter Controls Bar */}
            {applications.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '16px 0 20px 0', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}><Translate text="Recommendation" />:</span>
                  <select
                    value={rankingRecommendationFilter}
                    onChange={(e) => { setRankingRecommendationFilter(e.target.value); setAppsPage(1); }}
                    style={{ ...styles.statusSelect, width: 'auto', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', fontSize: '0.8rem' }}
                  >
                    <option value="All">All Recommendations</option>
                    <option value="HighlyRecommended">⭐ Highly Recommended (95-100)</option>
                    <option value="Recommended">👍 Recommended (85-94)</option>
                    <option value="Consider">💡 Consider (70-84)</option>
                    <option value="NotRecommended">⚠️ Not Recommended (&lt;70)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}><Translate text="Status" />:</span>
                  <select
                    value={rankingStatusFilter}
                    onChange={(e) => { setRankingStatusFilter(e.target.value); setAppsPage(1); }}
                    style={{ ...styles.statusSelect, width: 'auto', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', fontSize: '0.8rem' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}><Translate text="Job Position" />:</span>
                  <select
                    value={rankingJobFilter}
                    onChange={(e) => { setRankingJobFilter(e.target.value); setAppsPage(1); }}
                    style={{ ...styles.statusSelect, width: 'auto', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', fontSize: '0.8rem' }}
                  >
                    <option value="All">All Jobs</option>
                    {Array.from(new Set(applications.map(a => a.jobTitle))).map(jt => (
                      <option key={jt} value={jt}>{jt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {getRankedApplications().length === 0 ? (
              <div style={styles.emptyMsg}>No candidate applications match the selected ranking filters.</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={{ ...styles.table, minWidth: '1000px' }}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.th, width: '70px', textAlign: 'center' }}><Translate text="Rank #" /></th>
                      <th style={styles.th}><Translate text="Candidate" /></th>
                      <th style={styles.th}><Translate text="AI Score" /></th>
                      <th style={styles.th}><Translate text="Experience" /></th>
                      <th style={styles.th}><Translate text="Skills" /></th>
                      <th style={styles.th}><Translate text="Recommendation" /></th>
                      <th style={styles.th}><Translate text="Status" /></th>
                      <th style={{ ...styles.th, textAlign: 'right' }}><Translate text="Actions" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getRankedApplications().slice((appsPage - 1) * pageSize, appsPage * pageSize).map((app, pageIdx) => {
                      const globalRank = (appsPage - 1) * pageSize + pageIdx + 1;
                      const recBadge = getRecommendationBadge(app.matchingScore);

                      return (
                        <React.Fragment key={app.id}>
                          <tr style={styles.tr}>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              <span style={{ 
                                fontWeight: 'bold', 
                                fontSize: '0.95rem', 
                                color: globalRank === 1 ? '#D97706' : globalRank === 2 ? '#4B5563' : globalRank === 3 ? '#B45309' : '#6B7280' 
                              }}>
                                {globalRank === 1 ? '🏆 #1' : globalRank === 2 ? '🥈 #2' : globalRank === 3 ? '🥉 #3' : `#${globalRank}`}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong style={{ color: '#111827', fontSize: '0.95rem' }}>{app.candidateName}</strong>
                                <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>{app.jobTitle}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span className={`badge ${app.matchingScore >= 80 ? 'badge-green' : app.matchingScore >= 60 ? 'badge-purple' : 'badge-orange'}`} style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                {app.matchingScore}% Fit
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>
                                {app.matchingScore >= 85 ? '5+ Years' : app.matchingScore >= 70 ? '3+ Years' : '1-2 Years'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>React</span>
                                <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>.NET Core</span>
                                <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>SQL</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span className={`badge ${recBadge.badgeClass}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {recBadge.label}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <select
                                value={app.status}
                                onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                style={styles.statusSelect}
                              >
                                <option value="Applied">Applied</option>
                                <option value="Reviewing">Reviewing</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offered">Offered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => handleViewAtsAnalysis(app)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#2563EB', borderColor: '#2563EB' }}
                                  title="View ATS Analysis"
                                >
                                  📊 ATS Analysis
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGenerateAiQuestions(app)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#7C3AED', borderColor: '#7C3AED' }}
                                  title="AI Interview Questions"
                                >
                                  🎙️ AI Interview
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGenerateHiringDecision(app)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                  title="AI Decision"
                                >
                                  🧠 AI Decision
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGenerateAiQuestions(app)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                  title="AI Questions"
                                >
                                  ⚡ AI Questions
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSchedulingApp(app)}
                                  className="btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                                  disabled={app.status === 'Rejected'}
                                >
                                  Schedule
                                </button>
                                {(app.offerStatus === 'Accepted' || app.status === 'Offered') && (
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateOnboarding(app)}
                                    className="btn-primary"
                                    style={{ padding: '4px 8px', fontSize: '0.78rem', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                                  >
                                    🚀 Onboarding
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                      {/* Expanded View for AI Report and Cover Letter */}
                      <tr>
                        <td colSpan={7} style={{ padding: '0 24px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={styles.appDetailsBox}>
                            <div style={{ flex: 1 }}>
                              <h5 style={styles.boxTitle}><Translate text="Cover Letter" /></h5>
                              <p style={styles.boxText}><Translate text={app.coverLetter || 'No cover letter provided.'} /></p>
                            </div>
                            <div style={{ flex: 2, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h5 style={styles.boxTitle} className="text-gradient"><Translate text="AI Fit Analysis" /></h5>
                                <span className={`badge ${app.matchingScore >= 80 ? 'badge-green' : app.matchingScore >= 60 ? 'badge-purple' : 'badge-orange'}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                  {app.matchingScore}% Match Score
                                </span>
                              </div>
                              <p style={styles.boxText}><Translate text={app.ai_Feedback || ''} /></p>
                              
                              {(() => {
                                 const feedback = app.ai_Feedback || '';
                                 const matchMatch = feedback.match(/matching skills?:?\s*([^.]+)/i) || feedback.match(/strong alignment with\s*([^.]+)/i);
                                 const gapMatch = feedback.match(/missing skills?:?\s*([^.]+)/i) || feedback.match(/gap detected in\s*([^.]+)/i) || feedback.match(/skill gap in\s*([^.]+)/i);
                                 
                                 const matchingSkills = matchMatch ? matchMatch[1].split(/,|\s+and\s+/i).map(s => s.trim()).filter(Boolean) : [];
                                 const missingSkills = gapMatch ? gapMatch[1].split(/,|\s+and\s+/i).map(s => s.trim()).filter(Boolean) : [];
                                 
                                 const recSection = feedback.split(/Personalized Learning Recommendations:?/i)[1];
                                 const recommendations = recSection ? recSection.split(/\n|•|-/).map(s => s.trim()).filter(s => s.length > 5) : [];

                                 if (matchingSkills.length === 0 && missingSkills.length === 0 && recommendations.length === 0) return null;

                                 return (
                                   <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                     {matchingSkills.length > 0 && (
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                         <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Matching Skills:</span>
                                         {matchingSkills.map((sk, idx) => (
                                           <span key={idx} className="badge badge-green" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{sk}</span>
                                         ))}
                                       </div>
                                     )}
                                     {missingSkills.length > 0 && (
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                         <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Skill Gaps:</span>
                                         {missingSkills.map((sk, idx) => (
                                           <span key={idx} className="badge badge-orange" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{sk}</span>
                                         ))}
                                       </div>
                                     )}
                                     {recommendations.length > 0 && (
                                       <div style={{ background: 'rgba(59,130,246,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                         <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, display: 'block', marginBottom: '4px' }}>📚 Learning Recommendations:</span>
                                         <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#374151' }}>
                                           {recommendations.map((rec, idx) => (
                                             <li key={idx} style={{ marginBottom: '2px' }}>{rec}</li>
                                           ))}
                                         </ul>
                                       </div>
                                     )}
                                   </div>
                                 );
                               })()}
                            </div>
                            <div style={{ flex: 1.5, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                              <h5 style={styles.boxTitle} className="text-gradient"><Translate text="Recruiter Private Notes" /></h5>
                              <textarea
                                className="glass-input"
                                style={{ fontSize: '0.8rem', padding: '10px', minHeight: '90px', width: '100%', marginBottom: '8px', color: '#111827', background: '#FFFFFF', border: '1px solid var(--glass-border)', borderRadius: '8px', fontFamily: 'inherit' }}
                                defaultValue={app.recruiterNotes || ''}
                                placeholder={t('Add private evaluations, hiring remarks, salary negotiations... (autosaved on clicking away)')}
                                onBlur={(e) => savePrivateNotes(app.id, e.target.value)}
                              />
                            </div>
                            <div style={{ flex: 1.2, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
                              <h5 style={styles.boxTitle} className="text-gradient"><Translate text="Offer Letter" /></h5>
                              {app.offerLetterContent ? (
                                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                  <div style={{ marginBottom: '8px' }}>
                                    Status: <strong style={{ 
                                      color: app.offerStatus === 'Accepted' ? '#10b981' : app.offerStatus === 'Rejected' ? '#ef4444' : '#fbbf24' 
                                    }}>{app.offerStatus || 'Pending'}</strong>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenOfferGenerator(app)}
                                    className="btn-secondary"
                                    style={{ fontSize: '0.75rem', padding: '4px 8px', width: '100%', justifyContent: 'center' }}
                                  >
                                    View / Edit Offer
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <p style={{ ...styles.boxText, marginBottom: '8px', fontSize: '0.75rem' }}>No offer letter extended yet.</p>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenOfferGenerator(app)}
                                    className="btn-primary"
                                    style={{ fontSize: '0.75rem', padding: '6px 10px', width: '100%', justifyContent: 'center', backgroundColor: '#10b981', borderColor: '#10b981' }}
                                  >
                                    Generate Offer Letter
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                    )})}
                </tbody>
              </table>
              <Pagination 
                currentPage={appsPage} 
                totalPages={Math.ceil(getRankedApplications().length / pageSize)} 
                onPageChange={setAppsPage} 
              />
            </div>
          )}
        </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header & View Switcher */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px', borderLeft: '4px solid #2563EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>
                📅 Enterprise Smart Interview Calendar
              </h2>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '0.88rem' }}>
                Manage candidate interviews, view today's schedule, launch meeting links, and inspect AI interview scorecards.
              </p>
            </div>

            {/* View Switcher Controls */}
            <div style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setCalendarView('month')}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px', background: calendarView === 'month' ? '#2563EB' : 'transparent', color: calendarView === 'month' ? '#FFFFFF' : '#4B5563', fontWeight: 600, border: 'none' }}
              >
                📅 Month View
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px', background: calendarView === 'week' ? '#2563EB' : 'transparent', color: calendarView === 'week' ? '#FFFFFF' : '#4B5563', fontWeight: 600, border: 'none' }}
              >
                📆 Week View
              </button>
              <button
                onClick={() => setCalendarView('day')}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px', background: calendarView === 'day' ? '#2563EB' : 'transparent', color: calendarView === 'day' ? '#FFFFFF' : '#4B5563', fontWeight: 600, border: 'none' }}
              >
                ⏱️ Day View / Today
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '16px 20px', borderRadius: '14px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>Status:</span>
                <select
                  value={calStatusFilter}
                  onChange={(e) => setCalStatusFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.82rem', background: '#F8FAFC', color: '#111827', fontWeight: 600 }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>Type:</span>
                <select
                  value={calTypeFilter}
                  onChange={(e) => setCalTypeFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.82rem', background: '#F8FAFC', color: '#111827', fontWeight: 600 }}
                >
                  <option value="All">All Formats</option>
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Scenario">Scenario</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Search candidate name or position title..."
                  value={calSearchQuery}
                  onChange={(e) => setCalSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.85rem', background: '#F8FAFC', color: '#111827' }}
                />
              </div>
            </div>

            <span className="badge badge-purple" style={{ fontSize: '0.82rem' }}>
              Showing {getFilteredCalendarInterviews().length} of {interviews.length} Sessions
            </span>
          </div>

          {/* MAIN CALENDAR CONTENT GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            
            {/* LEFT: CALENDAR VIEW (MONTH / WEEK / DAY) */}
            <div>
              {calendarView === 'month' && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
                  {/* Month Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={handlePrevMonth} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>← Previous</button>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                      {monthsList[currentMonth]} {currentYear}
                    </h3>
                    <button onClick={handleNextMonth} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Next →</button>
                  </div>

                  {/* 7-Column Calendar Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
                    {weekdays.map((day, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280', padding: '8px 0', textTransform: 'uppercase' }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {Array.from({ length: getStartDayOfWeek(currentMonth, currentYear) }).map((_, idx) => (
                      <div key={`empty-${idx}`} style={{ minHeight: '85px', background: '#F8FAFC', borderRadius: '10px', opacity: 0.4 }} />
                    ))}

                    {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, dayIdx) => {
                      const dayNum = dayIdx + 1;
                      const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                      const dayInterviews = getFilteredCalendarInterviews().filter(i => {
                        const d = new Date(i.interviewDate);
                        return d.getDate() === dayNum && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                      });

                      return (
                        <div
                          key={dayNum}
                          onClick={() => setSelectedCalDate(new Date(currentYear, currentMonth, dayNum))}
                          style={{
                            minHeight: '85px',
                            background: isToday ? '#EFF6FF' : '#FFFFFF',
                            border: `1px solid ${isToday ? '#2563EB' : '#E5E7EB'}`,
                            borderRadius: '10px',
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isToday ? '#2563EB' : '#111827' }}>
                            {dayNum}
                          </span>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {dayInterviews.slice(0, 2).map((di, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: di.status === 'Completed' ? '#DCFCE7' : '#DBEAFE',
                                  color: di.status === 'Completed' ? '#15803D' : '#1E40AF',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {di.candidateName.split(' ')[0]} ({new Date(di.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </div>
                            ))}
                            {dayInterviews.length > 2 && (
                              <span style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 700 }}>+{dayInterviews.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(calendarView === 'week' || calendarView === 'day') && (
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                    {calendarView === 'week' ? '📆 Weekly Interview Time Slots' : '⏱️ Daily Agenda & Time Slots'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getFilteredCalendarInterviews().length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                        No interview sessions scheduled for the selected filters.
                      </div>
                    ) : (
                      getFilteredCalendarInterviews().map(i => (
                        <div key={i.id} style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                              {(i.candidateName || 'C')[0]}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#111827' }}>
                                {i.candidateName}
                              </h4>
                              <span style={{ fontSize: '0.82rem', color: '#4B5563', display: 'block', marginTop: '2px' }}>
                                Position: <strong>{i.jobTitle}</strong> • {new Date(i.interviewDate).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="badge badge-purple" style={{ fontSize: '0.78rem' }}>{i.format || 'Technical'}</span>
                            <span className={`badge ${i.status === 'Completed' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: '0.78rem' }}>{i.status}</span>
                            
                            {i.meetingLink && (
                              <a
                                href={i.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-primary"
                                style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
                              >
                                🔗 Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: TODAY'S SCHEDULE & UPCOMING PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Today's Panel */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '20px', borderRadius: '16px', borderTop: '4px solid #16A34A' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                  ☀️ Today's Interview Schedule ({getTodayInterviews().length})
                </h3>
                <p style={{ margin: '0 0 16px 0', color: '#6B7280', fontSize: '0.82rem' }}>
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>

                {getTodayInterviews().length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '0.85rem' }}>
                    No interview sessions scheduled for today.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getTodayInterviews().map(i => (
                      <div key={i.id} style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{i.candidateName}</strong>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB' }}>
                            {new Date(i.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280', display: 'block', marginBottom: '8px' }}>
                          {i.jobTitle}
                        </span>
                        {i.meetingLink && (
                          <a href={i.meetingLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', width: '100%', textAlign: 'center', display: 'block' }}>
                            🔗 Open Meeting Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Panel */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '20px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                  ⏳ Upcoming Engagements ({interviews.filter(i => i.status === 'Scheduled').length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {interviews.filter(i => i.status === 'Scheduled').slice(0, 4).map(i => (
                    <div key={i.id} style={{ padding: '10px 12px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <strong style={{ color: '#111827', display: 'block' }}>{i.candidateName}</strong>
                      <span style={{ color: '#6B7280', fontSize: '0.78rem' }}>{i.jobTitle} • {new Date(i.interviewDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ADMIN CONSOLE VIEW */}
      {activeTab === 'admin' && isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Company-wise statistics table */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Users size={20} color="#16A34A" />
              <h2 style={{ ...styles.cardTitle, color: '#111827' }}>Company-wise Platform Metrics</h2>
            </div>
            
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, color: '#111827' }}>Company Name</th>
                    <th style={{ ...styles.th, color: '#111827' }}>Applications</th>
                    <th style={{ ...styles.th, color: '#111827' }}>Interviews Scheduled</th>
                    <th style={{ ...styles.th, color: '#111827' }}>Confirmed</th>
                    <th style={{ ...styles.th, color: '#111827' }}>Selected (Offers)</th>
                    <th style={{ ...styles.th, color: '#111827' }}>Rejected</th>
                    <th style={{ ...styles.th, color: '#111827' }}>Pending Confirmation</th>
                    <th style={{ ...styles.th, color: '#111827' }}>On Hold</th>
                  </tr>
                </thead>
                <tbody>
                  {getCompanyStats().length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>
                        No company data available yet.
                      </td>
                    </tr>
                  ) : (
                    getCompanyStats().map((cs) => (
                      <tr key={cs.companyName} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ ...styles.td, fontWeight: 700, color: '#111827' }}>{cs.companyName}</td>
                        <td style={{ ...styles.td, color: '#374151', fontWeight: 600 }}>{cs.applicationsCount}</td>
                        <td style={{ ...styles.td, color: '#374151', fontWeight: 600 }}>{cs.interviewsScheduled}</td>
                        <td style={styles.td}>
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>{cs.confirmed}</span>
                        </td>
                        <td style={styles.td}>
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>{cs.selected}</span>
                        </td>
                        <td style={styles.td}>
                          <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>{cs.rejected}</span>
                        </td>
                        <td style={styles.td}>
                          <span className="badge badge-orange" style={{ fontSize: '0.75rem' }}>{cs.pending}</span>
                        </td>
                        <td style={styles.td}>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{cs.onHold}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SVG Comparative Chart */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <BarChart3 size={20} color="#2563EB" />
              <h2 style={{ ...styles.cardTitle, color: '#111827' }}>Hiring Funnel Comparison Chart</h2>
            </div>
            
            <div style={{ marginTop: '20px', height: 'auto', display: 'flex', justifyContent: 'center', padding: '10px' }}>
              {getCompanyStats().length === 0 ? (
                <div style={{ color: '#6B7280', fontSize: '0.9rem', padding: '30px' }}>
                  No metrics chart to display.
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: '640px' }}>
                  <svg viewBox={`0 0 500 ${Math.max(getCompanyStats().length * 60 + 50, 180)}`} style={{ width: '100%', height: '100%' }}>
                    {/* Legend */}
                    <g transform="translate(100, 10)">
                      <rect x="0" y="0" width="12" height="12" fill="#2563EB" rx="3" />
                      <text x="18" y="10" fill="#111827" fontSize="11" fontWeight="600">Applications Received</text>

                      <rect x="180" y="0" width="12" height="12" fill="#7C3AED" rx="3" />
                      <text x="198" y="10" fill="#111827" fontSize="11" fontWeight="600">Interviews Conducted</text>
                    </g>

                    {getCompanyStats().map((cs, idx) => {
                      const y = 45 + idx * 60;
                      const statsList = getCompanyStats();
                      const maxVal = Math.max(...statsList.map(c => Math.max(c.applicationsCount, c.interviewsScheduled)), 5);
                      const appWidth = (cs.applicationsCount / maxVal) * 280;
                      const intWidth = (cs.interviewsScheduled / maxVal) * 280;

                      return (
                        <g key={cs.companyName}>
                          {/* Company Name */}
                          <text x="10" y={y + 16} fill="#111827" fontSize="11" fontWeight="700" textAnchor="start">{cs.companyName}</text>
                          
                          {/* Applications Bar */}
                          <rect x="120" y={y - 2} width={Math.max(appWidth, 2)} height="12" fill="#2563EB" rx="3" />
                          <text x={128 + appWidth} y={y + 8} fill="#374151" fontSize="10" fontWeight="700">{cs.applicationsCount}</text>
                          
                          {/* Interviews Bar */}
                          <rect x="120" y={y + 14} width={Math.max(intWidth, 2)} height="12" fill="#7C3AED" rx="3" />
                          <text x={128 + intWidth} y={y + 24} fill="#374151" fontSize="10" fontWeight="700">{cs.interviewsScheduled}</text>

                          {/* Separator line */}
                          <line x1="10" y1={y + 38} x2="490" y2={y + 38} stroke="#E5E7EB" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="glass-panel" style={{ ...styles.card, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={22} color="#f59e0b" />
              <h2 style={{ ...styles.cardTitle, margin: 0 }}>Interview Calendar</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={handlePrevMonth}
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                ◀ Prev
              </button>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', minWidth: '150px', textAlign: 'center', color: '#111827' }}>
                {monthsList[currentMonth]} {currentYear}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Weekdays header */}
            {weekdays.map(day => (
              <div 
                key={day} 
                style={{ 
                  background: '#F8FAFC', 
                  padding: '10px', 
                  textAlign: 'center', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                {day}
              </div>
            ))}

            {/* Grid days */}
            {Array.from({ length: getStartDayOfWeek(currentMonth, currentYear) }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                style={{ 
                  background: '#F8FAFC', 
                  minHeight: '100px', 
                  padding: '8px' 
                }} 
              />
            ))}

            {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayInterviews = interviews.filter(i => {
                const d = new Date(i.interviewDate);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === dayNum;
              });
              const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

              return (
                <div 
                  key={`day-${dayNum}`} 
                  style={{ 
                    background: isToday ? 'rgba(0, 242, 254, 0.04)' : 'rgba(15, 23, 42, 0.6)', 
                    minHeight: '100px', 
                    padding: '8px',
                    border: isToday ? '1px solid var(--accent-cyan)' : 'none',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isToday ? 'var(--accent-cyan)' : '#6B7280', alignSelf: 'flex-start', marginBottom: '4px' }}>
                    {dayNum}
                  </span>
                  
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayInterviews.map(i => {
                      const timeStr = new Date(i.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div 
                          key={i.id}
                          onClick={(e) => { e.stopPropagation(); setViewingCalendarInt(i); }}
                          style={{
                            background: i.candidateConfirmation === 'Confirmed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 242, 254, 0.12)',
                            border: i.candidateConfirmation === 'Confirmed' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(0,242,254,0.3)',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            color: '#fff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left'
                          }}
                          title={`${i.candidateName} - ${i.jobTitle}`}
                        >
                          <strong>{timeStr}</strong> {i.candidateName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW CALENDAR EVENT DETAILS MODAL */}
      {viewingCalendarInt && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '500px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>Interview Details:</span>
                <h3 style={styles.modalTitle} className="text-gradient">{viewingCalendarInt.jobTitle}</h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewingCalendarInt(null)}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', color: '#6B7280', fontSize: '0.88rem', textAlign: 'left' }}>
              <div>
                <strong>Candidate Name:</strong> <span style={{ color: '#111827' }}>{viewingCalendarInt.candidateName}</span>
              </div>
              <div>
                <strong>Date & Time:</strong> <span style={{ color: '#111827' }}>{new Date(viewingCalendarInt.interviewDate).toLocaleString()}</span>
              </div>
              <div>
                <strong>Format / Mode:</strong> <span className={`badge ${viewingCalendarInt.format === 'Online' ? 'badge-purple' : 'badge-green'}`}>{viewingCalendarInt.format}</span>
              </div>

              {viewingCalendarInt.format === 'Online' ? (
                <div>
                  <strong>Meeting Link:</strong>{' '}
                  {viewingCalendarInt.meetingLink ? (
                    <a 
                      href={viewingCalendarInt.meetingLink.startsWith('http') ? viewingCalendarInt.meetingLink : `https://${viewingCalendarInt.meetingLink}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: '#2563EB', textDecoration: 'underline' }}
                    >
                      {viewingCalendarInt.meetingLink}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </div>
              ) : (
                <>
                  <div><strong>Company Name:</strong> {viewingCalendarInt.companyName || 'N/A'}</div>
                  <div><strong>Office Address:</strong> {viewingCalendarInt.officeAddress || 'N/A'}</div>
                  <div><strong>Venue:</strong> {viewingCalendarInt.venue || 'N/A'}</div>
                  <div><strong>Reporting Time:</strong> {viewingCalendarInt.reportingTime || 'N/A'}</div>
                  {viewingCalendarInt.dressCode && <div><strong>Dress Code:</strong> {viewingCalendarInt.dressCode}</div>}
                  {viewingCalendarInt.requiredDocuments && <div><strong>Required Documents:</strong> {viewingCalendarInt.requiredDocuments}</div>}
                </>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />

              <div>
                <strong>HR Contact Name:</strong> {viewingCalendarInt.hrName || 'N/A'}
              </div>
              {viewingCalendarInt.hrEmail && (
                <div>
                  <strong>HR Email:</strong> {viewingCalendarInt.hrEmail}
                </div>
              )}
              {viewingCalendarInt.hrPhone && (
                <div>
                  <strong>HR Phone:</strong> {viewingCalendarInt.hrPhone}
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Confirmation Status:</strong>
                <span className={`badge ${viewingCalendarInt.candidateConfirmation === 'Confirmed' ? 'badge-green' : viewingCalendarInt.candidateConfirmation === 'CannotAttend' ? 'badge-red' : 'badge-orange'}`}>
                  {viewingCalendarInt.candidateConfirmation || 'Pending'}
                </span>
              </div>

              <div>
                <strong>Evaluation Status:</strong>{' '}
                <span className={`badge ${viewingCalendarInt.status === 'Completed' ? 'badge-green' : 'badge-orange'}`}>
                  {viewingCalendarInt.status}
                </span>
              </div>

              {viewingCalendarInt.status === 'Completed' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>Result: {viewingCalendarInt.resultStatus || 'Completed'}</div>
                  {viewingCalendarInt.feedback && <div><strong>Feedback:</strong> {viewingCalendarInt.feedback}</div>}
                  {viewingCalendarInt.remarks && <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}><strong>Remarks:</strong> {viewingCalendarInt.remarks}</div>}
                </div>
              )}
            </div>

            <button 
              onClick={() => setViewingCalendarInt(null)}
              className="btn-secondary" 
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* AI INTERVIEW QUESTION GENERATOR MODAL */}
      {aiGenAppModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modal, maxWidth: '750px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#2563EB', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚡</span> AI Interview Questions Generator
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Targeted questions for <strong>{aiGenAppModal.candidateName}</strong> — Position: <strong>{aiGenAppModal.jobTitle}</strong>
                </span>
              </div>
              <button onClick={() => setAiGenAppModal(null)} style={styles.closeBtn}>×</button>
            </div>

            {loadingAiGenQuestions ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(0,242,254,0.2)', borderTopColor: '#2563EB', borderRadius: '50%', margin: '0 auto 16px auto' }} />
                <h4 style={{ color: '#111827', margin: '0 0 8px 0' }}>Generating AI Interview Questions...</h4>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>Analyzing candidate resume text, profile technical skills, and job requirements...</p>
              </div>
            ) : aiGenQuestionsResult ? (
              <div>
                {/* 1. Technical Questions (10) */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#2563EB', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💻</span> Technical Questions (10)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(aiGenQuestionsResult.technicalQuestions || aiGenQuestionsResult.questions?.filter((q: any) => q.category === 'Technical') || []).map((q: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{q.questionText}</div>
                        {q.rationale && <div style={{ color: '#6B7280', fontSize: '0.75rem', fontStyle: 'italic' }}>🎯 Rationale: {q.rationale}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. HR Questions (5) */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#8b5cf6', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👥</span> HR & Behavioral Questions (5)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(aiGenQuestionsResult.hrQuestions || aiGenQuestionsResult.questions?.filter((q: any) => q.category === 'HR') || []).map((q: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{q.questionText}</div>
                        {q.rationale && <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>🎯 Rationale: {q.rationale}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Scenario Questions (3) */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#f59e0b', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎯</span> Real-World Scenario Questions (3)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(aiGenQuestionsResult.scenarioQuestions || aiGenQuestionsResult.questions?.filter((q: any) => q.category === 'Scenario') || []).map((q: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{q.questionText}</div>
                        {q.rationale && <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>🎯 Rationale: {q.rationale}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {savingQuestionsNotice && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px' }}>
                    ✓ Questions saved successfully to Recruiter Evaluations.
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiQuestions(aiGenAppModal)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: '#8b5cf6', color: '#c084fc' }}
                  >
                    🔄 Regenerate Questions
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const questionsJson = JSON.stringify(aiGenQuestionsResult);
                      await apiRequest(`/applications/${aiGenAppModal.id}/notes`, 'PUT', {
                        notes: (aiGenAppModal.recruiterNotes ? aiGenAppModal.recruiterNotes + '\n\n' : '') + '[SAVED AI QUESTIONS]:\n' + JSON.stringify(aiGenQuestionsResult.questions || [], null, 2)
                      });
                      setSavingQuestionsNotice(true);
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    💾 Save Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiGenAppModal(null)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                Failed to load questions. Please click Regenerate.
                <div style={{ marginTop: '12px' }}>
                  <button onClick={() => handleGenerateAiQuestions(aiGenAppModal)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                    🔄 Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI HIRING DECISION ASSISTANT MODAL */}
      {aiHiringDecisionModalApp && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modal, maxWidth: '750px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#c084fc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧠</span> AI Hiring Decision Assistant
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Executive hiring decision analysis for <strong>{aiHiringDecisionModalApp.candidateName}</strong> — Position: <strong>{aiHiringDecisionModalApp.jobTitle}</strong>
                </span>
              </div>
              <button onClick={() => setAiHiringDecisionModalApp(null)} style={styles.closeBtn}>×</button>
            </div>

            {loadingAiHiringDecision ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(192,132,252,0.2)', borderTopColor: '#c084fc', borderRadius: '50%', margin: '0 auto 16px auto' }} />
                <h4 style={{ color: '#111827', margin: '0 0 8px 0' }}>Synthesizing Candidate Credentials & Evaluations...</h4>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>Evaluating match score, candidate resume, profile technical skills, and interview feedback...</p>
              </div>
            ) : aiHiringDecisionResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header Summary Stats Row */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Recommendation</span>
                    <span className={`badge ${
                      aiHiringDecisionResult.recommendation?.includes('Hire') || aiHiringDecisionResult.recommendation?.includes('Recommend')
                        ? (aiHiringDecisionResult.recommendation?.includes('Strongly') ? 'badge-green' : 'badge-purple')
                        : aiHiringDecisionResult.recommendation?.includes('Consider') ? 'badge-orange' : 'badge-red'
                    }`} style={{ fontSize: '0.95rem', padding: '4px 12px', marginTop: '4px', fontWeight: 'bold' }}>
                      {aiHiringDecisionResult.recommendation || 'Hire'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Confidence Score</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563EB' }}>
                      {aiHiringDecisionResult.confidenceScore || 90}% Confidence
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>AI Match Fit</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                      {aiHiringDecisionModalApp.matchingScore}% Fit
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ color: '#2563EB', fontSize: '0.9rem', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📋 Executive Summary
                  </h4>
                  <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                    {aiHiringDecisionResult.executiveSummary}
                  </p>
                </div>

                {/* Grid: Strengths & Skill Gaps */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Key Strengths */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '14px' }}>
                    <h4 style={{ color: '#10b981', fontSize: '0.85rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>✓</span> Key Candidate Strengths
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#6B7280', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      {(aiHiringDecisionResult.strengths || []).map((s: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Skill Gaps */}
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '14px' }}>
                    <h4 style={{ color: '#f59e0b', fontSize: '0.85rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span> Potential Skill Gaps / Onboarding Areas
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#6B7280', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      {(aiHiringDecisionResult.skillGaps || []).map((g: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendation Reasoning */}
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ color: '#c084fc', fontSize: '0.88rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎯</span> Recommendation Reasoning & Justification
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(aiHiringDecisionResult.reasoning || []).map((r: string, idx: number) => (
                      <div key={idx} style={{ color: '#e2e8f0', fontSize: '0.83rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#c084fc', fontWeight: 'bold' }}>•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {savingDecisionNotice && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    ✓ Executive Hiring Decision saved successfully to Recruiter Candidate Notes.
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateHiringDecision(aiHiringDecisionModalApp)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: '#c084fc', color: '#c084fc' }}
                  >
                    🔄 Regenerate Analysis
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const summaryNote = `[AI HIRING DECISION SUMMARY]:\nRecommendation: ${aiHiringDecisionResult.recommendation}\nConfidence: ${aiHiringDecisionResult.confidenceScore}%\nExecutive Summary: ${aiHiringDecisionResult.executiveSummary}`;
                      await apiRequest(`/applications/${aiHiringDecisionModalApp.id}/notes`, 'PUT', {
                        notes: (aiHiringDecisionModalApp.recruiterNotes ? aiHiringDecisionModalApp.recruiterNotes + '\n\n' : '') + summaryNote
                      });
                      setSavingDecisionNotice(true);
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    💾 Save Decision to Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiHiringDecisionModalApp(null)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                Failed to generate hiring decision report.
                <div style={{ marginTop: '12px' }}>
                  <button onClick={() => handleGenerateHiringDecision(aiHiringDecisionModalApp)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                    🔄 Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPANY PROFILE TAB PANEL */}
      {activeTab === 'company' && (
        <div style={styles.grid}>
          <div className="glass-panel" style={{ ...styles.card, flex: 1, padding: '24px' }}>
            <div style={styles.cardHeader}>
              <Briefcase size={20} color="#10b981" />
              <h2 style={styles.cardTitle}>Manage Company Profile</h2>
            </div>
            
            {companyProfile ? (
              <form onSubmit={handleUpdateCompany} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Company Name</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Logo URL</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. https://example.com/logo.png"
                    value={editCompanyLogo}
                    onChange={(e) => setEditCompanyLogo(e.target.value)}
                  />
                  {editCompanyLogo && (
                    <div style={{ marginTop: '8px' }}>
                      <img src={editCompanyLogo} alt="Preview Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    </div>
                  )}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Industry</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="e.g. Technology, Healthcare, Finance"
                      value={editCompanyIndustry}
                      onChange={(e) => setEditCompanyIndustry(e.target.value)}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Website URL</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="e.g. https://google.com"
                      value={editCompanyWebsite}
                      onChange={(e) => setEditCompanyWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Location</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. San Francisco, CA / Bengaluru, India"
                    value={editCompanyLocation}
                    onChange={(e) => setEditCompanyLocation(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>About Company</label>
                  <textarea
                    className="glass-input"
                    rows={6}
                    placeholder="Describe company culture, vision, values..."
                    value={editCompanyAbout}
                    onChange={(e) => setEditCompanyAbout(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={savingCompany} style={{ justifyContent: 'center', backgroundColor: '#10b981', borderColor: '#10b981' }}>
                  {savingCompany ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            ) : (
              <div style={styles.emptyMsg}>Loading company profile...</div>
            )}
          </div>

          {/* Right Preview Pane */}
          {companyProfile && (
            <div className="glass-panel" style={{ ...styles.card, flex: 0.8, padding: '24px', alignSelf: 'flex-start' }}>
              <div style={styles.cardHeader}>
                <FileText size={20} color="#2563EB" />
                <h2 style={styles.cardTitle}>Live Profile Preview</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', color: '#6B7280', fontSize: '0.9rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                  {editCompanyLogo ? (
                    <img src={editCompanyLogo} alt={editCompanyName} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem', color: 'var(--accent-cyan)' }}>
                      {editCompanyName ? editCompanyName.charAt(0) : 'C'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{editCompanyName || 'Company Name'}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>🏢 {editCompanyIndustry || 'Industry'}</span>
                  </div>
                </div>

                {editCompanyWebsite && (
                  <div>
                    <strong>Website:</strong>{' '}
                    <a href={editCompanyWebsite.startsWith('http') ? editCompanyWebsite : `https://${editCompanyWebsite}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', textDecoration: 'underline' }}>
                      {editCompanyWebsite}
                    </a>
                  </div>
                )}

                {editCompanyLocation && (
                  <div>
                    <strong>Location:</strong> {editCompanyLocation}
                  </div>
                )}

                {editCompanyAbout && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                    <strong>About:</strong>
                    <p style={{ margin: '6px 0 0 0', lineHeight: 1.5, fontSize: '0.85rem', color: '#6B7280' }}>{editCompanyAbout}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECRUITMENT ANALYTICS DASHBOARD TAB PANEL */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top KPI Cards */}
          <div style={styles.statsGrid}>
            <DashboardCard
              title="Total Applications"
              value={applications.length}
              icon={<Users size={20} color="#2563EB" />}
              subtext="Total Resumes Received"
            />
            <DashboardCard
              title="Average AI Match Score"
              value={applications.length > 0 ? Math.round(applications.reduce((acc, a) => acc + (a.matchingScore || 0), 0) / applications.length) + '%' : '0%'}
              icon={<Award size={20} color="#10b981" />}
              subtext="Candidate Quality Mean"
            />
            <DashboardCard
              title="Interview Shortlist Rate"
              value={applications.length > 0 ? Math.round((applications.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length / applications.length) * 100) + '%' : '0%'}
              icon={<Calendar size={20} color="#8b5cf6" />}
              subtext="Candidates Advanced"
            />
            <DashboardCard
              title="Placement Offer Rate"
              value={applications.length > 0 ? Math.round((applications.filter(a => a.status === 'Offered').length / applications.length) * 100) + '%' : '0%'}
              icon={<TrendingUp size={20} color="#f59e0b" />}
              subtext="Offer Issuance Ratio"
            />
          </div>

          {/* Grid Layout: Hiring Funnel + AI Match Tier Distribution */}
          <div style={styles.grid}>
            {/* Hiring Funnel Breakdown */}
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <TrendingUp size={20} color="#2563EB" />
                <h2 style={styles.cardTitle}>Hiring Funnel Stage Conversion</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { stage: 'Applied', count: applications.filter(a => a.status === 'Applied').length, color: '#2563EB' },
                  { stage: 'Reviewing', count: applications.filter(a => a.status === 'Reviewing').length, color: '#3b82f6' },
                  { stage: 'Interviewing', count: applications.filter(a => a.status === 'Interviewing').length, color: '#8b5cf6' },
                  { stage: 'Offered', count: applications.filter(a => a.status === 'Offered').length, color: '#10b981' },
                  { stage: 'Hired', count: applications.filter(a => a.status === 'Offered' && a.offerStatus === 'Accepted').length, color: '#22c55e' },
                ].map((item) => {
                  const pct = applications.length > 0 ? Math.round((item.count / applications.length) * 100) : 0;
                  return (
                    <div key={item.stage} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6B7280' }}>
                        <span style={{ fontWeight: 600 }}>{item.stage}</span>
                        <span>{item.count} candidates ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendation Tiers Breakdown */}
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <Award size={20} color="#10b981" />
                <h2 style={styles.cardTitle}>AI Match Score Tier Distribution</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {[
                  { tier: '⭐ Highly Recommended (95-100)', count: applications.filter(a => a.matchingScore >= 95).length, badgeClass: 'badge-green', color: '#10b981' },
                  { tier: '👍 Recommended (85-94)', count: applications.filter(a => a.matchingScore >= 85 && a.matchingScore < 95).length, badgeClass: 'badge-purple', color: '#8b5cf6' },
                  { tier: '💡 Consider (70-84)', count: applications.filter(a => a.matchingScore >= 70 && a.matchingScore < 85).length, badgeClass: 'badge-orange', color: '#f59e0b' },
                  { tier: '⚠️ Not Recommended (<70)', count: applications.filter(a => a.matchingScore < 70).length, badgeClass: 'badge-red', color: '#ef4444' },
                ].map((item) => {
                  const pct = applications.length > 0 ? Math.round((item.count / applications.length) * 100) : 0;
                  return (
                    <div key={item.tier} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{item.tier}</span>
                        <span style={{ color: '#6B7280' }}>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pure SVG Monthly Application Trend Curve */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <BarChart3 size={20} color="#8b5cf6" />
              <h2 style={styles.cardTitle}>Monthly Application Trend</h2>
            </div>
            <div style={{ marginTop: '20px', padding: '10px 0' }}>
              {(() => {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const now = new Date();
                const trendData = [];
                for (let i = 5; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const mName = months[d.getMonth()];
                  const count = applications.filter(a => {
                    const appDate = new Date(a.appliedAt);
                    return appDate.getMonth() === d.getMonth() && appDate.getFullYear() === d.getFullYear();
                  }).length;
                  trendData.push({ label: mName, count });
                }

                const maxCount = Math.max(...trendData.map(t => t.count), 5);
                const points = trendData.map((t, idx) => {
                  const x = 50 + idx * 90;
                  const y = 160 - (t.count / maxCount) * 120;
                  return `${x},${y}`;
                }).join(' ');

                const areaPoints = `50,160 ${points} ${50 + (trendData.length - 1) * 90},160`;

                return (
                  <svg viewBox="0 0 550 200" style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[40, 80, 120, 160].map((gh) => (
                      <line key={gh} x1="40" y1={gh} x2="520" y2={gh} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                    ))}

                    {/* Filled Area */}
                    <polygon points={areaPoints} fill="url(#trend-grad)" />

                    {/* Trend Line */}
                    <polyline points={points} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points & X Labels */}
                    {trendData.map((t, idx) => {
                      const x = 50 + idx * 90;
                      const y = 160 - (t.count / maxCount) * 120;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="5" fill="#8b5cf6" stroke="#2563EB" strokeWidth="2" />
                          <text x={x} y={y - 10} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">{t.count}</text>
                          <text x={x} y="180" fill="#6B7280" fontSize="10" textAnchor="middle">{t.label}</text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Top Performing Jobs Table */}
          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <Briefcase size={20} color="#f59e0b" />
              <h2 style={styles.cardTitle}>Top Performing Job Vacancies</h2>
            </div>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Job Title</th>
                    <th style={styles.th}>Total Applications</th>
                    <th style={styles.th}>Avg AI Score</th>
                    <th style={styles.th}>Shortlisted</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>No active jobs to calculate role metrics.</td>
                    </tr>
                  ) : (
                    jobs.map((j) => {
                      const jApps = applications.filter(a => a.jobTitle === j.title || a.jobId === j.id);
                      const avgScore = jApps.length > 0 ? Math.round(jApps.reduce((acc, a) => acc + (a.matchingScore || 0), 0) / jApps.length) : 0;
                      const shortlisted = jApps.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length;

                      return (
                        <tr key={j.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: 'bold', color: '#111827' }}>{j.title}</td>
                          <td style={styles.td}>{jApps.length} candidates</td>
                          <td style={styles.td}>
                            <span className={`badge ${avgScore >= 80 ? 'badge-green' : avgScore >= 60 ? 'badge-purple' : 'badge-orange'}`}>
                              {avgScore}% Mean
                            </span>
                          </td>
                          <td style={styles.td}>{shortlisted} shortlisted</td>
                          <td style={styles.td}>
                            <span className={`badge ${j.status === 'Open' ? 'badge-green' : 'badge-red'}`}>
                              {j.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESUME PREVIEW MODAL */}
      {previewingResume && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '800px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ ...styles.modalHeader, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={styles.modalLabel}>Resume PDF Viewer</span>
                <h3 style={{ ...styles.modalTitle, margin: 0 }} className="text-gradient">
                  {previewingResume.includes('_') ? previewingResume.substring(previewingResume.indexOf('_') + 1) : previewingResume}
                </h3>
              </div>
              <button 
                style={styles.closeBtn} 
                onClick={() => setPreviewingResume(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* The PDF Preview Iframe Frame */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <iframe
                src={`http://localhost:5000/api/applications/resume/${previewingResume}`}
                title="Resume Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            <div style={{ flexShrink: 0, marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <a
                href={`http://localhost:5000/api/applications/resume/${previewingResume}?download=true`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
              >
                Download File
              </a>
              <button 
                type="button"
                onClick={() => setPreviewingResume(null)} 
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFER LETTER GENERATOR MODAL */}
      {generatingOfferApp && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '780px', width: '90%' }}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.modalLabel}>Enterprise AI Offer Letter Generator</span>
                  <span className={`badge ${
                    approvalState === 'Approved' ? 'badge-green' : 
                    approvalState === 'Pending Approval' ? 'badge-orange' : 
                    approvalState === 'Sent' ? 'badge-purple' : 'badge-cyan'
                  }`} style={{ fontSize: '0.7rem' }}>
                    Status: {approvalState}
                  </span>
                </div>
                <h3 style={styles.modalTitle} className="text-gradient">Candidate: {generatingOfferApp.candidateName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Position: {generatingOfferApp.jobTitle}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setGeneratingOfferApp(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                  onClick={() => handleGenerateAiOffer(false)}
                  disabled={loadingAiOffer}
                >
                  {loadingAiOffer ? 'Generating AI Offer...' : '⚡ Generate AI Offer'}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={() => setOfferMode(offerMode === 'edit' ? 'preview' : 'edit')}
                >
                  {offerMode === 'edit' ? '👀 Preview Offer' : '✏ Edit Text'}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#2563EB', color: '#2563EB' }}
                  onClick={() => {
                    setApprovalState('Draft');
                    alert("Draft offer letter saved locally.");
                  }}
                >
                  💾 Save Draft
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#f59e0b', color: '#f59e0b' }}
                  onClick={() => {
                    setApprovalState('Pending Approval');
                    alert("Offer submitted for HR manager approval.");
                  }}
                >
                  ✅ Submit for Approval
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: '#10b981', color: '#10b981' }}
                  onClick={() => {
                    setApprovalState('Approved');
                    alert("Offer letter approved by HR manager!");
                  }}
                >
                  ✔ Approve
                </button>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={handleDownloadOfferPdf}
              >
                🖨 Download PDF / Print
              </button>
            </div>

            <form onSubmit={handleSaveOfferLetter} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>
                  Offer Letter Content ({offerMode === 'edit' ? 'Editing Mode' : 'Live Formatted Preview'})
                </label>
                
                {offerMode === 'edit' ? (
                  <textarea
                    className="glass-input"
                    rows={14}
                    required
                    value={offerContent}
                    onChange={(e) => setOfferContent(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5, background: '#FFFFFF', color: '#111827', border: '1px solid #D1D5DB' }}
                  />
                ) : (
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', minHeight: '280px', maxHeight: '400px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'serif', fontSize: '0.9rem', color: '#111827', lineHeight: 1.6 }}>
                    {offerContent}
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setGeneratingOfferApp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                  📧 Send Offer to Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI ONBOARDING PREVIEW MODAL */}
      {onboardingModalApp && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '820px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>🚀 AI Employee Onboarding Package</span>
                <h3 style={styles.modalTitle} className="text-gradient">{onboardingModalApp.candidateName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Position: {onboardingModalApp.jobTitle}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setOnboardingModalApp(null)}>
                <X size={20} />
              </button>
            </div>

            {loadingOnboarding ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b5cf6' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>⚡ Synthesizing AI Onboarding & Pre-Joining Plan...</div>
                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Generating 30/60/90 Day Goals, First Day Agenda & Welcome Kit</div>
              </div>
            ) : onboardingResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
                {/* Welcome Message */}
                <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ color: '#c084fc', fontSize: '0.9rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎉</span> Personalized Welcome Message
                  </h4>
                  <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                    {onboardingResult.welcomeMessage}
                  </p>
                </div>

                {/* Grid: First Day Agenda & Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Agenda */}
                  <div style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '10px', padding: '14px' }}>
                    <h4 style={{ color: '#2563EB', fontSize: '0.85rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📅</span> First Day Agenda
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#6B7280', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      {(onboardingResult.firstDayAgenda || []).map((item: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Checklist */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '14px' }}>
                    <h4 style={{ color: '#10b981', fontSize: '0.85rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>☑️</span> Pre-Joining Checklist
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#6B7280', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      {(onboardingResult.checklist || []).map((item: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 30-60-90 Day Learning Plan */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px' }}>
                  <h4 style={{ color: '#f59e0b', fontSize: '0.9rem', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎯</span> 30-60-90 Day Strategic Plan
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>MONTH 1 (30 DAYS)</span>
                      <ul style={{ margin: 0, paddingLeft: '14px', color: '#6B7280', fontSize: '0.78rem' }}>
                        {(onboardingResult.learningPlan30Days || []).map((goal: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>MONTH 2 (60 DAYS)</span>
                      <ul style={{ margin: 0, paddingLeft: '14px', color: '#6B7280', fontSize: '0.78rem' }}>
                        {(onboardingResult.learningPlan60Days || []).map((goal: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>MONTH 3 (90 DAYS)</span>
                      <ul style={{ margin: 0, paddingLeft: '14px', color: '#6B7280', fontSize: '0.78rem' }}>
                        {(onboardingResult.learningPlan90Days || []).map((goal: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Manager Note & FAQs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h5 style={{ color: '#2563EB', fontSize: '0.82rem', margin: '0 0 6px 0' }}>💬 Manager Welcome Note</h5>
                    <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                      {onboardingResult.managerNote}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h5 style={{ color: '#f59e0b', fontSize: '0.82rem', margin: '0 0 6px 0' }}>❓ Pre-Joining FAQs</h5>
                    <ul style={{ margin: 0, paddingLeft: '14px', color: '#6B7280', fontSize: '0.78rem' }}>
                      {(onboardingResult.faqs || []).map((faq: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{faq}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {savingOnboardingNotice && (
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    ✓ AI Onboarding Plan & Welcome Kit saved and sent to candidate successfully.
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="button"
                    onClick={() => handleGenerateOnboarding(onboardingModalApp)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: '#c084fc', color: '#c084fc' }}
                  >
                    🔄 Regenerate Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSavingOnboardingNotice(true);
                      alert("Welcome package sent to candidate email!");
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    📧 Send Welcome Package to Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingModalApp(null)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ATS Resume Analysis Modal */}
      {atsModalApp && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827', fontWeight: 800 }}>
                  🎯 ATS Resume Analysis: {atsModalApp.candidateName}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                  Target Role: {atsModalApp.jobTitle}
                </span>
              </div>
              <button 
                onClick={() => setAtsModalApp(null)}
                style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {loadingAtsModal ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#2563EB' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Evaluating candidate resume against job requirements...</div>
              </div>
            ) : atsAnalysisData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                {/* Score Header Card */}
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      border: `6px solid ${atsAnalysisData.atsScore >= 90 ? '#16A34A' : atsAnalysisData.atsScore >= 70 ? '#2563EB' : atsAnalysisData.atsScore >= 50 ? '#D97706' : '#DC2626'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      color: '#111827',
                      background: '#FFFFFF'
                    }}>
                      {atsAnalysisData.atsScore}
                    </div>
                    <div>
                      <span className="badge" style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        padding: '4px 10px',
                        background: atsAnalysisData.atsScore >= 90 ? '#DCFCE7' : atsAnalysisData.atsScore >= 70 ? '#DBEAFE' : atsAnalysisData.atsScore >= 50 ? '#FEF3C7' : '#FEE2E2',
                        color: atsAnalysisData.atsScore >= 90 ? '#15803D' : atsAnalysisData.atsScore >= 70 ? '#1E40AF' : atsAnalysisData.atsScore >= 50 ? '#B45309' : '#B91C1C'
                      }}>
                        {atsAnalysisData.recruiterRecommendation || 'Recommended'}
                      </span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#6B7280' }}>
                        Keyword Match Density: <strong>{atsAnalysisData.keywordMatchPercentage}%</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewAtsAnalysis(atsModalApp)}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    🔄 Re-Analyze Resume
                  </button>
                </div>

                {/* Executive Summary */}
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#111827', fontWeight: 700 }}>Executive Resume Summary</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
                    {atsAnalysisData.executiveSummary}
                  </p>
                </div>

                {/* Skills Found vs Missing */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#16A34A', fontWeight: 700 }}>Detected Skills Found</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(atsAnalysisData.skillsDetected || []).map((s: string, idx: number) => (
                        <span key={idx} style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '4px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#DC2626', fontWeight: 700 }}>Missing Skills & Keywords</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(atsAnalysisData.missingSkills || []).map((s: string, idx: number) => (
                        <span key={idx} style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: '#7C3AED', fontWeight: 700 }}>Recruiter Actionable Improvement Suggestions</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                    {(atsAnalysisData.improvementSuggestions || []).map((sug: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{sug}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => setAtsModalApp(null)}
                    className="btn-primary"
                    style={{ padding: '6px 18px', fontSize: '0.85rem' }}
                  >
                    Close Analysis
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Complete Interview Outcome Modal */}
      {completingInterview && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>Submit Interview Evaluation:</span>
                <h3 style={styles.modalTitle} className="text-gradient">{completingInterview.candidateName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Role: {completingInterview.jobTitle}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setCompletingInterview(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>Outcome Status</label>
                <select
                  className="glass-input"
                  value={resultStatus}
                  onChange={(e) => setResultStatus(e.target.value)}
                  style={{ background: '#FFFFFF' }}
                >
                  <option value="Selected">Selected (Hire)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="OnHold">On Hold</option>
                  <option value="NextRound">Next Round</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>Evaluation Feedback</label>
                <textarea
                  required
                  rows={4}
                  className="glass-input"
                  placeholder="Summarize candidate technical performance, domain knowledge, soft skills..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>Internal Remarks</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Needs compensation approval, starts next month..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={completing}
                >
                  {completing ? 'Saving Evaluation...' : 'Submit Evaluation'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setCompletingInterview(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingApp && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>Schedule Interview For:</span>
                <h3 style={styles.modalTitle} className="text-gradient">{schedulingApp.candidateName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Role: {schedulingApp.jobTitle}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setSchedulingApp(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>Date and Time</label>
                <input
                  type="datetime-local"
                  required
                  className="glass-input"
                  value={intDate}
                  onChange={(e) => setIntDate(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>Format</label>
                <select
                  className="glass-input"
                  value={intFormat}
                  onChange={(e) => setIntFormat(e.target.value)}
                  style={{ background: '#FFFFFF' }}
                >
                  <option value="Online">Online / Video Call</option>
                  <option value="InPerson">In-Person Office Visit</option>
                </select>
              </div>

              {/* HR Contact Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.modalFormLabel}>HR Name</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. Sarah Jenkins"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.modalFormLabel}>HR Email</label>
                  <input
                    type="email"
                    required
                    className="glass-input"
                    placeholder="sarah.j@company.com"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>HR Phone</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  placeholder="+91 98765 43210"
                  value={hrPhone}
                  onChange={(e) => setHrPhone(e.target.value)}
                />
              </div>

              {/* Format-Specific Fields */}
              {intFormat === 'Online' ? (
                <div style={styles.formGroup}>
                  <label style={styles.modalFormLabel}>Google Meet / Teams / Zoom Link</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. meet.google.com/abc-defg-hij"
                    value={intLink}
                    onChange={(e) => setIntLink(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.modalFormLabel}>Company Name</label>
                      <input
                        type="text"
                        required
                        className="glass-input"
                        placeholder="e.g. Zoho Corporation"
                        value={intCompanyName}
                        onChange={(e) => setIntCompanyName(e.target.value)}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.modalFormLabel}>Reporting Time</label>
                      <input
                        type="text"
                        required
                        className="glass-input"
                        placeholder="e.g. 09:30 AM"
                        value={reportingTime}
                        onChange={(e) => setReportingTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.modalFormLabel}>Office Address</label>
                    <input
                      type="text"
                      required
                      className="glass-input"
                      placeholder="e.g. Estancia IT Park, Vallanchery, Tamil Nadu"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.modalFormLabel}>Venue / Block / Room</label>
                    <input
                      type="text"
                      required
                      className="glass-input"
                      placeholder="e.g. Block A, 3rd Floor Conference Room"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.modalFormLabel}>Dress Code</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Business Casual"
                        value={dressCode}
                        onChange={(e) => setDressCode(e.target.value)}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.modalFormLabel}>Required Documents</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="e.g. Resume copy, Govt ID card"
                        value={requiredDocuments}
                        onChange={(e) => setRequiredDocuments(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={styles.formGroup}>
                <label style={styles.modalFormLabel}>Interviewer Notes</label>
                <textarea
                  className="glass-input"
                  rows={3}
                  placeholder="Notes for the candidate or other panel members..."
                  value={intNotes}
                  onChange={(e) => setIntNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setSchedulingApp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={scheduling}>
                  <Send size={16} />
                  {scheduling ? 'Scheduling...' : 'AI Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Questions Viewer Modal */}
      {viewingQuestionsInt && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '680px' }}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>AI Suggested Questions For:</span>
                <h3 style={styles.modalTitle} className="text-gradient">{viewingQuestionsInt.candidateName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Role: {viewingQuestionsInt.jobTitle}</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewingQuestionsInt(null)}>
                <X size={20} />
              </button>
            </div>

            {savingQuestionsNotice && (
              <div style={{ background: '#10b981', color: '#fff', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.85rem' }}>
                ✓ Questions explicitly saved to interview record successfully!
              </div>
            )}

            <div style={styles.modalQuestionsList}>
              {parseAiQuestions(viewingQuestionsInt.ai_Questions || '').map((q: any, idx: number) => (
                <div key={idx} style={styles.qItem} className="glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={styles.qNum}>Question {idx + 1}</div>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{q.category || 'AI Question'}</span>
                  </div>
                  <p style={styles.qText}><Translate text={q.questionText} /></p>
                  <div style={styles.qRationaleBox}>
                    <strong>AI Rationale:</strong> <Translate text={q.rationale} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => handleGenerateAiQuestions({ id: viewingQuestionsInt.applicationId } as any)}
                disabled={loadingAiGenQuestions}
                style={{ fontSize: '0.85rem' }}
              >
                {loadingAiGenQuestions ? 'Regenerating...' : '🔄 Regenerate Questions'}
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  className="btn-primary"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontSize: '0.85rem' }}
                  onClick={async () => {
                    if (!viewingQuestionsInt) return;
                    const { error } = await apiRequest('/ai/save-questions', 'POST', {
                      interviewId: viewingQuestionsInt.id,
                      questionsJson: viewingQuestionsInt.ai_Questions
                    });
                    if (!error) {
                      setSavingQuestionsNotice(true);
                      setTimeout(() => setSavingQuestionsNotice(false), 3000);
                    }
                  }}
                >
                  💾 Save Questions
                </button>
                <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setViewingQuestionsInt(null)}>
                  Close
                </button>
              </div>
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
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6B7280',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  card: {
    padding: '32px',
    height: 'fit-content',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  formLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#6B7280',
    padding: '40px 0',
  },
  gridList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  jobItem: {
    padding: '20px',
  },
  jobItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  jobItemMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#6B7280',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #E5E7EB',
    background: '#F8FAFC',
  },
  th: {
    padding: '14px 16px',
    color: '#4B5563',
    fontWeight: '600',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #F1F5F9',
    fontSize: '0.95rem',
    color: '#111827',
  },
  tr: {
    background: '#FFFFFF',
  },
  statusSelect: {
    background: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    color: '#111827',
    padding: '6px 12px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  appDetailsBox: {
    background: '#F8FAFC',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    gap: '24px',
    border: '1px solid #E5E7EB',
  },
  boxTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  boxText: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
  },
  interviewCard: {
    padding: '24px',
  },
  interviewCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  interviewTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#111827',
  },
  interviewSubtitle: {
    fontSize: '0.85rem',
    color: '#6B7280',
  },
  interviewMetaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  interviewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#4B5563',
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '560px',
    padding: '36px',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#FFFFFF',
    color: '#111827',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  modalLabel: {
    fontSize: '0.85rem',
    color: '#6B7280',
    display: 'block',
    marginBottom: '4px',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalFormLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  },
  modalQuestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px',
  },
  qItem: {
    padding: '20px',
  },
  qNum: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  qText: {
    fontSize: '0.95rem',
    color: '#111827',
    fontWeight: '500',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  qRationaleBox: {
    fontSize: '0.85rem',
    background: '#F8FAFC',
    padding: '10px 14px',
    borderRadius: '6px',
    borderLeft: '3px solid #2563EB',
    color: '#4B5563',
  },
};
