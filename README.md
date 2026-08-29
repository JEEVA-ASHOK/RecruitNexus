# RecruitNexus — Enterprise AI Recruitment & Talent Acquisition Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![.NET Core](https://img.shields.io/badge/.NET%20Core-10.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF.svg)](https://vitejs.dev/)

**RecruitNexus** is a full-stack, enterprise-grade AI Recruitment and Talent Acquisition Platform. It integrates artificial intelligence with core applicant tracking system (ATS) capabilities—enabling automated candidate-job alignment, interactive AI interview simulations, hiring decision recommendations, automated offer letter generation, personalized 30-60-90 day onboarding plans, multi-lingual translation, and real-time recruitment analytics.

---

## 🚀 1. Project Overview

RecruitNexus bridges the gap between job seekers and hiring teams through intelligent automation. Built with a high-performance **ASP.NET Core Web API** backend and a responsive **React 18 + TypeScript** SPA frontend, the platform streamlines the end-to-end hiring process:

- **Candidates** can upload resumes (`.pdf`, `.docx`, `.txt`), receive instant AI ATS compatibility feedback, practice with a job-role tailored AI interview simulator, sync extracted skills directly to their profiles, track application status, and accept job offers.
- **Recruiters** can publish job openings, review candidate pipelines with extracted resume text, schedule interview sessions, run AI hiring decision assessments, generate customized offer letters, and issue personalized onboarding kits.
- **Administrators** can monitor multi-tenant system metrics, platform conversion rates, and audit logs.

---

## ✨ 2. Key Features by Role

### 👤 Candidate Features
- **Profile Management**: Maintain bio, technical skills, experience years, and education history with interactive View/Edit modes.
- **Multi-Format Resume Parser**: Upload `.pdf` (parsed via `PdfPig`), `.docx` (parsed via OpenXML `word/document.xml`), or `.txt` files up to 5 MB.
- **Real AI ATS Resume Analyzer**: Dynamic content-based compatibility match score (15% - 98%), skill extraction, and gap analysis against specific job requirements.
- **Profile ↔ Resume Sync**: One-click *"✨ Sync Detected Skills to Profile"* feature to populate candidate profiles directly from resume analysis.
- **Job Search & Filtering**: Multi-criteria search by keyword, location, job type (*Full-time*, *Part-time*, *Remote*, *Contract*), and category.
- **Saved Jobs**: Bookmark job listings for quick access.
- **Interactive AI Mock Interview Simulator**: Real-time 5-question interview simulator featuring:
  - Job-role specific question generation.
  - Skip question penalty scoring (0/100).
  - Gibberish / irrelevant response detection (10/100).
  - Instant scorecard reports displaying answered vs skipped question breakdowns.
- **Application & Offer Management**: Track application status (*Applied*, *Reviewing*, *Interviewing*, *Offered*, *Rejected*) and accept or decline formal offer letters.

### 👔 Recruiter Features
- **Company Profile Management**: Edit organization details, industry, logo, location, website, and company description.
- **Job Posting Lifecycle**: Create, edit, publish, and close job listings with salary ranges and application deadlines.
- **Applicant Pipeline Tracking**: Filter candidates by job opening, inspect parsed resume text, update application status, and record internal notes.
- **Interview Scheduling**: Schedule candidate interviews with date/time, mode (*Virtual/In-Person*), meeting link, and candidate email notifications.
- **AI Hiring Decision Assistant**: One-click AI evaluation returning a hiring score (0-100), decision recommendation (*Strong Hire*, *Consider*, *Reject*), candidate strengths, risk factors, and recommended follow-up questions.
- **AI Automated Offer Letter Generator**: Generates customized offer letters combining job details, candidate info, compensation, and start dates.
- **AI Personalized Onboarding Kit Generator**: Generates structured 30-60-90 day onboarding roadmaps tailored to candidate skills and job requirements.

### 🛡️ Admin Features
- **Global Platform Analytics**: System-wide dashboard tracking companies, candidates, recruiters, jobs, applications, and pipeline conversion rates.
- **System Activity & Audit Logs**: Centralized endpoint inspection for system actions and security events.

---

## 🤖 3. AI Features & Integrations

RecruitNexus leverages the **Google Gemini 2.5 Flash API** alongside robust local fallback engines to ensure 100% uptime:

