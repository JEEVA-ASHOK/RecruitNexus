using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;
        private readonly IGeminiService _geminiService;
        private readonly ILogger<AiController> _logger;

        public AiController(RecruitmentDbContext context, IGeminiService geminiService, ILogger<AiController> logger)
        {
            _context = context;
            _geminiService = geminiService;
            _logger = logger;
        }

        [HttpPost("chat")]
        [Authorize]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Message is required." });
            }

            var userId = GetUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var role = GetUserRole();

            // Fetch context data based on the user's role
            string userContext = "";

            if (role == "Candidate")
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .Include(u => u.Applications)
                    .ThenInclude(a => a.Job)
                    .FirstOrDefaultAsync(u => u.Id == userId.Value);

                if (user != null)
                {
                    string[] skills = Array.Empty<string>();
                    if (user.Profile?.Skills != null)
                    {
                        try
                        {
                            skills = JsonSerializer.Deserialize<string[]>(user.Profile.Skills) ?? Array.Empty<string>();
                        }
                        catch { }
                    }

                    var apps = user.Applications.Select(a => $"- Job: \"{a.Job?.Title}\", Status: {a.Status}, Fit Score: {a.MatchingScore}%");
                    string appsList = apps.Any() ? string.Join("\n", apps) : "No applications submitted yet.";

                    userContext = $@"User: {user.FullName} (Candidate)
Email: {user.Email}
Experience: {user.Profile?.ExperienceYears ?? 0} years
Bio: {user.Profile?.Bio ?? "No bio uploaded."}
Skills: {string.Join(", ", skills)}
Submitted Applications:
{appsList}";
                }
            }
            else if (role == "Recruiter")
            {
                var user = await _context.Users
                    .Include(u => u.CreatedJobs)
                    .ThenInclude(j => j.Applications)
                    .ThenInclude(a => a.Candidate)
                    .FirstOrDefaultAsync(u => u.Id == userId.Value);

                if (user != null)
                {
                    var jobsSummary = new StringBuilder();
                    var applicantsSummary = new StringBuilder();

                    foreach (var job in user.CreatedJobs)
                    {
                        jobsSummary.AppendLine($"- Job Title: \"{job.Title}\" (Status: {job.Status}, Applicants: {job.Applications.Count})");
                        
                        foreach (var app in job.Applications)
                        {
                            applicantsSummary.AppendLine($"- Candidate: \"{app.Candidate?.FullName}\" for Job: \"{job.Title}\" (Match Score: {app.MatchingScore}%, Status: {app.Status})");
                        }
                    }

                    userContext = $@"User: {user.FullName} (Recruiter)
Email: {user.Email}
My Posted Jobs:
{(jobsSummary.Length > 0 ? jobsSummary.ToString() : "No jobs posted yet.")}
Applicants for My Jobs:
{(applicantsSummary.Length > 0 ? applicantsSummary.ToString() : "No applications received yet.")}";
                }
            }
            else if (role == "Admin")
            {
                // Admin has global context
                var totalUsers = await _context.Users.CountAsync();
                var totalJobs = await _context.Jobs.CountAsync();
                var totalApps = await _context.Applications.CountAsync();
                var totalInts = await _context.Interviews.CountAsync();

                userContext = $@"User: Administrator
System Overview Statistics:
- Total Platform Users: {totalUsers}
- Active Job Postings: {totalJobs}
- Submitted Candidate Applications: {totalApps}
- Scheduled Interviews: {totalInts}";
            }

            // Call Gemini to get the contextual reply
            var reply = await _geminiService.GetChatReplyAsync(request.Message, userContext, request.History);

            return Ok(new ChatResponse { Reply = reply });
        }

        [HttpPost("translate")]
        [Authorize]
        public async Task<IActionResult> Translate([FromBody] TranslationRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Text) || string.IsNullOrWhiteSpace(request.TargetLanguage))
            {
                return BadRequest(new { message = "Text and target language are required." });
            }

            var translatedText = await _geminiService.TranslateTextAsync(request.Text, request.TargetLanguage);
            return Ok(new TranslationResponse { TranslatedText = translatedText });
        }

        [HttpPost("generate-questions")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> GenerateQuestions([FromBody] GenerateQuestionsRequest request)
        {
            if (request == null || request.ApplicationId <= 0)
            {
                return BadRequest(new { message = "Valid ApplicationId is required." });
            }

            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Candidate)
                .ThenInclude(c => c!.Profile)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (application == null || application.Job == null)
            {
                return NotFound(new { message = "Application or associated job not found." });
            }

            string resumeText = string.Empty;
            if (application.Candidate?.Profile != null)
            {
                string resumePath = application.Candidate.Profile.ResumePath ?? string.Empty;
                if (!string.IsNullOrEmpty(resumePath))
                {
                    try
                    {
                        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", resumePath);
                        if (System.IO.File.Exists(fullPath))
                        {
                            using var pdf = UglyToad.PdfPig.PdfDocument.Open(fullPath);
                            var textBuilder = new StringBuilder();
                            foreach (var page in pdf.GetPages())
                            {
                                textBuilder.AppendLine(page.Text);
                            }
                            resumeText = textBuilder.ToString();
                        }
                    }
                    catch { }
                }

                if (string.IsNullOrEmpty(resumeText))
                {
                    resumeText = $"Candidate Bio: {application.Candidate.Profile.Bio}. Skills: {application.Candidate.Profile.Skills}. Experience: {application.Candidate.Profile.ExperienceYears} years.";
                }
            }

            try
            {
                var result = await _geminiService.GenerateInterviewQuestionsAsync(
                    resumeText,
                    application.Job.Title ?? "Position",
                    application.Job.Description ?? string.Empty,
                    application.Job.Requirements ?? string.Empty
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate interview questions via Gemini.");
                return Ok(new InterviewQuestionsResult());
            }
        }

        [HttpPost("save-questions")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> SaveQuestions([FromBody] SaveQuestionsRequest request)
        {
            if (request == null || request.InterviewId <= 0 || string.IsNullOrEmpty(request.QuestionsJson))
            {
                return BadRequest(new { message = "Valid InterviewId and QuestionsJson are required." });
            }

            var interview = await _context.Interviews.FirstOrDefaultAsync(i => i.Id == request.InterviewId);
            if (interview == null)
            {
                return NotFound(new { message = "Interview record not found." });
            }

            interview.AI_Questions = request.QuestionsJson;
            await _context.SaveChangesAsync();

            return Ok(new { message = "AI Questions saved successfully to interview record.", questionsJson = interview.AI_Questions });
        }

        [HttpPost("hiring-decision")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> GenerateHiringDecision([FromBody] GenerateQuestionsRequest request)
        {
            if (request == null || request.ApplicationId <= 0)
            {
                return BadRequest(new { message = "Valid ApplicationId is required." });
            }

            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Candidate)
                .ThenInclude(c => c!.Profile)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (application == null || application.Job == null)
            {
                return NotFound(new { message = "Application or associated job not found." });
            }

            string resumeText = string.Empty;
            if (application.Candidate?.Profile != null)
            {
                string resumePath = application.Candidate.Profile.ResumePath ?? string.Empty;
                if (!string.IsNullOrEmpty(resumePath))
                {
                    try
                    {
                        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", resumePath);
                        if (System.IO.File.Exists(fullPath))
                        {
                            using var pdf = UglyToad.PdfPig.PdfDocument.Open(fullPath);
                            var textBuilder = new StringBuilder();
                            foreach (var page in pdf.GetPages())
                            {
                                textBuilder.AppendLine(page.Text);
                            }
                            resumeText = textBuilder.ToString();
                        }
                    }
                    catch { }
                }

                if (string.IsNullOrEmpty(resumeText))
                {
                    resumeText = $"Candidate Bio: {application.Candidate.Profile.Bio}. Skills: {application.Candidate.Profile.Skills}. Experience: {application.Candidate.Profile.ExperienceYears} years.";
                }
            }

            // Fetch interview notes if available
            var interviewNotes = application.RecruiterNotes ?? string.Empty;
            var interviews = await _context.Interviews
                .Where(i => i.ApplicationId == application.Id)
                .ToListAsync();

            if (interviews.Any())
            {
                var intSummaries = interviews.Select(i => $"Format: {i.Format}, Result: {i.ResultStatus}, Feedback: {i.Feedback}, Remarks: {i.Remarks}");
                interviewNotes += "\n\nInterview Evaluations:\n" + string.Join("\n", intSummaries);
            }

            try
            {
                var result = await _geminiService.GenerateHiringDecisionAsync(
                    resumeText,
                    application.Candidate?.FullName ?? "Candidate",
                    application.Job.Title ?? "Position",
                    application.Job.Description ?? string.Empty,
                    application.Job.Requirements ?? string.Empty,
                    application.MatchingScore,
                    application.AI_Feedback ?? string.Empty,
                    interviewNotes
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate hiring decision via Gemini.");
                return Ok(new HiringDecisionResult
                {
                    Recommendation = application.MatchingScore >= 85 ? "Hire" : application.MatchingScore >= 70 ? "Consider" : "Reject",
                    ConfidenceScore = 85,
                    ExecutiveSummary = $"Fallback decision summary based on AI fit score of {application.MatchingScore}%.",
                    Strengths = new[] { "Technical match score alignment", "Domain background skills" },
                    SkillGaps = new[] { "Specific enterprise tools onboarding" },
                    Reasoning = new[] { "Score alignment with role requirements" }
                });
            }
        }

        [HttpPost("generate-offer-letter")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> GenerateOfferLetter([FromBody] GenerateQuestionsRequest request)
        {
            if (request == null || request.ApplicationId <= 0)
            {
                return BadRequest(new { message = "Valid ApplicationId is required." });
            }

            var application = await _context.Applications
                .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (application == null || application.Job == null)
            {
                return NotFound(new { message = "Application or associated job record not found." });
            }

            string candidateName = application.Candidate?.FullName ?? "Valued Candidate";
            string jobTitle = application.Job.Title ?? "Position";
            string companyName = application.Job.Company?.Name ?? application.Job.CompanyName ?? "Enterprise Organization";
            string salaryRange = string.IsNullOrEmpty(application.Job.SalaryRange) ? "Competitive Market Compensation" : application.Job.SalaryRange;
            string location = string.IsNullOrEmpty(application.Job.Location) ? "Corporate Headquarters / Remote" : application.Job.Location;
            string jobType = application.Job.JobType ?? "FullTime";
            string requirements = application.Job.Requirements ?? string.Empty;

            try
            {
                string offerLetterContent = await _geminiService.GenerateOfferLetterAsync(
                    candidateName,
                    jobTitle,
                    companyName,
                    salaryRange,
                    location,
                    jobType,
                    requirements
                );

                return Ok(new { offerLetterContent });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate offer letter via Gemini.");
                return Ok(new { offerLetterContent = $"CONFIDENTIAL OFFER LETTER\n\nDate: {DateTime.UtcNow:MMMM dd, yyyy}\n\nTo: {candidateName}\n\nSubject: Job Offer - {jobTitle} at {companyName}\n\nDear {candidateName},\n\nWe are pleased to offer you the position of '{jobTitle}' at {companyName}.\n\nCompensation Package: {salaryRange}\nLocation: {location}\nEmployment Type: {jobType}\n\nPlease review and confirm your acceptance within 7 calendar days.\n\nSincerely,\nHR Talent Acquisition Team\n{companyName}" });
            }
        }

        [HttpPost("generate-onboarding")]
        [Authorize(Roles = "Recruiter,Admin,Candidate")]
        public async Task<IActionResult> GenerateOnboarding([FromBody] GenerateQuestionsRequest request)
        {
            if (request == null || request.ApplicationId <= 0)
            {
                return BadRequest(new { message = "Valid ApplicationId is required." });
            }

            var application = await _context.Applications
                .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (application == null || application.Job == null)
            {
                return NotFound(new { message = "Application or associated job record not found." });
            }

            string candidateName = application.Candidate?.FullName ?? "Valued Team Member";
            string jobTitle = application.Job.Title ?? "Position";
            string companyName = application.Job.Company?.Name ?? application.Job.CompanyName ?? "Enterprise Organization";
            string department = "Engineering & Technology";
            string location = string.IsNullOrEmpty(application.Job.Location) ? "Corporate HQ / Remote" : application.Job.Location;

            try
            {
                var result = await _geminiService.GenerateOnboardingPlanAsync(
                    candidateName,
                    jobTitle,
                    companyName,
                    department,
                    location
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate onboarding plan via Gemini.");
                return Ok(new OnboardingPlanResult
                {
                    WelcomeMessage = $"Welcome to {companyName}, {candidateName}! We are thrilled to have you join our team as a {jobTitle}.",
                    FirstDayAgenda = new[] { "09:30 AM - Orientation", "11:00 AM - Team Welcome", "02:00 PM - Workstation Setup" },
                    Checklist = new[] { "Upload signed offer letter", "Submit ID verification", "Complete direct deposit form" },
                    LearningPlan30Days = new[] { "Architecture walkthrough", "CI/CD setup", "Ship first minor feature" },
                    LearningPlan60Days = new[] { "Primary feature delivery", "Sprint planning participation" },
                    LearningPlan90Days = new[] { "Architectural module ownership", "PR code reviews" },
                    ManagerNote = $"Hi {candidateName}, welcome aboard! Looking forward to working with you.",
                    FAQs = new[] { "Q: Dress code? A: Smart casual.", "Q: Workstation access? A: Credentials emailed prior to Day 1." }
                });
            }
        }

        private int? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                     ?? User.FindFirst("sub")
                     ?? User.FindFirst("id");
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            return null;
        }

        private string GetUserRole()
        {
            var claim = User.FindFirst(ClaimTypes.Role);
            return claim?.Value ?? "Candidate";
        }
    }

    public class SaveQuestionsRequest
    {
        public int InterviewId { get; set; }
        public string QuestionsJson { get; set; } = string.Empty;
    }
}
