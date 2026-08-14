import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../api';
import { 
  Search, MapPin, DollarSign, Calendar, FileText, Send, X, AlertCircle,
  Briefcase, Check, Bot, Globe, ShieldCheck, Star
} from 'lucide-react';
import { Translate } from '../components/Translate';
import { t } from '../i18n';

interface Job {
  id: number;
  recruiterName: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  salaryRange: string;
  status: string;
  createdAt: string;
  applicationDeadline?: string;
  companyId?: number;
}

export const JobListings: React.FC = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchWhat, setSearchWhat] = useState('');
  const [searchWhere, setSearchWhere] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDateLimit, setSelectedDateLimit] = useState('All');
  const [selectedSalaryLimit, setSelectedSalaryLimit] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const what = params.get('what');
    const where = params.get('where');
    const exp = params.get('exp');
    if (what) setSearchWhat(what);
    if (where) setSearchWhere(where);
    if (exp) setSelectedExperience(exp);
  }, [location.search]);
  
  // Accordion Sidebar filters (Multi-select arrays)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedTopCompanies, setSelectedTopCompanies] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStipends, setSelectedStipends] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState('All');

  // Popover Modals State
  const [activeModal, setActiveModal] = useState<'department' | 'location' | 'companyType' | 'stipend' | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  // Apply Form State
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [viewingCompany, setViewingCompany] = useState<any | null>(null);

  const handleViewCompany = async (companyId: number | null | undefined) => {
    if (!companyId) {
      alert("Company profile details are not available for this independent listing.");
      return;
    }
    const { data, error } = await apiRequest(`/companies/${companyId}`);
    if (!error && data) {
      setViewingCompany(data);
    } else {
      alert("Could not load company profile.");
    }
  };

  const isLoggedIn = !!localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user ? user.role : 'Candidate';

  const [themeTick, setThemeTick] = useState(0);

  const fetchUserApplications = async () => {
    if (localStorage.getItem('token') && userRole === 'Candidate') {
      const { data, error } = await apiRequest('/applications');
      if (!error && data) {
        setUserApplications(data);
      }
    }
  };

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const fetchSavedJobs = async () => {
    if (localStorage.getItem('token') && userRole === 'Candidate') {
      const { data, error } = await apiRequest('/jobs/saved');
      if (!error && data) {
        setSavedJobs(data);
      }
    }
  };

  const handleToggleSaveJob = async (jobId: number) => {
    if (!isLoggedIn) {
      alert("Please login as a candidate to save jobs.");
      return;
    }
    if (userRole !== 'Candidate') {
      alert("Only candidates can save jobs.");
      return;
    }

    const isSaved = savedJobs.some(sj => sj.id === jobId);
    if (isSaved) {
      const { error } = await apiRequest(`/jobs/${jobId}/save`, 'DELETE');
      if (!error) {
        setSavedJobs(prev => prev.filter(sj => sj.id !== jobId));
      } else {
        alert(error);
      }
    } else {
      const { error } = await apiRequest(`/jobs/${jobId}/save`, 'POST');
      if (!error) {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          setSavedJobs(prev => [...prev, job]);
        }
      } else {
        alert(error);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    if (isLoggedIn && userRole === 'Candidate') {
      fetchUserProfile();
      fetchUserApplications();
      fetchSavedJobs();
    }
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setThemeTick(prev => prev + 1);
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  // Clean light enterprise background for Find Jobs page
  useEffect(() => {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#F8FAFC';

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await apiRequest<Job[]>('/jobs');
    setLoading(false);
    if (!error && data) {
      setJobs(data);
      if (data.length > 0) {
        const queryParams = new URLSearchParams(window.location.search);
        const urlJobId = queryParams.get('jobId');
        const found = urlJobId ? data.find(j => j.id === parseInt(urlJobId)) : null;
        setSelectedJob(found || data[0]);
      }
    }
  };

  const fetchUserProfile = async () => {
    const { data, error } = await apiRequest('/auth/profile');
    if (!error && data) {
      setUserProfile(data);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setApplying(true);
    setMsg(null);

    const { data, error } = await apiRequest(`/applications/submit/${selectedJob.id}`, 'POST', {
      coverLetter,
    });

    setApplying(false);
    if (error) {
      setMsg({ text: error, error: true });
    } else {
      setMsg({ text: `Application submitted successfully! Your AI Job Fit Score is ${data.matchScore}%.`, error: false });
      setCoverLetter('');
      fetchUserApplications();
      setTimeout(() => {
        setShowApplyModal(false);
        setMsg(null);
      }, 3000);
    }
  };

  const handleFindJobsClick = () => {
    // Re-filter trigger or keep it simple as standard state updates trigger filtering
  };

  const clearAllFilters = () => {
    setSelectedType('All');
    setSelectedDateLimit('All');
    setSelectedSalaryLimit('All');
    setSelectedExperience('All');
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSelectedCompanyTypes([]);
    setSelectedWorkModes([]);
    setSelectedTopCompanies([]);
    setSelectedIndustries([]);
    setSelectedStipends([]);
    setSelectedEducation('All');
    setSearchWhat('');
    setSearchWhere('');
  };

  // Helper to parse salary value from string
  const parseSalaryValue = (salaryStr: string): number => {
    if (!salaryStr) return 0;
    const firstPart = salaryStr.split('-')[0];
    const digits = firstPart.replace(/[^\d]/g, '');
    return parseInt(digits, 10) || 0;
  };

  // Helper to parse experience required from description/requirements
  const parseExperienceRequired = (reqs: string, desc: string): number => {
    const text = (reqs + " " + desc).toLowerCase();
    const match = text.match(/(\d+)\s*(?:-\s*\d+)?\s*(?:year|yr)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0; // Default freshers
  };

  const getDisplayTotalOpportunities = (): number => {
    // If no filters are selected, return the default base sum
    if (
      selectedDepartments.length === 0 &&
      selectedLocations.length === 0 &&
      selectedWorkModes.length === 0 &&
      selectedTopCompanies.length === 0 &&
      selectedIndustries.length === 0 &&
      selectedStipends.length === 0 &&
      selectedSalaryLimit === 'All' &&
      !searchWhat
    ) {
      return 27990;
    }

    // If department is selected
    if (selectedDepartments.length > 0) {
      let deptSum = 0;
      if (selectedDepartments.includes('Data Science & Analytics')) deptSum += 18706;
      if (selectedDepartments.includes('Engineering - Software & QA')) deptSum += 8152;
      if (selectedDepartments.includes('IT & Information Security')) deptSum += 578;
      if (selectedDepartments.includes('Sales & Business Development')) deptSum += 554;
      if (deptSum > 0) return deptSum;
    }

    // If work modes are selected
    if (selectedWorkModes.length > 0) {
      let modeSum = 0;
      if (selectedWorkModes.includes('Work from office')) modeSum += 22460;
      if (selectedWorkModes.includes('Hybrid')) modeSum += 3810;
      if (selectedWorkModes.includes('Remote')) modeSum += 1720;
      if (modeSum > 0) return modeSum;
    }

    // If locations are selected
    if (selectedLocations.length > 0) {
      let locSum = 0;
      if (selectedLocations.includes('Bengaluru')) locSum += 12850;
      if (selectedLocations.includes('Chennai')) locSum += 4120;
      if (selectedLocations.includes('Hyderabad')) locSum += 6840;
      if (selectedLocations.includes('Pune')) locSum += 4180;
      if (locSum > 0) return locSum;
    }

    // If companies are selected
    if (selectedTopCompanies.length > 0) {
      let compSum = 0;
      if (selectedTopCompanies.includes('Google')) compSum += 9830;
      if (selectedTopCompanies.includes('Microsoft')) compSum += 4520;
      if (selectedTopCompanies.includes('Wipro')) compSum += 8140;
      if (selectedTopCompanies.includes('Zoho')) compSum += 5500;
      if (compSum > 0) return compSum;
    }

    // Fallback scale mapping
    return filteredJobs.length * 950 + 12450;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesWhat = job.title.toLowerCase().includes(searchWhat.toLowerCase()) ||
                        job.description.toLowerCase().includes(searchWhat.toLowerCase()) ||
                        job.requirements.toLowerCase().includes(searchWhat.toLowerCase()) ||
                        (job.recruiterName && job.recruiterName.toLowerCase().includes(searchWhat.toLowerCase()));
    const matchesWhere = !searchWhere || job.location.toLowerCase().includes(searchWhere.toLowerCase());
    const matchesType = selectedType === 'All' || job.jobType === selectedType;
    
    // Date filter logic
    let matchesDate = true;
    if (selectedDateLimit !== 'All') {
      const createdDate = new Date(job.createdAt);
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - parseInt(selectedDateLimit, 10));
      matchesDate = createdDate >= limitDate;
    }

    // Salary filter logic
    let matchesSalary = true;
    if (selectedSalaryLimit !== 'All') {
      const val = parseSalaryValue(job.salaryRange);
      matchesSalary = val >= parseInt(selectedSalaryLimit, 10);
    }

    // Experience filter logic
    let matchesExp = true;
    if (selectedExperience !== 'All') {
      const reqExp = parseExperienceRequired(job.requirements, job.description);
      const userExp = parseInt(selectedExperience, 10);
      matchesExp = userExp >= reqExp;
    }

    // Multi-select Departments filter logic
    let matchesDept = true;
    if (selectedDepartments.length > 0) {
      matchesDept = selectedDepartments.some(dept => {
        const query = dept.toLowerCase();
        const title = job.title.toLowerCase();
        const desc = (job.description + " " + job.requirements).toLowerCase();
        if (query.includes('data science') || query.includes('analytics')) {
          return title.includes('data') || title.includes('analyst') || title.includes('ai') || title.includes('ml');
        }
        if (query.includes('software') || query.includes('qa') || query.includes('engineering') || query.includes('developer')) {
          return title.includes('software') || title.includes('developer') || title.includes('qa') || title.includes('react') || title.includes('node') || title.includes('backend') || title.includes('product manager') || title.includes('engineer');
        }
        if (query.includes('it') || query.includes('security') || query.includes('information')) {
          return title.includes('it') || title.includes('security') || title.includes('devops') || title.includes('cloud') || title.includes('infrastructure');
        }
        if (query.includes('sales') || query.includes('business')) {
          return title.includes('sales') || title.includes('marketing') || title.includes('content') || title.includes('representative');
        }
        return title.includes(query) || desc.includes(query);
      });
    }

    // Multi-select Locations filter logic
    let matchesLoc = true;
    if (selectedLocations.length > 0) {
      matchesLoc = selectedLocations.some(loc => {
        const query = loc.toLowerCase();
        const jobLoc = job.location.toLowerCase();
        if (query.includes('bengaluru') || query.includes('bangalore')) {
          return jobLoc.includes('bangalore') || jobLoc.includes('bengaluru');
        }
        if (query.includes('delhi') || query.includes('ncr') || query.includes('noida') || query.includes('gurugram')) {
          return jobLoc.includes('delhi') || jobLoc.includes('noida') || jobLoc.includes('gurugram');
        }
        if (query.includes('mumbai')) {
          return jobLoc.includes('mumbai');
        }
        return jobLoc.includes(query);
      });
    }

    // Multi-select Company Types filter logic
    let matchesCompType = true;
    if (selectedCompanyTypes.length > 0) {
      matchesCompType = selectedCompanyTypes.some(type => {
        const name = job.recruiterName.toLowerCase();
        if (type === 'Foreign MNC') return name.includes('google') || name.includes('microsoft') || name.includes('amazon');
        if (type === 'Indian MNC') return name.includes('tcs') || name.includes('wipro') || name.includes('infosys') || name.includes('zoho');
        if (type === 'Startup') return name.includes('flipkart') || name.includes('vigyanshaala') || name.includes('curie');
        return true;
      });
    }

    // Multi-select Work Modes filter logic
    let matchesWorkMode = true;
    if (selectedWorkModes.length > 0) {
      matchesWorkMode = selectedWorkModes.some(mode => {
        if (mode === 'Remote') return job.jobType === 'Remote' || job.location.toLowerCase().includes('remote') || job.description.toLowerCase().includes('remote');
        if (mode === 'Hybrid') return job.location.toLowerCase().includes('hybrid') || job.description.toLowerCase().includes('hybrid');
        if (mode === 'Work from office') return !job.location.toLowerCase().includes('remote') && !job.location.toLowerCase().includes('hybrid') && !job.description.toLowerCase().includes('remote') && !job.description.toLowerCase().includes('hybrid');
        return true;
      });
    }

    // Multi-select Top Companies filter logic
    let matchesTopComp = true;
    if (selectedTopCompanies.length > 0) {
      matchesTopComp = selectedTopCompanies.some(comp => 
        job.recruiterName.toLowerCase().includes(comp.toLowerCase())
      );
    }

    // Multi-select Industries filter logic
    let matchesInd = true;
    if (selectedIndustries.length > 0) {
      matchesInd = selectedIndustries.some(ind => {
        const text = (job.title + " " + job.description).toLowerCase();
        if (ind === 'IT') return text.includes('software') || text.includes('it') || text.includes('web') || text.includes('developer');
        if (ind === 'Recruitment') return text.includes('recruiting') || text.includes('hr') || text.includes('talent');
        if (ind === 'Finance') return text.includes('financial') || text.includes('bank') || text.includes('finance') || text.includes('accounting') || job.recruiterName.toLowerCase().includes('tcs') || job.recruiterName.toLowerCase().includes('wipro');
        return true;
      });
    }

    // Multi-select Stipends filter logic
    let matchesStipend = true;
    if (selectedStipends.length > 0) {
      matchesStipend = selectedStipends.some(stipend => {
        const val = parseSalaryValue(job.salaryRange); // annual value, e.g. 600000
        const monthlyEst = val / 12;
        if (stipend === 'Unpaid') return job.salaryRange.toLowerCase().includes('unpaid') || val === 0;
        if (stipend === '0-10k') return monthlyEst > 0 && monthlyEst <= 10000;
        if (stipend === '10k-20k') return monthlyEst > 10000 && monthlyEst <= 20000;
        if (stipend === '20k-30k') return monthlyEst > 20000 && monthlyEst <= 30000;
        if (stipend === '40k-50k') return monthlyEst > 30000 && monthlyEst <= 50000;
        if (stipend === '50k and above') return monthlyEst >= 50000 || val >= 600000;
        return true;
      });
    }

    // Education filter logic
    let matchesEdu = true;
    if (selectedEducation !== 'All') {
      matchesEdu = job.requirements.toLowerCase().includes(selectedEducation.toLowerCase());
    }

    return matchesWhat && matchesWhere && matchesType && matchesDate && matchesSalary && matchesExp && matchesDept && matchesLoc && matchesCompType && matchesWorkMode && matchesTopComp && matchesInd && matchesStipend && matchesEdu && job.status === 'Open';
  });

  // Auto-select first matching job on filter update
  useEffect(() => {
    if (filteredJobs.length > 0) {
      const exists = filteredJobs.some(j => j.id === selectedJob?.id);
      if (!exists) {
        setSelectedJob(filteredJobs[0]);
      }
    } else {
      setSelectedJob(null);
    }
  }, [searchWhat, searchWhere, selectedType, selectedDateLimit, selectedSalaryLimit, selectedExperience, jobs]);

  // Dynamically compute stable review ratings for well-known tech companies
  const getIndeedRating = (company: string, jobId: number) => {
    if (company.includes("Google")) return { score: 4.5, count: "12,401 reviews" };
    if (company.includes("Microsoft")) return { score: 4.4, count: "8,912 reviews" };
    if (company.includes("Zoho")) return { score: 4.2, count: "412 reviews" };
    if (company.includes("TCS")) return { score: 3.9, count: "45,892 reviews" };
    if (company.includes("Infosys")) return { score: 3.8, count: "38,124 reviews" };
    if (company.includes("Wipro")) return { score: 3.7, count: "29,401 reviews" };
    if (company.includes("Amazon")) return { score: 4.3, count: "18,924 reviews" };
    if (company.includes("Flipkart")) return { score: 4.1, count: "1,204 reviews" };
    
    // Stable fallback hash
    const seed = (jobId * 7) % 5;
    const score = (3.8 + seed * 0.1).toFixed(1);
    const count = (120 + seed * 85) + " reviews";
    return { score: parseFloat(score), count };
  };

  const naukriCategories = [
    { label: 'Remote Jobs', action: () => { setSelectedType('Remote'); setSearchWhat(''); setSearchWhere(''); } },
    { label: 'Software Engineer', action: () => { setSearchWhat('Engineer'); } },
    { label: 'Bangalore Hub', action: () => { setSearchWhere('Bangalore'); } },
    { label: 'Chennai Hub', action: () => { setSearchWhere('Chennai'); } },
    { label: 'Freshers', action: () => { setSelectedExperience('0'); } },
  ];

  const featuredBrands = [
    { name: 'Google', rating: 4.5, logoColor: '#4285F4' },
    { name: 'Microsoft', rating: 4.4, logoColor: '#F25022' },
    { name: 'Amazon', rating: 4.3, logoColor: '#FF9900' },
    { name: 'Zoho', rating: 4.2, logoColor: '#00A859' },
    { name: 'Wipro', rating: 3.7, logoColor: '#8b5cf6' },
  ];

  return (
    <div style={styles.container}>
      
      {/* ENTERPRISE SEARCH BAR SECTION */}
      <div style={styles.searchBarSection}>
        <div style={styles.searchBarContainer}>
          {/* Field 1: Skills/Designation */}
          <div style={styles.searchFieldWrapper}>
            <span style={styles.searchLabel}>Job Title or Skills</span>
            <div style={styles.inputWrapper}>
              <Search size={18} color="#6B7280" />
              <input
                type="text"
                placeholder="Title, skills, or company"
                value={searchWhat}
                onChange={(e) => setSearchWhat(e.target.value)}
                style={styles.searchFieldInput}
              />
            </div>
          </div>
          <div style={styles.searchFieldDivider}></div>
          
          {/* Field 2: Location */}
          <div style={styles.searchFieldWrapper}>
            <span style={styles.searchLabel}>Location</span>
            <div style={styles.inputWrapper}>
              <MapPin size={18} color="#6B7280" />
              <input
                type="text"
                placeholder="City, state, or remote"
                value={searchWhere}
                onChange={(e) => setSearchWhere(e.target.value)}
                style={styles.searchFieldInput}
              />
            </div>
          </div>
          <div style={styles.searchFieldDivider}></div>
          
          {/* Field 3: Experience Dropdown */}
          <div style={styles.searchFieldWrapper}>
            <span style={styles.searchLabel}>Experience Level</span>
            <div style={styles.inputWrapper}>
              <Briefcase size={18} color="#6B7280" />
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                style={styles.searchFieldSelect}
              >
                <option value="All">Any Experience</option>
                <option value="0">Fresher (0 years)</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="5">5 years</option>
                <option value="8">8 years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
          </div>
          
          <button className="btn-primary" style={styles.findJobsBtn} onClick={handleFindJobsClick}>
            Search Jobs
          </button>
        </div>

        {/* QUICK CATEGORIES BADGES */}
        <div style={styles.quickBadgesRow}>
          {naukriCategories.map((cat, i) => (
            <button key={i} onClick={cat.action} style={styles.quickBadge}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* TOP COMPANIES HIRING NOW */}
        <div style={styles.brandsContainer}>
          <span style={styles.brandsLabel}>Featured hiring partners:</span>
          <div style={styles.brandsRow}>
            {featuredBrands.map((brand, i) => (
              <button 
                key={i} 
                onClick={() => setSearchWhat(brand.name)} 
                style={styles.brandCard}
              >
                <strong style={{ color: '#111827', fontSize: '0.85rem' }}>{brand.name}</strong>
                <span style={styles.brandRating}>★ {brand.rating}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Indeed Filter Options */}
        <div style={styles.filterOptionsRow}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.filterDropdown}
          >
            <option value="All">Job Type: All</option>
            <option value="FullTime">Full-time</option>
            <option value="PartTime">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>
          <select
            value={selectedDateLimit}
            onChange={(e) => setSelectedDateLimit(e.target.value)}
            style={styles.filterDropdown}
          >
            <option value="All">Date Posted: All</option>
            <option value="1">Last 24 hours</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
          </select>
          <select
            value={selectedSalaryLimit}
            onChange={(e) => setSelectedSalaryLimit(e.target.value)}
            style={styles.filterDropdown}
          >
            <option value="All">Salary Estimate: All</option>
            <option value="500000">₹5,00,000+ a year</option>
            <option value="1000000">₹10,00,000+ a year</option>
            <option value="2000000">₹20,00,000+ a year</option>
          </select>
        </div>
      </div>

      {/* NAUKRI 3-COLUMN SPLIT LAYOUT */}
      {loading ? (
        <div style={styles.center}>Loading job opportunities...</div>
      ) : (
        <div style={styles.splitPaneContainer}>
          
          {/* Column 1: Left Filters Sidebar */}
          <div style={styles.filterSidebar} className="glass-panel">
            <div style={styles.sidebarHeader}>
              <strong style={styles.sidebarTitle}>All Filters</strong>
              {(selectedDepartments.length > 0 || selectedLocations.length > 0 || selectedCompanyTypes.length > 0 || selectedWorkModes.length > 0 || selectedTopCompanies.length > 0 || selectedIndustries.length > 0 || selectedStipends.length > 0 || selectedType !== 'All' || selectedDateLimit !== 'All' || selectedSalaryLimit !== 'All' || selectedExperience !== 'All' || selectedEducation !== 'All') && (
                <button onClick={clearAllFilters} style={styles.clearBtn}>Clear All</button>
              )}
            </div>

            {/* Department Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Department</span>
              <div style={styles.accordionContent}>
                {[
                  { name: 'Data Science & Analytics', count: 18706 },
                  { name: 'Engineering - Software & QA', count: 8152 },
                  { name: 'IT & Information Security', count: 578 },
                  { name: 'Sales & Business Development', count: 554 }
                ].map((dept) => {
                  const isChecked = selectedDepartments.includes(dept.name);
                  return (
                    <label key={dept.name} style={styles.filterCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedDepartments(prev => 
                            isChecked ? prev.filter(d => d !== dept.name) : [...prev, dept.name]
                          );
                        }}
                        style={styles.checkboxElement}
                      />
                      <span>{dept.name}</span>
                    </label>
                  );
                })}
                <button onClick={() => { setModalSearchQuery(''); setActiveModal('department'); }} style={styles.viewMoreBtn}>
                  View More
                </button>
              </div>
            </div>

            {/* Experience Slider Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Experience</span>
              <div style={styles.accordionContent}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selectedExperience === 'All' ? 10 : parseInt(selectedExperience, 10)}
                  onChange={(e) => setSelectedExperience(e.target.value === '10' ? 'All' : e.target.value)}
                  style={styles.sliderRange}
                />
                <div style={styles.sliderLabels}>
                  <span>0 Yrs</span>
                  <span>{selectedExperience === 'All' ? 'Any' : `${selectedExperience} Yrs`}</span>
                </div>
              </div>
            </div>

            {/* Location Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Location</span>
              <div style={styles.accordionContent}>
                {[
                  { name: 'Bengaluru', count: 12850 },
                  { name: 'Chennai', count: 4120 },
                  { name: 'Hyderabad', count: 6840 },
                  { name: 'Pune', count: 4180 }
                ].map((loc) => {
                  const isChecked = selectedLocations.includes(loc.name);
                  return (
                    <label key={loc.name} style={styles.filterCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedLocations(prev => 
                            isChecked ? prev.filter(l => l !== loc.name) : [...prev, loc.name]
                          );
                        }}
                        style={styles.checkboxElement}
                      />
                      <span>{loc.name}</span>
                    </label>
                  );
                })}
                <button onClick={() => { setModalSearchQuery(''); setActiveModal('location'); }} style={styles.viewMoreBtn}>
                  View More
                </button>
              </div>
            </div>

            {/* Work Mode Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Work mode</span>
              <div style={styles.accordionContent}>
                {[
                  { name: 'Work from office', count: 22460 },
                  { name: 'Hybrid', count: 3810 },
                  { name: 'Remote', count: 1720 }
                ].map((mode) => {
                  const isChecked = selectedWorkModes.includes(mode.name);
                  return (
                    <label key={mode.name} style={styles.filterCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedWorkModes(prev => 
                            isChecked ? prev.filter(m => m !== mode.name) : [...prev, mode.name]
                          );
                        }}
                        style={styles.checkboxElement}
                      />
                      <span>{mode.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Top Companies Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Top companies</span>
              <div style={styles.accordionContent}>
                {[
                  { name: 'Google', count: 9830 },
                  { name: 'Microsoft', count: 4520 },
                  { name: 'Wipro', count: 8140 },
                  { name: 'Zoho', count: 5500 }
                ].map((comp) => {
                  const isChecked = selectedTopCompanies.includes(comp.name);
                  return (
                    <label key={comp.name} style={styles.filterCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedTopCompanies(prev => 
                            isChecked ? prev.filter(c => c !== comp.name) : [...prev, comp.name]
                          );
                        }}
                        style={styles.checkboxElement}
                      />
                      <span>{comp.name}</span>
                    </label>
                  );
                })}
                <button onClick={() => { setModalSearchQuery(''); setActiveModal('companyType'); }} style={styles.viewMoreBtn}>
                  View More
                </button>
              </div>
            </div>

            {/* Industry Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Industry</span>
              <div style={styles.accordionContent}>
                {[
                  { label: 'IT Services & Cons.', val: 'IT', count: 22860 },
                  { label: 'Recruitment / Staffing', val: 'Recruitment', count: 3120 },
                  { label: 'Financial Services', val: 'Finance', count: 2010 }
                ].map((ind) => {
                  const isChecked = selectedIndustries.includes(ind.val);
                  return (
                    <label key={ind.val} style={styles.filterCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedIndustries(prev => 
                            isChecked ? prev.filter(i => i !== ind.val) : [...prev, ind.val]
                          );
                        }}
                        style={styles.checkboxElement}
                      />
                      <span>{ind.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Stipends / Salary Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Stipend</span>
              <div style={styles.accordionContent}>
                {[
                  { name: 'Unpaid', count: 251 },
                  { name: '0-10k', count: 4 },
                  { name: '10k-20k', count: 12 },
                  { name: '20k-30k', count: 5 }
                ].map((stipend) => {
                  const isChecked = selectedStipends.includes(stipend.name);
                  return (
                    <label key={stipend.name} style={styles.filterCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedStipends(prev => 
                            isChecked ? prev.filter(s => s !== stipend.name) : [...prev, stipend.name]
                          );
                        }}
                        style={styles.checkboxElement}
                      />
                      <span>{stipend.name}</span>
                    </label>
                  );
                })}
                <button onClick={() => { setModalSearchQuery(''); setActiveModal('stipend'); }} style={styles.viewMoreBtn}>
                  View More
                </button>
              </div>
            </div>

            {/* Education Accordion */}
            <div style={styles.accordionSection}>
              <span style={styles.accordionLabel}>Education</span>
              <div style={styles.accordionContent}>
                {[
                  { label: 'Any Postgraduate', query: 'Postgraduate' },
                  { label: 'M.Tech', query: 'M.Tech' },
                  { label: 'Any Graduate', query: 'Graduate' },
                  { label: 'B.Tech / B.E.', query: 'B.Tech' }
                ].map((edu, idx) => (
                  <label key={idx} style={styles.filterCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedEducation === edu.query}
                      onChange={() => setSelectedEducation(selectedEducation === edu.query ? 'All' : edu.query)}
                      style={styles.checkboxElement}
                    />
                    <span>{edu.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Middle Job Cards List */}
          <div style={styles.middlePane}>
            {/* Filter by Salary Ribbon */}
            <div style={styles.salaryRibbon}>
              <span style={styles.ribbonTitle}>₹ Filter jobs by salary</span>
              <div style={styles.ribbonCards}>
                {[
                  { label: '0-3 Lakhs', value: '300000' },
                  { label: '3-6 Lakhs', value: '600000' },
                  { label: '6-10 Lakhs', value: '1000000' },
                  { label: '10-15 Lakhs', value: '1500000' }
                ].map((card, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSalaryLimit(selectedSalaryLimit === card.value ? 'All' : card.value)}
                    style={{
                      ...styles.ribbonCard,
                      background: selectedSalaryLimit === card.value ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.01)',
                      borderColor: selectedSalaryLimit === card.value ? '#2563EB' : 'rgba(255,255,255,0.04)',
                      padding: '10px 16px',
                    }}
                  >
                    <span style={styles.ribbonCardLabel}>₹ {card.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Results metadata row */}
            <div style={styles.resultsHeaderRow}>
              <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#6B7280' }}>
                {searchWhat 
                  ? `${searchWhat} Opportunities`
                  : 'Recommended Opportunities'
                }
              </span>
            </div>

            {/* Middle Pane Listings Loop */}
            {filteredJobs.length === 0 ? (
              <div style={styles.noResultsBox}>
                <AlertCircle size={36} color="#6B7280" style={{ marginBottom: '12px' }} />
                <h3>No jobs match your search criteria.</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Try adjusting your filters or expanding your region.</p>
              </div>
            ) : (
              filteredJobs.map((job, idx) => {
                const rating = getIndeedRating(job.recruiterName, job.id);
                const isActive = selectedJob?.id === job.id;
                const firstChar = job.recruiterName ? job.recruiterName.charAt(0).toUpperCase() : 'J';
                const colors = ['#2563EB', '#8b5cf6', '#34d399', '#f43f5e', '#fbbf24'];
                const logoColor = colors[job.id % colors.length];

                return (
                  <React.Fragment key={job.id}>
                    {/* Dynamic Naukri Register CTA banner in the middle of listings */}
                    {idx === 2 && !isLoggedIn && (
                      <div style={styles.registerCtaBanner} className="glass-panel">
                        <div style={styles.ctaDetails}>
                          <h4 style={styles.ctaTitle}>Make the most out of RecruitNexus by registering for free!</h4>
                          <ul style={styles.ctaChecklist}>
                            <li>✓ Personalised recommendations</li>
                            <li>✓ Real-time updates</li>
                            <li>✓ Recruiters directly reach out</li>
                            <li>✓ Boost visibility</li>
                          </ul>
                          <a href="/register" className="btn-primary" style={styles.ctaButton}>
                            Register for free
                          </a>
                        </div>
                      </div>
                    )}

                    <div
                      onClick={() => setSelectedJob(job)}
                      className="glass-panel"
                      style={{
                        ...styles.jobCard,
                        borderColor: isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                        boxShadow: isActive ? '0 0 15px rgba(0, 242, 254, 0.15)' : 'none',
                      }}
                    >
                      <div style={styles.cardHeaderRow}>
                        {/* Company Logo placeholder on the left */}
                        <div style={{ ...styles.companyLogoBadge, color: logoColor, borderColor: logoColor, marginRight: '4px' }}>
                          {firstChar}
                        </div>

                        <div style={styles.cardInfoCol}>
                          <h3 style={styles.cardTitle}>{job.title}</h3>
                          <div style={styles.cardCompanyRow}>
                            <span 
                              style={{ ...styles.cardCompanyName, cursor: job.companyId ? 'pointer' : 'default', textDecoration: job.companyId ? 'underline' : 'none', color: job.companyId ? '#2563EB' : 'inherit' }}
                              onClick={(e) => { e.stopPropagation(); if (job.companyId) handleViewCompany(job.companyId); }}
                            >
                              {job.recruiterName}
                            </span>
                            <span style={styles.cardRating}>
                              ★ {rating.score} | <span style={{ color: '#6B7280', fontSize: '0.72rem' }}>{rating.count}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={styles.cardMetaRow}>
                        <span style={styles.metaItem}><Briefcase size={13} /> {parseExperienceRequired(job.requirements, job.description) || '0-2'} Yrs</span>
                        <span style={styles.metaItem}>₹ {job.salaryRange || 'Unpaid'}</span>
                        <span style={styles.metaItem}><MapPin size={13} /> {job.location}</span>
                      </div>

                      <div style={styles.cardExcerptRow}>
                        <FileText size={13} style={{ flexShrink: 0, marginTop: '2px', color: '#6B7280' }} />
                        <span style={styles.excerptText}>
                          {job.description.length > 130 ? `${job.description.slice(0, 130)}...` : job.description}
                        </span>
                      </div>

                      <div style={styles.cardSkillsRow}>
                        {job.requirements.split(',').slice(0, 3).map((req, i) => (
                          <span key={i} style={styles.skillTag}>
                            {req.trim()}
                          </span>
                        ))}
                      </div>

                      <div style={styles.cardFooter}>
                        {job.status === 'Closed' || (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) ? (
                          <span className="badge badge-red" style={{ fontSize: '0.72rem' }}>Closed</span>
                        ) : (
                          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Active</span>
                        )}
                        {(!isLoggedIn || userRole === 'Candidate') && (
                          <button 
                            style={{
                              ...styles.saveBtn,
                              backgroundColor: savedJobs.some(sj => sj.id === job.id) ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                              borderColor: savedJobs.some(sj => sj.id === job.id) ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
                              color: savedJobs.some(sj => sj.id === job.id) ? '#3b82f6' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }} 
                            onClick={(e) => { e.stopPropagation(); handleToggleSaveJob(job.id); }}
                          >
                            {savedJobs.some(sj => sj.id === job.id) ? '★ Saved' : '☆ Save'}
                          </button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Right Column: Sticky Job Details Panel */}
          <div style={styles.rightPane}>
            {selectedJob ? (
              <div className="glass-panel" style={styles.detailsStickyPanel}>
                <div style={styles.detailsHeader}>
                  <h2 style={styles.detailsTitle}>{selectedJob.title}</h2>
                  <div style={styles.detailsCompanyLine}>
                    <span 
                      style={{ ...styles.detailsCompanyName, cursor: selectedJob.companyId ? 'pointer' : 'default', textDecoration: selectedJob.companyId ? 'underline' : 'none', color: selectedJob.companyId ? '#2563EB' : 'inherit' }}
                      onClick={() => { if (selectedJob.companyId) handleViewCompany(selectedJob.companyId); }}
                    >
                      {selectedJob.recruiterName}
                    </span>
                    <span style={{ color: '#fbbf24' }}>
                      {getIndeedRating(selectedJob.recruiterName, selectedJob.id).score} ★
                    </span>
                  </div>
                  <div style={styles.detailsLocationLine}>{selectedJob.location}</div>
                  
                  <div style={styles.detailsSalaryBlock}>
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Salary / Compensation:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#22c55e', display: 'block', marginTop: '4px' }}>
                      {selectedJob.salaryRange || 'Undisclosed'}
                    </strong>
                  </div>

                  {selectedJob.applicationDeadline && (
                    <div style={{ ...styles.detailsSalaryBlock, marginTop: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Application Deadline:</span>
                      <strong style={{ fontSize: '0.95rem', color: new Date(selectedJob.applicationDeadline) < new Date() ? '#f87171' : '#fbbf24', display: 'block', marginTop: '4px' }}>
                        {new Date(selectedJob.applicationDeadline).toLocaleDateString()} {new Date(selectedJob.applicationDeadline) < new Date() ? '(Expired / Closed)' : ''}
                      </strong>
                    </div>
                  )}

                  <div style={styles.detailsHeaderActions}>
                    {selectedJob.status === 'Closed' || (selectedJob.applicationDeadline && new Date(selectedJob.applicationDeadline) < new Date()) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="btn-primary" style={{ ...styles.applyBtn, backgroundColor: '#ef4444', cursor: 'not-allowed' }} disabled>
                          Applications Closed
                        </button>
                        <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>
                          Applications Closed.
                        </span>
                      </div>
                    ) : isLoggedIn && userRole === 'Candidate' ? (
                      userApplications.some(app => app.jobId === selectedJob.id) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button className="btn-primary" style={{ ...styles.applyBtn, backgroundColor: '#475569', cursor: 'not-allowed' }} disabled>
                            Applied
                          </button>
                          <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>
                            You have already applied for this job.
                          </span>
                        </div>
                      ) : (
                        <button className="btn-primary" style={styles.applyBtn} onClick={() => setShowApplyModal(true)}>
                          Apply now
                        </button>
                      )
                    ) : !isLoggedIn ? (
                      <a href="/login" className="btn-primary" style={{ ...styles.applyBtn, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                        Login to Apply
                      </a>
                    ) : (
                      <span style={styles.recruiterBadge}>Recruiter Dashboard View</span>
                    )}
                    
                    {/* Inline Translate Widget */}
                    <div style={styles.translateWrapper}>
                      <Translate text="Translate Details" />
                    </div>
                  </div>
                </div>

                <div style={styles.detailsBody}>
                  {/* AI Fit Match report if candidate is logged in */}
                  {isLoggedIn && userRole === 'Candidate' && (
                    <div style={styles.aiMatchReportCard} className="badge-purple">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Bot size={18} color="#c084fc" />
                        <strong style={{ fontSize: '0.9rem', color: '#c084fc' }}>Gemini AI Candidate Fit Report</strong>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: '1.4' }}>
                        Your resume matches the core competencies required for this role. Submit your application to trigger the full compatibility report.
                      </p>
                    </div>
                  )}

                  <div style={styles.detailSection}>
                    <h4 style={styles.sectionHeader}>Job details</h4>
                    <div style={styles.jobInfoItem}>
                      <strong>Job Type:</strong>
                      <span>{selectedJob.jobType}</span>
                    </div>
                  </div>

                  <div style={styles.detailSection}>
                    <h4 style={styles.sectionHeader}>Full Job Description</h4>
                    <p style={styles.detailDescriptionText}>
                      <Translate text={selectedJob.description} />
                    </p>
                  </div>

                  <div style={styles.detailSection}>
                    <h4 style={styles.sectionHeader}>Requirements / Qualifications</h4>
                    <p style={styles.detailRequirementsText}>
                      <Translate text={selectedJob.requirements} />
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyDetailsPanel}>
                <Briefcase size={48} color="#6B7280" style={{ marginBottom: '16px' }} />
                <h3>Select a job to view details</h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', maxWidth: '360px', marginTop: '8px', lineHeight: '1.4' }}>
                  Click on any job card in the left list to see the full description, qualifications, and direct apply triggers.
                </p>
              </div>
            )}
          </div>
          
        </div>
      )}

      {/* Apply Modal */}
      {selectedJob && showApplyModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>Applying for:</span>
                <h3 style={styles.modalTitle} className="text-gradient">{selectedJob.title}</h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setShowApplyModal(false)}>
                <X size={20} />
              </button>
            </div>

            {userProfile && !userProfile.resumePath ? (
              <div style={styles.warningAlert} className="badge-orange">
                <AlertCircle size={18} />
                <div style={{ textAlign: 'left' }}>
                  <strong>Resume Required:</strong> You need to upload your resume in your{' '}
                  <a href="/dashboard" style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                    Dashboard
                  </a>{' '}
                  before applying.
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={styles.modalForm}>
                {msg && (
                  <div style={styles.modalAlert} className={msg.error ? 'badge-red' : 'badge-green'}>
                    <span>{msg.text}</span>
                  </div>
                )}
                
                <div style={styles.modalFormGroup}>
                  <label style={styles.modalFormLabel}>Cover Letter / Remarks (Optional)</label>
                  <textarea
                    className="glass-input"
                    rows={5}
                    placeholder={t('candidate_pitch')}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button type="button" className="btn-secondary" onClick={() => setShowApplyModal(false)}>
                    {t('cancel')}
                  </button>
                  <button type="submit" className="btn-primary" disabled={applying || !userProfile?.resumePath}>
                    <Send size={16} />
                    {applying ? 'Submitting...' : t('submit_app')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* COMPANY PROFILE MODAL */}
      {viewingCompany && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalContent, maxWidth: '600px', padding: '28px' }}>
            <div style={{ ...styles.modalHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {viewingCompany.logo ? (
                  <img src={viewingCompany.logo} alt={viewingCompany.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                    {viewingCompany.name.charAt(0)}
                  </div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ ...styles.modalTitle, margin: 0 }} className="text-gradient">{viewingCompany.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>🏢 {viewingCompany.industry || 'Tech Industry'}</span>
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewingCompany(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#6B7280', fontSize: '0.9rem', textAlign: 'left' }}>
              {viewingCompany.website && (
                <div>
                  <strong>Website:</strong>{' '}
                  <a href={viewingCompany.website.startsWith('http') ? viewingCompany.website : `https://${viewingCompany.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563EB', textDecoration: 'underline' }}>
                    {viewingCompany.website}
                  </a>
                </div>
              )}
              {viewingCompany.location && (
                <div>
                  <strong>Location:</strong> {viewingCompany.location}
                </div>
              )}
              {viewingCompany.about && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '4px' }}>
                  <strong>About the Company:</strong>
                  <p style={{ margin: '6px 0 0 0', lineHeight: 1.5, fontSize: '0.85rem', color: '#6B7280' }}>{viewingCompany.about}</p>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />

              <div>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#111827' }}>💼 Open Positions ({viewingCompany.openJobs?.length || 0})</strong>
                {viewingCompany.openJobs && viewingCompany.openJobs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {viewingCompany.openJobs.map((j: any) => (
                      <div 
                        key={j.id} 
                        style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#111827' }}>{j.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>📍 {j.location} | 💰 {j.salaryRange || 'Undisclosed'}</div>
                        </div>
                        <button 
                          onClick={() => { setSelectedJob(j); setViewingCompany(null); }}
                          className="btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>No open job listings at this time.</div>
                )}
              </div>
            </div>

            <button 
              onClick={() => setViewingCompany(null)}
              className="btn-secondary" 
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Visual popover overlay modal for Naukri search options */}
      {activeModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle} className="text-gradient">
                  {activeModal === 'department' && 'Select Department'}
                  {activeModal === 'location' && 'Select Location'}
                  {activeModal === 'companyType' && 'Select Company type'}
                  {activeModal === 'stipend' && 'Select Stipend'}
                </h3>
              </div>
              <button style={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Search box if Department or Company Type is selected */}
            {(activeModal === 'department' || activeModal === 'companyType') && (
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <Search size={16} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder={activeModal === 'department' ? 'Search Department' : 'Search Company type'}
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="glass-input"
                  style={{ width: '100%', paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
                />
              </div>
            )}

            <div style={styles.modalCheckboxGrid}>
              {/* Department Option Elements */}
              {activeModal === 'department' && [
                'Data Science & Analytics',
                'Engineering - Software & QA',
                'IT & Information Security',
                'Sales & Business Development',
                'Teaching & Training',
                'Product Management',
                'Marketing & Communication',
                'Consulting',
                'Project & Program Management',
                'Customer Success, Service & Operations',
                'Finance & Accounting',
                'Human Resources',
                'Production, Manufacturing',
                'BFSI, Investments & Trading',
                'Research & Development',
                'Engineering - Hardware & Networks',
                'UX, Design & Architecture',
                'Risk Management & Compliance',
                'Strategic & Top Management',
                'Healthcare & Life Sciences',
                'Procurement & Supply Chain',
                'Quality Assurance',
                'Content, Editorial & Journalism',
                'Construction & Engineering',
                'Administration & Facilities',
                'Legal & Regulatory',
                'Merchandising, Retail & eCommerce',
                'Food, Beverage & Hospitality',
                'Media Production & Entertainment'
              ].filter(dept => dept.toLowerCase().includes(modalSearchQuery.toLowerCase()))
               .map(dept => {
                 const isChecked = selectedDepartments.includes(dept);
                 return (
                   <label key={dept} style={styles.modalCheckboxLabel}>
                     <input
                       type="checkbox"
                       checked={isChecked}
                       onChange={() => {
                         setSelectedDepartments(prev => 
                           isChecked ? prev.filter(d => d !== dept) : [...prev, dept]
                         );
                       }}
                       style={styles.checkboxElement}
                     />
                     <span>{dept}</span>
                   </label>
                 );
               })}

              {/* Location Option Elements */}
              {activeModal === 'location' && [
                'Bengaluru',
                'Delhi / NCR',
                'Hyderabad',
                'Pune',
                'Mumbai (All Areas)',
                'Chennai',
                'Mumbai',
                'Gurugram',
                'Noida',
                'New Delhi',
                'Kolkata',
                'Ahmedabad',
                'Navi Mumbai',
                'Jaipur',
                'Indore',
                'Kochi',
                'Coimbatore',
                'Nagpur',
                'Mysuru',
                'India',
                'Bhubaneswar',
                'Mangaluru',
                'Hubli',
                'Belgaum',
                'Surat'
              ].map(loc => {
                const isChecked = selectedLocations.includes(loc);
                return (
                  <label key={loc} style={styles.modalCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedLocations(prev => 
                          isChecked ? prev.filter(l => l !== loc) : [...prev, loc]
                        );
                      }}
                      style={styles.checkboxElement}
                    />
                    <span>{loc}</span>
                  </label>
                );
              })}

              {/* Company Type Option Elements */}
              {activeModal === 'companyType' && [
                'Foreign MNC',
                'Corporate',
                'Indian MNC',
                'Startup',
                'Govt/PSU',
                'MNC',
                'Others'
              ].filter(type => type.toLowerCase().includes(modalSearchQuery.toLowerCase()))
               .map(type => {
                 const isChecked = selectedCompanyTypes.includes(type);
                 return (
                   <label key={type} style={styles.modalCheckboxLabel}>
                     <input
                       type="checkbox"
                       checked={isChecked}
                       onChange={() => {
                         setSelectedCompanyTypes(prev => 
                           isChecked ? prev.filter(t => t !== type) : [...prev, type]
                         );
                       }}
                       style={styles.checkboxElement}
                     />
                     <span>{type}</span>
                   </label>
                 );
               })}

              {/* Stipend Option Elements */}
              {activeModal === 'stipend' && [
                'Unpaid',
                '0-10k',
                '10k-20k',
                '20k-30k',
                '40k-50k',
                '50k and above'
              ].map(stipend => {
                const isChecked = selectedStipends.includes(stipend);
                return (
                  <label key={stipend} style={styles.modalCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedStipends(prev => 
                          isChecked ? prev.filter(s => s !== stipend) : [...prev, stipend]
                        );
                      }}
                      style={styles.checkboxElement}
                    />
                    <span>{stipend}</span>
                  </label>
                );
              })}
            </div>

            <div style={styles.modalActions}>
              <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ padding: '8px 24px' }}>
                Apply
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
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '24px 20px',
  },
  naukriHero: {
    textAlign: 'center',
    marginBottom: '36px',
    marginTop: '20px',
  },
  naukriTitle: {
    fontSize: '2.75rem',
    fontWeight: '800',
    marginBottom: '12px',
    letterSpacing: '-1px',
    color: '#111827',
    lineHeight: '1.2',
  },
  naukriSubtitle: {
    fontSize: '1.1rem',
    color: '#4B5563',
    maxWidth: '750px',
    margin: '0 auto 28px auto',
    lineHeight: '1.5',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    maxWidth: '960px',
    margin: '0 auto',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-card)',
  },
  statNumber: {
    display: 'block',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: '-0.5px',
  },
  statLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  searchFieldSelect: {
    background: 'none',
    border: 'none',
    color: '#111827',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  quickBadgesRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickBadge: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '20px',
    color: '#4B5563',
    padding: '6px 14px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  brandsContainer: {
    marginTop: '20px',
    padding: '12px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
    boxShadow: 'var(--shadow-card)',
  },
  brandsLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  brandsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  brandCard: {
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  brandRating: {
    fontSize: '0.78rem',
    color: '#D97706',
    fontWeight: 'bold',
  },
  searchBarSection: {
    marginBottom: '36px',
  },
  searchBarContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '12px',
    gap: '12px',
    border: '1px solid #6B7280',
    background: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
  },
  searchFieldWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '220px',
    padding: '4px 8px',
    textAlign: 'left',
  },
  searchLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchFieldInput: {
    background: 'none',
    border: 'none',
    color: '#111827',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
  },
  searchFieldDivider: {
    width: '1px',
    height: '40px',
    background: '#E5E7EB',
    alignSelf: 'center',
  },
  findJobsBtn: {
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    flexShrink: 0,
    background: '#2563EB',
    color: '#111827',
    fontWeight: 'bold',
    border: 'none',
  },
  filterOptionsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  filterDropdown: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 14px',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: "'Inter', sans-serif",
  },
  splitPaneContainer: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  filterSidebar: {
    width: '260px',
    flexShrink: 0,
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '20px',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
    textAlign: 'left',
    boxShadow: 'var(--shadow-card)',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '10px',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#111827',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#2563EB',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  accordionSection: {
    marginBottom: '20px',
  },
  accordionLabel: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '800',
    color: 'var(--text-primary, #6B7280)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  accordionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary, #6B7280)',
    cursor: 'pointer',
  },
  checkboxElement: {
    cursor: 'pointer',
  },
  sliderRange: {
    width: '100%',
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    color: '#6B7280',
    marginTop: '4px',
  },
  middlePane: {
    width: '490px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    flexShrink: 0,
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  salaryRibbon: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'left',
    boxShadow: 'var(--shadow-card)',
  },
  ribbonTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#4B5563',
    display: 'block',
    marginBottom: '10px',
  },
  ribbonCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  ribbonCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    padding: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFFFFF',
  },
  ribbonCardLabel: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#111827',
  },
  ribbonCardCount: {
    fontSize: '0.72rem',
    color: '#6B7280',
    marginTop: '2px',
  },
  resultsHeaderRow: {
    fontSize: '0.8rem',
    color: '#4B5563',
    fontWeight: 'bold',
    textAlign: 'left',
    paddingBottom: '2px',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  cardInfoCol: {
    flex: 1,
  },
  companyLogoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#F8FAFC',
    border: '2px solid #2563EB',
    color: '#2563EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  cardMetaRow: {
    display: 'flex',
    gap: '14px',
    color: '#4B5563',
    fontSize: '0.82rem',
    margin: '10px 0',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  cardExcerptRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    margin: '8px 0',
  },
  excerptText: {
    fontSize: '0.8rem',
    color: '#374151',
    lineHeight: '1.4',
  },
  cardSkillsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    margin: '10px 0',
  },
  skillTag: {
    background: '#F1F5F9',
    border: '1px solid #6B7280',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '0.75rem',
    color: '#374151',
    fontWeight: '500',
  },
  saveBtn: {
    background: 'none',
    border: 'none',
    color: '#4B5563',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    outline: 'none',
  },
  registerCtaBanner: {
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'left',
  },
  ctaDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  ctaTitle: {
    fontSize: '0.92rem',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.3',
  },
  ctaChecklist: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  ctaButton: {
    alignSelf: 'flex-start',
    padding: '6px 16px',
    fontSize: '0.78rem',
    borderRadius: '8px',
    marginTop: '6px',
    textAlign: 'center',
    textDecoration: 'none',
    background: '#2563EB',
    color: '#111827',
  },
  noResultsBox: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6B7280',
  },
  jobCard: {
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    boxShadow: 'var(--shadow-card)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.3',
    marginBottom: '6px',
  },
  cardCompanyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },
  cardCompanyName: {
    fontSize: '0.92rem',
    fontWeight: '700',
    color: '#1E293B',
  },
  cardRating: {
    fontSize: '0.8rem',
    color: '#D97706',
    fontWeight: 'bold',
  },
  cardLocation: {
    fontSize: '0.85rem',
    color: '#4B5563',
    marginBottom: '10px',
  },
  cardSalaryBadge: {
    display: 'inline-block',
    background: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #BBF7D0',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  cardTagsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  cardTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: '#F1F5F9',
    border: '1px solid #E5E7EB',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#4B5563',
  },
  cardDescriptionSnippet: {
    paddingLeft: '18px',
    margin: '0 0 16px 0',
    fontSize: '0.82rem',
    color: '#374151',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  snippetBullet: {
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #F1F5F9',
    paddingTop: '12px',
    fontSize: '0.78rem',
    color: '#6B7280',
  },
  postedTime: {
    color: '#6B7280',
  },
  matchBadge: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  rightPane: {
    flex: 1,
    position: 'sticky',
    top: '100px',
    minHeight: '600px',
  },
  detailsStickyPanel: {
    padding: '32px',
    borderRadius: '12px',
    textAlign: 'left',
    height: 'calc(100vh - 220px)',
    overflowY: 'auto',
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
    boxShadow: 'var(--shadow-card)',
  },
  detailsTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.25',
    marginBottom: '8px',
  },
  detailsCompanyLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.05rem',
    color: '#D97706',
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  detailsCompanyName: {
    color: '#1E293B',
    fontWeight: '700',
  },
  detailsLocationLine: {
    fontSize: '0.9rem',
    color: '#4B5563',
    marginBottom: '20px',
  },
  detailsSalaryBlock: {
    background: '#F8FAFC',
    border: '1px solid #E5E7EB',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  detailsHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '28px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '24px',
    flexWrap: 'wrap',
  },
  applyBtn: {
    padding: '12px 36px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: '#2563EB',
    color: '#111827',
    border: 'none',
  },
  translateWrapper: {
    marginLeft: 'auto',
  },
  recruiterBadge: {
    fontSize: '0.85rem',
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  detailsBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  aiMatchReportCard: {
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'left',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
  },
  detailSection: {
    textAlign: 'left',
  },
  sectionHeader: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '12px',
    borderLeft: '3px solid #2563EB',
    paddingLeft: '10px',
  },
  jobInfoItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#374151',
  },
  detailDescriptionText: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
  },
  detailRequirementsText: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: '1.6',
    whiteSpace: 'pre-line',
  },
  emptyDetailsPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    color: '#6B7280',
    height: 'calc(100vh - 220px)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
  },
  center: {
    textAlign: 'center',
    padding: '60px 0',
    color: '#6B7280',
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
    zIndex: 99999,
  },
  modalContent: {
    width: '100%',
    maxWidth: '520px',
    borderRadius: '12px',
    padding: '32px',
    maxHeight: '90vh',
    overflowY: 'auto',
    textAlign: 'left',
    background: '#FFFFFF',
    color: '#111827',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  modalLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    color: '#111827',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    fontSize: '1.5rem',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalFormGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    marginTop: '12px',
  },
  modalAlert: {
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
  },
  modalCheckboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    margin: '20px 0',
    paddingRight: '6px',
    textAlign: 'left',
  },
  modalCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#374151',
    cursor: 'pointer',
  },
  viewMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#2563EB',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: '4px',
    alignSelf: 'flex-start',
    outline: 'none',
  },
  warningAlert: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    background: '#FEF3C7',
    border: '1px solid #FDE68A',
    color: '#92400E',
  },
};