1. **AI Resume Parser & Skill Extractor**: Native document text extraction combined with automated skill identification.
2. **AI ATS & Job Compatibility Engine**: Calculates job-specific compatibility scores, matched skills, missing skills, and recommended learning paths.
3. **AI Interactive Mock Interview Simulator**: Dynamically evaluates candidate responses against target job requirements with strict answer validation.
4. **AI Hiring Decision Assistant**: Evaluates complete candidate profiles against job requirements to assist recruiters in making data-backed hiring decisions.
5. **AI Automated Offer Letter Generator**: Synthesizes offer documentation instantly.
6. **AI Onboarding Plan Generator**: Produces tailored 30-60-90 day onboarding plans.
7. **Floating AI Assistant & Chatbot**: Persistent floating AI assistant (`FloatingAiAssistant.tsx`) providing candidate guidance and Q&A.
8. **Lens Translator & Multi-Lingual Engine**: Real-time translation supporting 6 languages (*English, Tamil, Hindi, Kannada, Malayalam, Japanese*) via Gemini + Google Translate fallback.

---

## 🛠️ 4. Tech Stack

### Backend
- **Framework**: C# ASP.NET Core 10.0 Web API
- **ORM & Database**: Entity Framework Core 9.0 with SQLite (`recruitment.db`)
- **Authentication**: JWT (JSON Web Tokens) with `HMAC-SHA256` encryption and role claims
- **PDF & Document Processing**: `UglyToad.PdfPig` (PDF parsing), `System.IO.Compression.ZipFile` (OpenXML `.docx` parsing)
- **AI Service**: Google Gemini API (`gemini-2.5-flash`) via `HttpClient`
- **Email Service**: System.Net.Mail SMTP email delivery engine

### Frontend
- **Framework**: React 18.3 + TypeScript + Vite 8.1
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Styling**: CSS Modules / Modern Glassmorphism Design System
- **Build Tool**: Vite

---

## 🏗️ 5. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           React 18 SPA Frontend                         │
│  [ Candidate Dashboard ]   [ Recruiter Dashboard ]   [ Admin Dashboard ]│
│  [ AI Mock Simulator  ]   [ Lens Translator     ]   [ Profile Editor  ]│
└────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST API (JWT Bearer Auth)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ASP.NET Core Web API Backend                     │
│  [ AuthController      ]   [ JobsController      ]  [ ApplicationCtrl ]│
│  [ InterviewsController]   [ AiController        ]  [ CompaniesCtrl   ]│
└──────────────────┬─────────────────┬──────────────────┬─────────────────┘
                   │                 │                  │
                   ▼                 ▼                  ▼
