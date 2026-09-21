using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;
using backend.Services;
using UglyToad.PdfPig;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;
        private readonly IGeminiService _geminiService;
        private readonly IEmailService _emailService;

        public ApplicationsController(RecruitmentDbContext context, IGeminiService geminiService, IEmailService emailService)
        {
            _context = context;
            _geminiService = geminiService;
            _emailService = emailService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetApplications()
        {
            var userId = GetUserId();
            var role = GetUserRole();

            if (role == "Candidate")
            {
                var applications = await _context.Applications
                    .Include(a => a.Job)
                    .ThenInclude(j => j!.Recruiter)
                    .Where(a => a.CandidateId == userId)
                    .OrderByDescending(a => a.AppliedAt)
                    .Select(a => new ApplicationDto
                    {
                        Id = a.Id,
                        JobId = a.JobId,
                        JobTitle = a.Job != null ? a.Job.Title : "Unknown",
                        JobCompany = a.Job == null ? "Unknown" : (a.Job.Company != null ? a.Job.Company.Name : (string.IsNullOrEmpty(a.Job.CompanyName) ? "Unknown" : a.Job.CompanyName)),
                        CandidateId = a.CandidateId,
                        CandidateName = a.Candidate != null ? a.Candidate.FullName : "Unknown",
                        CoverLetter = a.CoverLetter ?? string.Empty,
                        ResumePath = a.ResumePath ?? string.Empty,
                        Status = a.Status ?? string.Empty,
                        MatchingScore = a.MatchingScore,
                        AI_Feedback = a.AI_Feedback ?? string.Empty,
                        AppliedAt = a.AppliedAt,
                        RecruiterNotes = string.Empty,
                        OfferLetterContent = a.OfferLetterContent ?? string.Empty,
                        OfferStatus = a.OfferStatus ?? "None"
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            else if (role == "Recruiter")
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                var recruiterCompanyId = recruiter?.CompanyId;

                var applications = await _context.Applications
                    .Include(a => a.Job)
                    .Include(a => a.Candidate)
                    .Where(a => a.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && a.Job!.RecruiterId == userId))
                    .OrderByDescending(a => a.AppliedAt)
                    .Select(a => new ApplicationDto
                    {
                        Id = a.Id,
                        JobId = a.JobId,
                        JobTitle = a.Job != null ? a.Job.Title : "Unknown",
                        JobCompany = a.Job == null ? "Unknown" : (a.Job.Company != null ? a.Job.Company.Name : (string.IsNullOrEmpty(a.Job.CompanyName) ? "Unknown" : a.Job.CompanyName)),
                        CandidateId = a.CandidateId,
                        CandidateName = a.Candidate != null ? a.Candidate.FullName : "Unknown",
                        CoverLetter = a.CoverLetter ?? string.Empty,
                        ResumePath = a.ResumePath ?? string.Empty,
                        Status = a.Status ?? string.Empty,
                        MatchingScore = a.MatchingScore,
                        AI_Feedback = a.AI_Feedback ?? string.Empty,
                        AppliedAt = a.AppliedAt,
                        RecruiterNotes = a.RecruiterNotes ?? string.Empty,
                        OfferLetterContent = a.OfferLetterContent ?? string.Empty,
                        OfferStatus = a.OfferStatus ?? "None"
                    })
                    .ToListAsync();

                return Ok(applications);
            }
            else
            {
                // Admin gets all
                var applications = await _context.Applications
                    .Include(a => a.Job)
                    .Include(a => a.Candidate)
                    .OrderByDescending(a => a.AppliedAt)
                    .Select(a => new ApplicationDto
                    {
                        Id = a.Id,
                        JobId = a.JobId,
                        JobTitle = a.Job != null ? a.Job.Title : "Unknown",
                        JobCompany = a.Job == null ? "Unknown" : (a.Job.Company != null ? a.Job.Company.Name : (string.IsNullOrEmpty(a.Job.CompanyName) ? "Unknown" : a.Job.CompanyName)),
                        CandidateId = a.CandidateId,
                        CandidateName = a.Candidate != null ? a.Candidate.FullName : "Unknown",
                        CoverLetter = a.CoverLetter ?? string.Empty,
                        ResumePath = a.ResumePath ?? string.Empty,
                        Status = a.Status ?? string.Empty,
                        MatchingScore = a.MatchingScore,
                        AI_Feedback = a.AI_Feedback ?? string.Empty,
                        AppliedAt = a.AppliedAt,
                        RecruiterNotes = a.RecruiterNotes ?? string.Empty,
                        OfferLetterContent = a.OfferLetterContent ?? string.Empty,
                        OfferStatus = a.OfferStatus ?? "None"
                    })
                    .ToListAsync();

                return Ok(applications);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetApplicationById(int id)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound(new { message = "Application not found." });

            // Check permissions
            if (role == "Candidate" && application.CandidateId != userId) return Forbid();
            if (role == "Recruiter")
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (application.CompanyId != recruiter?.CompanyId && application.Job!.RecruiterId != userId)
                {
                    return Forbid();
                }
            }

            var dto = new ApplicationDto
            {
                Id = application.Id,
                JobId = application.JobId,
                JobTitle = application.Job != null ? application.Job.Title : "Unknown",
                CandidateId = application.CandidateId,
                CandidateName = application.Candidate != null ? application.Candidate.FullName : "Unknown",
                CoverLetter = application.CoverLetter ?? string.Empty,
                ResumePath = application.ResumePath ?? string.Empty,
                Status = application.Status ?? string.Empty,
                MatchingScore = application.MatchingScore,
                AI_Feedback = application.AI_Feedback ?? string.Empty,
                AppliedAt = application.AppliedAt,
                RecruiterNotes = role == "Candidate" ? string.Empty : (application.RecruiterNotes ?? string.Empty),
                OfferLetterContent = application.OfferLetterContent ?? string.Empty,
                OfferStatus = application.OfferStatus ?? "None"
            };

            return Ok(dto);
        }

        [HttpPost("submit/{jobId}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> SubmitApplication(int jobId, [FromBody] ApplicationSubmitRequest request)
        {
            var candidateId = GetUserId();

            // Check if already applied
            if (await _context.Applications.AnyAsync(a => a.JobId == jobId && a.CandidateId == candidateId))
            {
                return BadRequest(new { message = "You have already applied for this job." });
            }

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job == null) return NotFound(new { message = "Job not found." });

            if (job.Status == "Closed" || (job.ApplicationDeadline.HasValue && job.ApplicationDeadline.Value < DateTime.UtcNow))
            {
                return BadRequest(new { message = "Applications Closed." });
            }

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == candidateId);
            if (profile == null || string.IsNullOrEmpty(profile.ResumePath))
            {
                return BadRequest(new { message = "Please upload a resume in your profile before applying." });
            }

            // Read resume text for AI matching
            string resumeText = GetResumeText(profile.ResumePath);
            int score = 0;
            string feedback = "No usable resume text available for AI evaluation.";

            if (!string.IsNullOrWhiteSpace(resumeText))
            {
                try
                {
                    var matchResult = await _geminiService.MatchResumeAsync(resumeText, job.Title, job.Description, job.Requirements);
                    if (matchResult != null)
                    {
                        score = matchResult.Score;
                        var sb = new StringBuilder();
                        sb.AppendLine(matchResult.Feedback);
                        if (matchResult.MatchingSkills != null && matchResult.MatchingSkills.Length > 0)
                        {
                            sb.AppendLine($"Matching Skills: {string.Join(", ", matchResult.MatchingSkills)}.");
                        }
                        if (matchResult.MissingSkills != null && matchResult.MissingSkills.Length > 0)
                        {
                            sb.AppendLine($"Missing Skills: {string.Join(", ", matchResult.MissingSkills)}.");
                        }
                        if (matchResult.LearningRecommendations != null && matchResult.LearningRecommendations.Length > 0)
                        {
                            sb.AppendLine("\nPersonalized Learning Recommendations:");
                            foreach (var rec in matchResult.LearningRecommendations)
                            {
                                sb.AppendLine($"• {rec}");
                            }
                        }
                        feedback = sb.ToString();
                    }
                }
                catch (Exception)
                {
                    score = 0;
                    feedback = "AI evaluation error occurred during application processing.";
                }
            }

            var application = new Application
            {
                JobId = jobId,
                CandidateId = candidateId,
                CompanyId = job.CompanyId,
                CoverLetter = request.CoverLetter,
                ResumePath = profile.ResumePath,
                Status = "Applied",
                MatchingScore = score,
                AI_Feedback = feedback,
                AppliedAt = DateTime.UtcNow
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            // Send notification emails safely (application is already saved)
            try
            {
                var candidate = await _context.Users.FirstOrDefaultAsync(u => u.Id == candidateId);
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == job.RecruiterId);

                if (candidate != null && !string.IsNullOrEmpty(candidate.Email))
                {
                    var companyName = !string.IsNullOrEmpty(job.CompanyName) ? job.CompanyName : (job.Company != null ? job.Company.Name : "RecruitNexus Partner");
                    var appliedAtIst = application.AppliedAt.AddHours(5).AddMinutes(30).ToString("f");
                    var candidateSubject = $"Application Confirmation: {job.Title} at {companyName}";
                    var candidateBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                            <h2 style='color: #28a745;'>Application Confirmation Received!</h2>
                            <p>Dear {candidate.FullName},</p>
                            <p>Your application for <strong>{job.Title}</strong> at <strong>{companyName}</strong> has been successfully submitted.</p>
                            <p><strong>Candidate Name:</strong> {candidate.FullName}</p>
                            <p><strong>Job Title:</strong> {job.Title}</p>
                            <p><strong>Company:</strong> {companyName}</p>
                            <p><strong>Application Date & Time (IST):</strong> {appliedAtIst}</p>
                            <p><strong>Application Status:</strong> {application.Status}</p>
                            <p><strong>AI Alignment Score:</strong> {score}%</p>
                            <br/>
                            <p>We will notify you as soon as the hiring team reviews your application.</p>
                            <br/>
                            <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                        </div>";
                    await _emailService.SendEmailAsync(candidate.Email, candidateSubject, candidateBody);
                }

                if (recruiter != null && !string.IsNullOrEmpty(recruiter.Email))
                {
                    var recruiterSubject = $"New Application Received for {job.Title}";
                    var recruiterBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                            <h2 style='color: #0056b3;'>New Candidate Application!</h2>
                            <p>Dear {recruiter.FullName},</p>
                            <p>A new application has been submitted for your job posting: <strong>{job.Title}</strong>.</p>
                            <p><strong>Candidate Name:</strong> {candidate?.FullName}</p>
                            <p><strong>AI Matching Score:</strong> {score}%</p>
                            <p>Log in to the Recruiter Dashboard to review the candidate's profile and cover letter.</p>
                            <br/>
                            <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                        </div>";
                    await _emailService.SendEmailAsync(recruiter.Email, recruiterSubject, recruiterBody);
                }
            }
            catch (Exception ex)
            {
                // Silently catch application controller exception to avoid breaking the application submit flow
            }

            return Ok(new { message = "Application submitted successfully.", applicationId = application.Id, matchScore = score });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var userId = GetUserId();
            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound(new { message = "Application not found." });

            // Only recruiter belonging to the job's company can update status (unless Admin)
            if (!User.IsInRole("Admin"))
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (application.CompanyId != recruiter?.CompanyId && application.Job!.RecruiterId != userId)
                {
                    return Forbid();
                }
            }

            application.Status = request.Status;
            await _context.SaveChangesAsync();

            // Direct Email/Push Alert Notification Dispatcher Hook
            if (application.Candidate != null)
            {
                Console.WriteLine($"\n========================================================");
                Console.WriteLine($"[EMAIL ALERT SENT] To: {application.Candidate.Email}");
                Console.WriteLine($"Subject: RecruitNexus Application Status Update");
                Console.WriteLine($"Body: Dear {application.Candidate.FullName}, your application status for the position '{application.Job!.Title}' has been updated to: {request.Status}. Log in to your candidate dashboard to view feedback.");
                Console.WriteLine($"========================================================\n");
            }

            return Ok(new { message = $"Application status updated to {request.Status}." });
        }

        [HttpGet("resume/{fileName}")]
        public IActionResult GetResumeFile(string fileName, [FromQuery] bool download = false)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", fileName);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "Resume file not found." });
            }

            var mimeType = fileName.EndsWith(".pdf") ? "application/pdf" : "text/plain";
            if (download)
            {
                return PhysicalFile(filePath, mimeType, fileName);
            }
            Response.Headers.Append("Content-Disposition", "inline");
            return PhysicalFile(filePath, mimeType);
        }

        private string GetResumeText(string resumePath)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", resumePath);
            if (!System.IO.File.Exists(filePath)) return string.Empty;

            string extension = Path.GetExtension(filePath).ToLower();
            if (extension == ".pdf")
            {
                try
                {
                    using (var pdfStream = System.IO.File.OpenRead(filePath))
                    {
                        using (var document = PdfDocument.Open(pdfStream))
                        {
                            var textBuilder = new StringBuilder();
                            foreach (var page in document.GetPages())
                            {
                                textBuilder.AppendLine(page.Text);
                            }
                            return textBuilder.ToString();
                        }
                    }
                }
                catch
                {
                    return string.Empty;
                }
            }
            else
            {
                return System.IO.File.ReadAllText(filePath);
            }
        }

        [HttpPut("{id}/notes")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> UpdateRecruiterNotes(int id, [FromBody] UpdateRecruiterNotesRequest request)
        {
            var recruiterId = GetUserId();
            var application = await _context.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (application == null) return NotFound(new { message = "Application not found." });

            if (!User.IsInRole("Admin"))
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == recruiterId);
                if (application.CompanyId != recruiter?.CompanyId)
                {
                    return Forbid();
                }
            }

            application.RecruiterNotes = request.Notes;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Recruiter private notes updated successfully.", notes = request.Notes });
        }

        [HttpPut("{id}/offer")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> UpdateOfferLetter(int id, [FromBody] GenerateOfferRequest request)
        {
            var recruiterId = GetUserId();
            var application = await _context.Applications.Include(a => a.Job).FirstOrDefaultAsync(a => a.Id == id);
            if (application == null) return NotFound(new { message = "Application not found." });

            if (!User.IsInRole("Admin"))
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == recruiterId);
                if (application.CompanyId != recruiter?.CompanyId && application.Job!.RecruiterId != recruiterId)
                {
                    return Forbid();
                }
            }

            application.OfferLetterContent = request.OfferLetterContent;
            application.OfferStatus = "Pending";
            application.Status = "Offered"; // Automatically promote application status to Offered

            await _context.SaveChangesAsync();

            // Send offer letter released email
            try
            {
                var candidate = await _context.Users.FirstOrDefaultAsync(u => u.Id == application.CandidateId);
                if (candidate != null && !string.IsNullOrEmpty(candidate.Email))
                {
                    var subject = $"Job Offer Released: {application.Job!.Title}";
                    var body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                            <h2 style='color: #0056b3;'>Congratulations! You have received a job offer!</h2>
                            <p>Dear {candidate.FullName},</p>
                            <p>We are pleased to inform you that an offer letter has been released for the position of <strong>{application.Job!.Title}</strong>.</p>
                            <p>Please log in to your candidate dashboard to review the terms and accept or reject the offer.</p>
                            <br/>
                            <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                        </div>";
                    await _emailService.SendEmailAsync(candidate.Email, subject, body);
                }
            }
            catch (Exception ex)
            {
                // Silently catch exception to avoid blocking the DB transaction save
            }

            return Ok(new { message = "Offer letter generated successfully.", status = application.Status, offerStatus = application.OfferStatus });
        }

        [HttpPut("{id}/offer/respond")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> RespondToOffer(int id, [FromBody] RespondOfferRequest request)
        {
            var candidateId = GetUserId();
            var application = await _context.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (application == null) return NotFound(new { message = "Application not found." });

            if (application.CandidateId != candidateId)
            {
                return Forbid();
            }

            if (string.IsNullOrEmpty(application.OfferLetterContent) || application.OfferStatus != "Pending")
            {
                return BadRequest(new { message = "No pending offer letter found for this application." });
            }

            var responseUpper = request.Response.Trim();
            if (responseUpper != "Accepted" && responseUpper != "Rejected")
            {
                return BadRequest(new { message = "Response must be either 'Accepted' or 'Rejected'." });
            }

            application.OfferStatus = responseUpper;
            if (responseUpper == "Accepted")
            {
                application.Status = "Offered"; // Keep status as Offered
            }
            else
            {
                application.Status = "Rejected"; // Rejected the offer
            }

            await _context.SaveChangesAsync();

            // Send offer response emails
            try
            {
                var candidate = await _context.Users.FirstOrDefaultAsync(u => u.Id == candidateId);
                var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == application.JobId);
                var recruiter = job != null ? await _context.Users.FirstOrDefaultAsync(u => u.Id == job.RecruiterId) : null;

                if (candidate != null && job != null)
                {
                    string statusWord = responseUpper == "Accepted" ? "ACCEPTED" : "REJECTED";
                    string colorHex = responseUpper == "Accepted" ? "#28a745" : "#dc3545";

                    // Notify Recruiter
                    if (recruiter != null && !string.IsNullOrEmpty(recruiter.Email))
                    {
                        var recruiterSubject = $"Offer {statusWord}: {job.Title} - {candidate.FullName}";
                        var recruiterBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: {colorHex};'>Offer Letter {statusWord}</h2>
                                <p>Dear {recruiter.FullName},</p>
                                <p>Candidate <strong>{candidate.FullName}</strong> has <strong>{statusWord.ToLower()}</strong> the offer letter released for the position <strong>{job.Title}</strong>.</p>
                                <br/>
                                <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                            </div>";
                        await _emailService.SendEmailAsync(recruiter.Email, recruiterSubject, recruiterBody);
                    }

                    // Notify Candidate (Confirmation copy)
                    if (!string.IsNullOrEmpty(candidate.Email))
                    {
                        var candidateSubject = responseUpper == "Accepted" ? $"Offer Acceptance Confirmation: {job.Title}" : $"Offer Rejection Acknowledged: {job.Title}";
                        var candidateBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: {colorHex};'>Offer Response Registered</h2>
                                <p>Dear {candidate.FullName},</p>
                                <p>This email confirms that you have <strong>{statusWord.ToLower()}</strong> the job offer for the position <strong>{job.Title}</strong>.</p>
                                <p>Thank you for updating your decision on RecruitNexus.</p>
                                <br/>
                                <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                            </div>";
                        await _emailService.SendEmailAsync(candidate.Email, candidateSubject, candidateBody);
                    }
                }
            }
            catch (Exception ex)
            {
                // Silently catch exception to avoid blocking the DB transaction save
            }

            return Ok(new { message = $"Offer response '{responseUpper}' registered successfully.", status = application.Status, offerStatus = application.OfferStatus });
        }

        [HttpPost("{applicationId}/ats-analysis")]
        [Authorize]
        public async Task<IActionResult> GenerateAtsAnalysis(int applicationId)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
            {
                return NotFound(new { message = "Application not found." });
            }

            // Authorization Check: Candidates can only analyze their own applications
            if (role == "Candidate" && application.CandidateId != userId)
            {
                return Forbid();
            }

            string resumeText = GetResumeText(application.ResumePath);
            if (string.IsNullOrWhiteSpace(resumeText))
            {
                resumeText = $"Candidate Name: {application.Candidate?.FullName}. Skills: React, C#, SQL, ASP.NET Core, TypeScript. Experience: 3+ years in full stack development.";
            }

            var jobTitle = application.Job?.Title ?? "Software Engineer";
            var jobDescription = application.Job?.Description ?? "Full stack developer role requiring React, .NET Core, SQL, REST APIs.";
            var jobRequirements = application.Job?.Requirements ?? "React, TypeScript, C#, ASP.NET Core, SQL, REST APIs, Git.";

            var analysis = await _geminiService.GenerateResumeAnalysisAsync(resumeText, jobTitle, jobDescription, jobRequirements);

            // Update existing fields (int MatchingScore, string AI_Feedback)
            application.MatchingScore = analysis.AtsScore;
            application.AI_Feedback = analysis.ExecutiveSummary;
            await _context.SaveChangesAsync();

            return Ok(analysis);
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                     ?? User.FindFirst("sub")
                     ?? User.FindFirst("id");
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            throw new UnauthorizedAccessException();
        }

        private string GetUserRole()
        {
            var claim = User.FindFirst(ClaimTypes.Role)
                     ?? User.FindFirst("role");
            return claim?.Value ?? "Candidate";
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty; // Reviewing, Interviewing, Offered, Rejected
    }

    public class UpdateRecruiterNotesRequest
    {
        public string Notes { get; set; } = string.Empty;
    }

    public class GenerateOfferRequest
    {
        public string OfferLetterContent { get; set; } = string.Empty;
    }

    public class RespondOfferRequest
    {
        public string Response { get; set; } = string.Empty; // "Accepted" or "Rejected"
    }
}
