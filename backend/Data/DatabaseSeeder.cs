using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public static class DatabaseSeeder
    {
        public static void Seed(RecruitmentDbContext context)
        {
            // Run raw column addition for existing databases (backward compatibility)
            try
            {
                context.Database.ExecuteSqlRaw("CREATE TABLE IF NOT EXISTS Companies (Id INT AUTO_INCREMENT PRIMARY KEY, Name VARCHAR(255) NOT NULL)");
            }
            catch
            {
                try
                {
                    context.Database.ExecuteSqlRaw("CREATE TABLE IF NOT EXISTS Companies (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name VARCHAR(255) NOT NULL)");
                }
                catch {}
            }
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Companies ADD COLUMN Logo VARCHAR(2048) DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Companies ADD COLUMN Industry VARCHAR(255) DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Companies ADD COLUMN Website VARCHAR(255) DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Companies ADD COLUMN Location VARCHAR(255) DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Companies ADD COLUMN About TEXT DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Profiles ADD COLUMN Education VARCHAR(255) DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN CompanyId INT NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN PasswordResetToken VARCHAR(512) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN ResetTokenExpiry DATETIME NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Jobs ADD COLUMN CompanyId INT NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Jobs ADD COLUMN ApplicationDeadline DATETIME NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Applications ADD COLUMN CompanyId INT NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Applications ADD COLUMN RecruiterNotes TEXT NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Applications ADD COLUMN OfferLetterContent TEXT DEFAULT '' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Applications ADD COLUMN OfferStatus VARCHAR(50) DEFAULT 'None' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN HrName VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN HrEmail VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN HrPhone VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN CompanyName VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN OfficeAddress VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN Venue VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN ReportingTime VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN DressCode VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN RequiredDocuments VARCHAR(255) NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN CandidateConfirmation VARCHAR(50) DEFAULT 'Pending' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN ResultStatus VARCHAR(50) DEFAULT 'Pending' NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN Feedback TEXT NULL"); } catch {}
            try { context.Database.ExecuteSqlRaw("ALTER TABLE Interviews ADD COLUMN Remarks TEXT NULL"); } catch {}
            try
            {
                context.Database.ExecuteSqlRaw("CREATE TABLE IF NOT EXISTS SavedJobs (Id INT AUTO_INCREMENT PRIMARY KEY, CandidateId INT NOT NULL, JobId INT NOT NULL, SavedAt DATETIME NOT NULL, FOREIGN KEY(CandidateId) REFERENCES Users(Id) ON DELETE CASCADE, FOREIGN KEY(JobId) REFERENCES Jobs(Id) ON DELETE CASCADE)");
            }
            catch
            {
                try
                {
                    context.Database.ExecuteSqlRaw("CREATE TABLE IF NOT EXISTS SavedJobs (Id INTEGER PRIMARY KEY AUTOINCREMENT, CandidateId INTEGER NOT NULL, JobId INTEGER NOT NULL, SavedAt DATETIME NOT NULL, FOREIGN KEY(CandidateId) REFERENCES Users(Id) ON DELETE CASCADE, FOREIGN KEY(JobId) REFERENCES Jobs(Id) ON DELETE CASCADE)");
                }
                catch {}
            }

            // Ensure companies are populated
            if (!context.Companies.Any())
            {
                var seededCompanies = new List<Company>
                {
                    new Company { Name = "Zoho Corporation" },
                    new Company { Name = "Google India" },
                    new Company { Name = "TCS (Tata Consultancy Services)" },
                    new Company { Name = "Microsoft India" },
                    new Company { Name = "Wipro" },
                    new Company { Name = "Infosys" },
                    new Company { Name = "Amazon India" },
                    new Company { Name = "Flipkart" },
                    new Company { Name = "Cognizant Technologies" },
                    new Company { Name = "HCLTech" }
                };
                context.Companies.AddRange(seededCompanies);
                context.SaveChanges();
            }

            // Backfill existing Recruiters with their company links
            var allRecruiters = context.Users.Where(u => u.Role == "Recruiter" && u.CompanyId == null).ToList();
            if (allRecruiters.Any())
            {
                var comps = context.Companies.ToList();
                foreach (var rec in allRecruiters)
                {
                    var compName = string.IsNullOrWhiteSpace(rec.FullName) ? "Independent Recruiter" : rec.FullName.Trim();
                    var comp = comps.FirstOrDefault(c => c.Name.ToLower() == compName.ToLower());
                    if (comp == null)
                    {
                        comp = new Company { Name = compName };
                        context.Companies.Add(comp);
                        context.SaveChanges();
                        comps.Add(comp);
                    }
                    rec.CompanyId = comp.Id;
                }
                context.SaveChanges();
            }

            // Backfill existing Jobs
            var allJobs = context.Jobs.Where(j => j.CompanyId == null).ToList();
            if (allJobs.Any())
            {
                foreach (var j in allJobs)
                {
                    var rec = context.Users.FirstOrDefault(u => u.Id == j.RecruiterId);
                    if (rec != null)
                    {
                        j.CompanyId = rec.CompanyId;
                    }
                }
                context.SaveChanges();
            }

            // Backfill existing Applications
            var allApps = context.Applications.Where(a => a.CompanyId == null).ToList();
            if (allApps.Any())
            {
                foreach (var a in allApps)
                {
                    var j = context.Jobs.FirstOrDefault(job => job.Id == a.JobId);
                    if (j != null)
                    {
                        a.CompanyId = j.CompanyId;
                    }
                }
                context.SaveChanges();
            }

            // Seed only if no users exist
            if (context.Users.Any())
            {
                return;
            }

            // 0. Seed Companies
            var companies = new List<Company>
            {
                new Company { Name = "Zoho Corporation" },
                new Company { Name = "Google India" },
                new Company { Name = "TCS (Tata Consultancy Services)" },
                new Company { Name = "Microsoft India" },
                new Company { Name = "Wipro" },
                new Company { Name = "Infosys" },
                new Company { Name = "Amazon India" },
                new Company { Name = "Flipkart" },
                new Company { Name = "Cognizant Technologies" },
                new Company { Name = "HCLTech" }
            };
            context.Companies.AddRange(companies);
            context.SaveChanges();

            var hasher = new PasswordHasher<User>();

            // 1. Seed 17 Users (10 Recruiters representing companies, 6 Candidates, 1 Admin)
            var users = new List<User>
            {
                // Recruiters
                new User { Email = "recruiter@gmail.com", FullName = "Zoho Corporation", Role = "Recruiter", CompanyId = companies[0].Id },
                new User { Email = "recruiter2@talentsphere.com", FullName = "Google India", Role = "Recruiter", CompanyId = companies[1].Id },
                new User { Email = "recruiter3@talentsphere.com", FullName = "TCS (Tata Consultancy Services)", Role = "Recruiter", CompanyId = companies[2].Id },
                new User { Email = "recruiter4@talentsphere.com", FullName = "Microsoft India", Role = "Recruiter", CompanyId = companies[3].Id },
                new User { Email = "recruiter5@talentsphere.com", FullName = "Wipro", Role = "Recruiter", CompanyId = companies[4].Id },
                new User { Email = "recruiter6@talentsphere.com", FullName = "Infosys", Role = "Recruiter", CompanyId = companies[5].Id },
                new User { Email = "recruiter7@talentsphere.com", FullName = "Amazon India", Role = "Recruiter", CompanyId = companies[6].Id },
                new User { Email = "recruiter8@talentsphere.com", FullName = "Flipkart", Role = "Recruiter", CompanyId = companies[7].Id },
                new User { Email = "recruiter9@talentsphere.com", FullName = "Cognizant Technologies", Role = "Recruiter", CompanyId = companies[8].Id },
                new User { Email = "recruiter10@talentsphere.com", FullName = "HCLTech", Role = "Recruiter", CompanyId = companies[9].Id },
                
                // Candidates
                new User { Email = "candidate@gmail.com", FullName = "Alice Miller", Role = "Candidate" },
                new User { Email = "candidate2@talentsphere.com", FullName = "Charlie Green", Role = "Candidate" },
                new User { Email = "candidate3@talentsphere.com", FullName = "Diana Prince", Role = "Candidate" },
                new User { Email = "candidate4@talentsphere.com", FullName = "Evan Wright", Role = "Candidate" },
                new User { Email = "candidate5@talentsphere.com", FullName = "Fiona Clark", Role = "Candidate" },
                new User { Email = "candidate6@talentsphere.com", FullName = "George Brooks", Role = "Candidate" },
                
                // Admin
                new User { Email = "admin@gmail.com", FullName = "System Admin", Role = "Admin" }
            };

            foreach (var user in users)
            {
                user.PasswordHash = hasher.HashPassword(user, "password123");
                context.Users.Add(user);
            }
            context.SaveChanges();

            // 2. Seed Profiles for Candidates
            var profiles = new List<Profile>
            {
                new Profile
                {
                    UserId = users[10].Id, // Alice
                    Bio = "Backend Engineer specializing in .NET Core, Web APIs, and relational databases. Enthusiastic about microservices architecture.",
                    Skills = JsonSerializer.Serialize(new[] { "C#", ".NET Core", "SQL", "Web API", "Docker", "Git" }),
                    ExperienceYears = 4,
                    ResumePath = "alice_resume.pdf",
                    AI_Summary = "Auto-seeded candidate profile. Extracted backend focus with 4 years experience."
                },
                new Profile
                {
                    UserId = users[11].Id, // Charlie
                    Bio = "Frontend developer passionate about building highly interactive, responsive web applications using React, TypeScript, and CSS.",
                    Skills = JsonSerializer.Serialize(new[] { "React", "TypeScript", "JavaScript", "HTML/CSS", "Vite", "Redux" }),
                    ExperienceYears = 3,
                    ResumePath = "charlie_resume.pdf",
                    AI_Summary = "Auto-seeded candidate profile. Frontend specialist."
                },
                new Profile
                {
                    UserId = users[12].Id, // Diana
                    Bio = "Data Scientist with experience in building machine learning models, data pipelines, and implementing statistics analysis using Python.",
                    Skills = JsonSerializer.Serialize(new[] { "Python", "Pandas", "Scikit-Learn", "Machine Learning", "TensorFlow", "SQL" }),
                    ExperienceYears = 5,
                    ResumePath = "diana_resume.pdf",
                    AI_Summary = "Auto-seeded candidate profile. Core focus on Data Science and AI models."
                },
                new Profile
                {
                    UserId = users[13].Id, // Evan
                    Bio = "DevOps Engineer focused on cloud automation, CI/CD pipelines, containerization, and infrastructure as code (IaC).",
                    Skills = JsonSerializer.Serialize(new[] { "AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux" }),
                    ExperienceYears = 6,
                    ResumePath = "evan_resume.pdf",
                    AI_Summary = "Auto-seeded candidate profile. Strong Cloud Ops and Devops background."
                },
                new Profile
                {
                    UserId = users[14].Id, // Fiona
                    Bio = "Quality Assurance specialist. Experience writing automated tests using Selenium, Playwright, and designing testing strategies.",
                    Skills = JsonSerializer.Serialize(new[] { "QA Automation", "Selenium", "Playwright", "Jest", "Manual Testing", "Postman" }),
                    ExperienceYears = 2,
                    ResumePath = "fiona_resume.pdf",
                    AI_Summary = "Auto-seeded candidate profile. Quality Assurance tester."
                },
                new Profile
                {
                    UserId = users[15].Id, // George
                    Bio = "Cybersecurity analyst focused on application security, vulnerability assessments, and network security threat modeling.",
                    Skills = JsonSerializer.Serialize(new[] { "Cybersecurity", "Network Security", "Linux", "OWASP", "Wireshark", "Python" }),
                    ExperienceYears = 3,
                    ResumePath = "george_resume.pdf",
                    AI_Summary = "Auto-seeded candidate profile. Network security analyst."
                }
            };

            context.Profiles.AddRange(profiles);
            context.SaveChanges();

            // 3. Seed 10 Indeed India Jobs
            var jobs = new List<Job>
            {
                new Job
                {
                    RecruiterId = users[0].Id, // Zoho Corporation
                    Title = "Full Stack React/Node Developer",
                    Description = "Looking for an energetic Full Stack Developer to build interactive user dashboards and internal administrative apps.",
                    Requirements = "2+ years working with React.js, Node.js, Express, and SQL databases. Strong UI design interest.",
                    Location = "Chennai, Tamil Nadu",
                    JobType = "FullTime",
                    SalaryRange = "₹6,00,000 - ₹12,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[1].Id, // Google India
                    Title = "Data Scientist (AI/ML)",
                    Description = "Join our product engineering division to train predictive analytics systems and implement LLM frameworks on enterprise data.",
                    Requirements = "Proficiency in Python (Pandas, PyTorch), SQL query writing, and deploying machine learning models to production.",
                    Location = "Bangalore, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹24,00,000 - ₹35,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[2].Id, // TCS
                    Title = "Senior C# Backend Engineer",
                    Description = "Looking for a seasoned C# engineer to lead development of our distributed payment processing backend API services.",
                    Requirements = "5+ years C# experience, strong knowledge of SQL databases, Entity Framework Core, and Docker containerization.",
                    Location = "Mumbai, Maharashtra (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹8,00,000 - ₹15,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[3].Id, // Microsoft India
                    Title = "Cloud DevOps Architect",
                    Description = "Seeking a DevOps architect to manage our infrastructure-as-code automation and CI/CD deployment pipelines on Azure/AWS.",
                    Requirements = "Expertise in Azure/AWS, Terraform, Docker, Kubernetes, and setting up automated CI/CD runners.",
                    Location = "Hyderabad, Telangana (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹20,00,000 - ₹30,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[4].Id, // Wipro
                    Title = "React Frontend Developer",
                    Description = "Join our client design engineering team to construct a beautiful, high-performance customer dashboard using React, Vite, and CSS.",
                    Requirements = "3+ years frontend web development, proficiency in TypeScript, React Hooks, and CSS layout engines.",
                    Location = "Bangalore, Karnataka (Remote)",
                    JobType = "Remote",
                    SalaryRange = "₹5,00,000 - ₹10,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[5].Id, // Infosys
                    Title = "Senior Data Analyst",
                    Description = "Responsible for building predictive analytics systems and training internal statistical models on customer datasets.",
                    Requirements = "Strong statistical background, Python (Pandas/Numpy), SQL queries, and BI visualization tools (Tableau/PowerBI).",
                    Location = "Bangalore, Karnataka (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹7,00,000 - ₹13,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[6].Id, // Amazon India
                    Title = "Cloud Infrastructure Architect",
                    Description = "Design and build secure, resilient multi-region infrastructure architectures on AWS for our retail database layers.",
                    Requirements = "Strong AWS networking, RDS clustering, IAM governance, and scripting skills in Python or Bash.",
                    Location = "Chennai, Tamil Nadu (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹22,00,000 - ₹32,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[7].Id, // Flipkart
                    Title = "Cybersecurity Analyst",
                    Description = "Conduct vulnerability audits, monitor security log files, and enforce application-level firewall policies on our e-commerce platforms.",
                    Requirements = "3+ years security engineering, familiarity with penetration testing, network firewalls, and Linux shells.",
                    Location = "Bangalore, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹12,00,000 - ₹18,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[8].Id, // Cognizant Technologies
                    Title = "QA Automation Engineer",
                    Description = "Implement end-to-end integration and system test automation scripts to guarantee high software quality in our retail platforms.",
                    Requirements = "Proficient in JavaScript/TypeScript or Python, test automation tools (Playwright, Selenium), and designing regression suites.",
                    Location = "Pune, Maharashtra (Hybrid)",
                    JobType = "PartTime",
                    SalaryRange = "₹4,00,000 - ₹7,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[9].Id, // HCLTech
                    Title = "Technical Product Manager",
                    Description = "Collaborate with developers and designers to outline application roadmaps, prioritize feature backlogs, and run user tests.",
                    Requirements = "Excellent communication skills, technical literacy, and experience with agile development processes.",
                    Location = "Noida, Uttar Pradesh (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹14,00,000 - ₹22,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[0].Id, // Zoho Corporation (Internship)
                    Title = "CURIE Data Science Intern",
                    Description = "Participate in data ingestion and predictive analytics engineering workflows inside the research cell.",
                    Requirements = "Basic Python programming, exposure to Pandas or Scikit-Learn libraries, and high curiosity.",
                    Location = "Pune, Maharashtra",
                    JobType = "PartTime",
                    SalaryRange = "Unpaid / Intern Stipend",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[2].Id, // TCS (acting as Wells Fargo)
                    Title = "Lead Data Science Consultant",
                    Description = "Guide clients on statistics model validation, machine learning, and enterprise data analytics pipelines.",
                    Requirements = "5+ years of data science experience, or equivalent. Problem Solving, Data Handling, Pyspark, Power.",
                    Location = "Bengaluru, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹12,00,000 - ₹18,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[5].Id, // Infosys (acting as Shell Pvt Ltd)
                    Title = "Data Science Analyst",
                    Description = "Perform diagnostic analysis on business logs to discover anomalies, configure dashboards, and outline insights.",
                    Requirements = "2-4 Yrs experience, SQL queries, Python data analysis, Manager Quality Assurance, SAP, Renewable.",
                    Location = "Bengaluru, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹8,00,000 - ₹14,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[1].Id, // Google India
                    Title = "Data Science Manager, gTech Ads Solutions",
                    Description = "Lead Google's internal global ads intelligence engineering cell to resolve high scale queries.",
                    Requirements = "9-14 Yrs experience, Masters degree in a quantitative discipline such as Statistics, Engineering, Coding.",
                    Location = "Bengaluru, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹35,00,000 - ₹50,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[4].Id, // Wipro (acting as American Express)
                    Title = "Senior Analyst - Data Science (Gen AI)",
                    Description = "Explore LLM prompt engineering, retrieval augmented generation, and custom transformer fine tuning.",
                    Requirements = "3-6 Yrs experience. Python programming, OpenAI API integration, LangChain, vector databases.",
                    Location = "Bangalore, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹18,00,000 - ₹26,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[0].Id, // Zoho
                    Title = "Junior QA Automation Engineer",
                    Description = "Write automated testing scripts using Selenium and design custom test suits.",
                    Requirements = "0-2 Yrs experience, basic JavaScript/Python, understanding of software testing life cycle.",
                    Location = "Chennai, Tamil Nadu",
                    JobType = "FullTime",
                    SalaryRange = "₹4,00,000 - ₹7,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[3].Id, // Microsoft India
                    Title = "Staff Software Engineer - Cloud",
                    Description = "Develop high-scale cloud platforms, orchestrate container services, and configure messaging brokers.",
                    Requirements = "8-12 Yrs experience. Expert level C# / C++, Azure Core services, Kubernetes, distributed caching.",
                    Location = "Hyderabad, Telangana (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹28,00,000 - ₹42,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[4].Id, // Wipro
                    Title = "Cloud Security Engineer",
                    Description = "Configure cloud security groups, monitor network traffic logs, and enforce identity governance rules.",
                    Requirements = "3-5 Yrs experience. Knowledge of AWS/Azure security controls, IAM, microservice network policies.",
                    Location = "Bangalore, Karnataka (Remote)",
                    JobType = "Remote",
                    SalaryRange = "₹8,00,000 - ₹13,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[5].Id, // Infosys
                    Title = "Sales Development Representative",
                    Description = "Conduct customer outreach, manage client leads, and schedule product demonstrations.",
                    Requirements = "1-3 Yrs experience. Excellent verbal and written presentation skills, active sales cycle knowledge.",
                    Location = "Pune, Maharashtra (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹3,50,000 - ₹6,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[7].Id, // Flipkart
                    Title = "Backend Engineer - Node.js",
                    Description = "Design REST APIs, scale data storage layers, and configure caching networks.",
                    Requirements = "2-5 Yrs experience. Node.js, Express, Redis, PostgreSQL, microservice interaction.",
                    Location = "Bangalore, Karnataka",
                    JobType = "FullTime",
                    SalaryRange = "₹14,00,000 - ₹20,00,000 a year",
                    Status = "Open"
                },
                new Job
                {
                    RecruiterId = users[9].Id, // HCLTech
                    Title = "Technical Content Specialist",
                    Description = "Produce developer documentation, product user guides, and write clear API tutorials.",
                    Requirements = "1-3 Yrs experience. Technical writing samples, markdown structure, REST query understanding.",
                    Location = "Noida, Uttar Pradesh (Hybrid)",
                    JobType = "FullTime",
                    SalaryRange = "₹4,50,000 - ₹7,00,000 a year",
                    Status = "Open"
                }
            };

            foreach (var job in jobs)
            {
                var recruiter = users.FirstOrDefault(u => u.Id == job.RecruiterId);
                if (recruiter != null)
                {
                    job.CompanyId = recruiter.CompanyId;
                }
            }

            context.Jobs.AddRange(jobs);
            context.SaveChanges();

            // 4. Seed 10 Applications
            var applications = new List<Application>
            {
                new Application
                {
                    JobId = jobs[2].Id, // TCS C# Backend
                    CandidateId = users[10].Id, // Alice
                    CoverLetter = "I have 4 years of experience working with C# and Web APIs. I believe my skills match this job description perfectly.",
                    ResumePath = "alice_resume.pdf",
                    Status = "Interviewing",
                    MatchingScore = 85,
                    AI_Feedback = "AI Fit Analysis: The candidate Alice has strong alignment with C# and Web API. She has 4 years of experience which is close to the requested 5 years. Great match on backend skills."
                },
                new Application
                {
                    JobId = jobs[0].Id, // Zoho Full Stack
                    CandidateId = users[10].Id, // Alice
                    CoverLetter = "I have backend skills and I am eager to apply them to full stack roles.",
                    ResumePath = "alice_resume.pdf",
                    Status = "Reviewing",
                    MatchingScore = 75,
                    AI_Feedback = "AI Fit Analysis: Alice has excellent backend credentials, but her frontend experience (React/JS) is not highly detailed in her profile, which leads to a moderate fit score."
                },
                new Application
                {
                    JobId = jobs[4].Id, // Wipro React Developer
                    CandidateId = users[11].Id, // Charlie
                    CoverLetter = "React and typescript are my primary skills. I have built multiple interactive dashboards.",
                    ResumePath = "charlie_resume.pdf",
                    Status = "Interviewing",
                    MatchingScore = 92,
                    AI_Feedback = "AI Fit Analysis: Charlie's skills in React, TypeScript, and CSS align extremely well with the requirements for this frontend position."
                },
                new Application
                {
                    JobId = jobs[1].Id, // Google India Data Scientist
                    CandidateId = users[12].Id, // Diana
                    CoverLetter = "I build ML pipelines and handle databases using Python. I'd love to join your team.",
                    ResumePath = "diana_resume.pdf",
                    Status = "Interviewing",
                    MatchingScore = 89,
                    AI_Feedback = "AI Fit Analysis: Diana has exactly 5 years experience, python skills, and ML libraries match. She is an excellent fit for the Data Scientist role."
                },
                new Application
                {
                    JobId = jobs[3].Id, // Microsoft Cloud DevOps
                    CandidateId = users[12].Id, // Diana
                    CoverLetter = "I have extensive experience deploying models and training pipelines.",
                    ResumePath = "diana_resume.pdf",
                    Status = "Reviewing",
                    MatchingScore = 95,
                    AI_Feedback = "AI Fit Analysis: Outstanding candidate alignment. Diana's dataset profiling matches the machine learning engineer profile requirements."
                },
                new Application
                {
                    JobId = jobs[3].Id, // Microsoft Cloud DevOps
                    CandidateId = users[13].Id, // Evan
                    CoverLetter = "AWS Cloud infrastructure architect with Terraform and Docker skills.",
                    ResumePath = "evan_resume.pdf",
                    Status = "Interviewing",
                    MatchingScore = 94,
                    AI_Feedback = "AI Fit Analysis: Evan has 6 years experience, matching cloud skills, Kubernetes, Terraform. Complete technical alignment."
                },
                new Application
                {
                    JobId = jobs[5].Id, // Infosys Data Analyst
                    CandidateId = users[14].Id, // Fiona
                    CoverLetter = "Quality assurance automation developer. Certified testing engineer.",
                    ResumePath = "fiona_resume.pdf",
                    Status = "Applied",
                    MatchingScore = 80,
                    AI_Feedback = "AI Fit Analysis: Fiona's QA automation skills in Selenium and Playwright match the requirements perfectly."
                },
                new Application
                {
                    JobId = jobs[8].Id, // Cognizant QA
                    CandidateId = users[15].Id, // George
                    CoverLetter = "Security analyst specialized in penetration testing and firewalls.",
                    ResumePath = "george_resume.pdf",
                    Status = "Applied",
                    MatchingScore = 88,
                    AI_Feedback = "AI Fit Analysis: George's experience in vulnerability assessments and threat modeling fits this security profile well."
                },
                new Application
                {
                    JobId = jobs[4].Id, // Wipro React
                    CandidateId = users[11].Id, // Charlie
                    CoverLetter = "I build React dashboards and would love to work on React Native mobile apps.",
                    ResumePath = "charlie_resume.pdf",
                    Status = "Reviewing",
                    MatchingScore = 70,
                    AI_Feedback = "AI Fit Analysis: Charlie is strong in React, which makes React Native easier to pick up, though he lacks native mobile experience."
                },
                new Application
                {
                    JobId = jobs[9].Id, // HCLTech Product Manager
                    CandidateId = users[14].Id, // Fiona
                    CoverLetter = "Transitioning to PM roles. Eager to coordinate team features.",
                    ResumePath = "fiona_resume.pdf",
                    Status = "Rejected",
                    MatchingScore = 55,
                    AI_Feedback = "AI Fit Analysis: The candidate Fiona has testing credentials, but the product management role requires user testing and product roadmap design which is absent in her profile."
                }
            };

            foreach (var app in applications)
            {
                var job = jobs.FirstOrDefault(j => j.Id == app.JobId);
                if (job != null)
                {
                    app.CompanyId = job.CompanyId;
                }
            }

            context.Applications.AddRange(applications);
            context.SaveChanges();

            // 5. Seed 10 Interviews
            var mockQuestions = new[]
            {
                new { questionText = "Can you describe a challenging database design scenario you optimized?", rationale = "Evaluates backend scalability knowledge." },
                new { questionText = "How do you handle state sharing in a large-scale React app?", rationale = "Tests React architecture understanding." },
                new { questionText = "Describe a situation where a model overfitted and how you fixed it.", rationale = "Assesses machine learning competency." },
                new { questionText = "How do you manage secrets in your Terraform codebase?", rationale = "Tests DevOps security practices." },
                new { questionText = "How do you design automated tests for a dynamic, asynchronous page?", rationale = "Tests test strategy designing capabilities." }
            };

            var questionsJson = JsonSerializer.Serialize(mockQuestions);

            var interviews = new List<Interview>
            {
                new Interview
                {
                    ApplicationId = applications[0].Id, // Alice -> TCS Backend
                    InterviewerId = users[2].Id, // TCS
                    InterviewDate = DateTime.UtcNow.AddDays(2),
                    Format = "Online",
                    MeetingLink = "meet.google.com/csharp-backend-interview",
                    Notes = "Technical screening call focused on ASP.NET Core and EF Core mappings.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[2].Id, // Charlie -> Wipro React
                    InterviewerId = users[4].Id, // Wipro
                    InterviewDate = DateTime.UtcNow.AddDays(3),
                    Format = "Online",
                    MeetingLink = "meet.google.com/react-frontend-interview",
                    Notes = "Coding review session of candidate's React component portfolio.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[3].Id, // Diana -> Google DS
                    InterviewerId = users[1].Id, // Google India
                    InterviewDate = DateTime.UtcNow.AddDays(1),
                    Format = "Online",
                    MeetingLink = "meet.google.com/data-science-interview",
                    Notes = "ML and Statistics review. Focus on dataset cleaning pipelines.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[5].Id, // Evan -> Microsoft DevOps
                    InterviewerId = users[3].Id, // Microsoft
                    InterviewDate = DateTime.UtcNow.AddDays(4),
                    Format = "Online",
                    MeetingLink = "meet.google.com/devops-infrastructure-interview",
                    Notes = "AWS architecture and container clustering questions.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[0].Id, // Alice -> TCS (Round 2)
                    InterviewerId = users[2].Id, // TCS
                    InterviewDate = DateTime.UtcNow.AddDays(5),
                    Format = "Online",
                    MeetingLink = "meet.google.com/backend-manager-round",
                    Notes = "System design discussion and behavioral panel.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[2].Id, // Charlie -> Wipro (Completed)
                    InterviewerId = users[4].Id, // Wipro
                    InterviewDate = DateTime.UtcNow.AddDays(-2),
                    Format = "Online",
                    MeetingLink = "meet.google.com/completed-react-interview",
                    Notes = "Initial screening. Candidate performed extremely well in coding tasks.",
                    AI_Questions = questionsJson,
                    Status = "Completed"
                },
                new Interview
                {
                    ApplicationId = applications[3].Id, // Diana -> Google (Completed)
                    InterviewerId = users[1].Id, // Google
                    InterviewDate = DateTime.UtcNow.AddDays(-1),
                    Format = "Online",
                    MeetingLink = "meet.google.com/completed-ds-interview",
                    Notes = "Technical modeling review. Good pandas answers.",
                    AI_Questions = questionsJson,
                    Status = "Completed"
                },
                new Interview
                {
                    ApplicationId = applications[1].Id, // Alice -> Zoho Full Stack
                    InterviewerId = users[0].Id, // Zoho
                    InterviewDate = DateTime.UtcNow.AddDays(7),
                    Format = "InPerson",
                    MeetingLink = "Conference Room A, 4th Floor",
                    Notes = "On-site panel interview including fullstack architecture design.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[6].Id, // Fiona -> Infosys Data
                    InterviewerId = users[5].Id, // Infosys
                    InterviewDate = DateTime.UtcNow.AddDays(3),
                    Format = "Online",
                    MeetingLink = "meet.google.com/qa-automation-interview",
                    Notes = "Playwright test script writing and CI automation integration review.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                },
                new Interview
                {
                    ApplicationId = applications[7].Id, // George -> Cognizant QA
                    InterviewerId = users[8].Id, // Cognizant
                    InterviewDate = DateTime.UtcNow.AddDays(6),
                    Format = "Online",
                    MeetingLink = "meet.google.com/security-analyst-interview",
                    Notes = "Vulnerability scanning walkthrough and OWASP Top 10 mitigation questions.",
                    AI_Questions = questionsJson,
                    Status = "Scheduled"
                }
            };

            context.Interviews.AddRange(interviews);
            context.SaveChanges();
        }
    }
}