┌──────────────────────┐   ┌──────────────────┐   ┌──────────────────────┐
│  EF Core 9 / SQLite  │   │  Google Gemini   │   │  Local File Storage  │
│  (recruitment.db)    │   │  2.5 Flash API   │   │  (/uploads/ directory│
└──────────────────────┘   └──────────────────┘   └──────────────────────┘
```

---

## 📁 6. Project Folder Structure

```
recruitment-portal/
├── backend/
│   ├── Controllers/          # REST API endpoints (Auth, Jobs, Applications, AI, etc.)
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Data/                 # DbContext & DatabaseSeeder
│   ├── Models/               # EF Core Entities (User, Profile, Job, Application, Interview, etc.)
│   ├── Services/             # Business Logic (GeminiService, EmailService)
│   ├── uploads/              # Local media storage (profile photos, resumes)
│   ├── appsettings.json      # Configuration settings
│   └── backend.csproj        # .NET Project file
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components (NavBar, AutoLogoutManager, Modal, etc.)
│   │   ├── context/          # Language & Global Contexts
│   │   ├── pages/            # Application pages (Candidate, Recruiter, Analytics, etc.)
│   │   ├── api.ts            # Centralized API fetch client with JWT handling
│   │   ├── App.tsx           # Main router & app layout
│   │   └── main.tsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
├── docker-compose.yml        # Docker composition setup
└── .env.example              # Environment variables template
```

---

## ⚙️ 7. Prerequisites

Before running RecruitNexus locally, ensure you have the following installed:

- **.NET 10.0 SDK** (or .NET 8.0+ SDK): [Download .NET SDK](https://dotnet.microsoft.com/download)
- **Node.js (v18.0 or higher)**: [Download Node.js](https://nodejs.org/)
- **npm (v9.0 or higher)**
- **Git**

---

## 🚀 8. Setup & Installation Instructions

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Restore .NET dependencies:
   ```bash
   dotnet restore
   ```
3. Configure environment settings or update `appsettings.json` with placeholder credentials:
   ```json
   "Gemini": {
     "ApiKey": "YOUR_GEMINI_API_KEY_HERE"
   }
   ```
4. Run the backend server:
   ```bash
   dotnet run
   ```
   The backend Web API will start at `http://localhost:5000`.

### Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will open at `http://localhost:5173`.

---

## 🔒 9. Environment Variables Configuration

Create a `.env` file in the project root using the provided `.env.example` template:

```env
# Backend Environment Settings
ASPNETCORE_ENVIRONMENT=Development
PORT=5000

# Database Configuration
DATABASE_CONNECTION_STRING="Data Source=recruitment.db"

# JWT Authentication Secrets
JWT_SECRET_KEY="YOUR_STRONG_JWT_SECRET_KEY_HERE"
JWT_ISSUER="RecruitNexus"
JWT_AUDIENCE="RecruitNexusUsers"

# AI Integrations
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"

# SMTP Email Configuration (Optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-smtp-password"
```

---

## 🗄️ 10. Database Setup

RecruitNexus uses **SQLite** (`recruitment.db`) powered by Entity Framework Core.

- **Auto-Initialization**: Upon initial backend launch, `DbContext.Database.EnsureCreated()` automatically initializes the database schema and seeds demo accounts:
  - **Candidate Demo**: `candidate@example.com` / `Candidate123!`
  - **Recruiter Demo**: `recruiter@example.com` / `Recruiter123!`
  - **Admin Demo**: `admin@example.com` / `Admin123!`

---

## 🔌 11. API Overview

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register new Candidate or Recruiter account |
| `/api/auth/login` | `POST` | Public | Authenticate user and return JWT bearer token |
| `/api/auth/profile` | `GET / PUT` | Authenticated | Retrieve or update user profile details |
| `/api/auth/profile/photo` | `POST` | Authenticated | Upload user profile photo (Max 5 MB) |
| `/api/auth/profile/resume` | `POST` | Candidate | Upload PDF/DOCX/TXT resume and run AI extraction |
| `/api/jobs` | `GET` | Public | Search and filter active job listings |
| `/api/jobs` | `POST / PUT` | Recruiter | Post new job or edit existing job listing |
| `/api/applications/submit/{jobId}` | `POST` | Candidate | Submit job application with cover letter and resume |
| `/api/applications/{id}/status` | `PUT` | Recruiter | Update candidate application status in pipeline |
| `/api/interviews` | `POST` | Recruiter | Schedule candidate interview session |
| `/api/interviews/{id}/start-ai-interview` | `POST` | Candidate | Initialize job-specific AI mock interview |
| `/api/ai/hiring-decision` | `POST` | Recruiter | Generate AI recommendation for candidate hiring |
| `/api/ai/generate-offer-letter` | `POST` | Recruiter | Generate tailored candidate offer letter |
| `/api/ai/generate-onboarding` | `POST` | Recruiter | Generate personalized 30-60-90 day onboarding plan |
| `/api/analytics/summary` | `GET` | Admin | Retrieve system-wide platform statistics |

---

## 🛡️ 12. Security Features

- **JWT Token Validation**: Enforced across API controllers via `[Authorize]`.
- **User Scoping & Isolation**: Data access is bound to the authenticated user ID extracted from JWT claims (`GetUserId()`). Candidate A cannot access Candidate B's resume or applications.
- **Inactivity Session Manager**: Automatic 10-minute inactivity auto-logout with a 9-minute warning modal.
- **File Validation**: Strict 5 MB upload limits and file extension checks (`.pdf`, `.docx`, `.txt` for resumes; `.jpg`, `.jpeg`, `.png`, `.webp` for avatars).
- **Per-User File Storage**: Photos and documents stored in user-isolated directories (`/uploads/profile-photos/{userId}/`).

---

## 🗺️ 13. Future Roadmap

- [ ] Transition from SQLite to PostgreSQL / SQL Server for enterprise production deployment.
- [ ] AWS S3 / Azure Blob Storage integration for cloud file management.
- [ ] Real-time SignalR WebSockets for live notifications and instant recruiter-candidate messaging.
- [ ] Bulk candidate resume ZIP parser for batch evaluation.
- [ ] Social OAuth2 Login (Google & LinkedIn).
- [ ] API Rate Limiting and Brute-Force Protection middleware.

---

## 🖼️ 14. Screenshots & Demo

*(Add screenshots of Candidate Dashboard, Recruiter AI Hiring Assistant, and AI Interview Simulator here)*

| Candidate Dashboard | AI Hiring Assistant |
| :---: | :---: |
| ![Candidate Dashboard Placeholder](https://via.placeholder.com/600x350?text=Candidate+Dashboard) | ![AI Hiring Assistant Placeholder](https://via.placeholder.com/600x350?text=AI+Hiring+Assistant) |

---

## 📜 15. License

Distributed under the **MIT License**. See `LICENSE` for more information.
