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
using UglyToad.PdfPig;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterviewsController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;
        private readonly IGeminiService _geminiService;
        private readonly IEmailService _emailService;

        public InterviewsController(RecruitmentDbContext context, IGeminiService geminiService, IEmailService emailService)
        {
            _context = context;
            _geminiService = geminiService;
            _emailService = emailService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetInterviews()
        {
            var userId = GetUserId();
            var role = GetUserRole();

            if (role == "Candidate")
            {
                var interviews = await _context.Interviews
                    .Include(i => i.Application)
                    .ThenInclude(a => a!.Job)
                    .Include(i => i.Interviewer)
                    .Where(i => i.Application!.CandidateId == userId)
                    .OrderByDescending(i => i.InterviewDate)
                    .Select(i => new InterviewDto
                    {
                        Id = i.Id,
                        ApplicationId = i.ApplicationId,
                        JobTitle = i.Application!.Job!.Title,
                        CandidateName = i.Application.Candidate != null ? i.Application.Candidate.FullName : "Unknown",
                        InterviewerName = i.Interviewer != null ? i.Interviewer.FullName : "Unknown",
                        InterviewDate = i.InterviewDate,
                        Format = string.IsNullOrEmpty(i.Format) ? "Online" : i.Format,
                        MeetingLink = string.IsNullOrEmpty(i.MeetingLink) ? string.Empty : i.MeetingLink,
                        Notes = string.IsNullOrEmpty(i.Notes) ? string.Empty : i.Notes,
                        AI_Questions = "", // Candidate shouldn't see AI generated questions!
                        Status = string.IsNullOrEmpty(i.Status) ? "Scheduled" : i.Status,
                        HrName = string.IsNullOrEmpty(i.HrName) ? string.Empty : i.HrName,
                        HrEmail = string.IsNullOrEmpty(i.HrEmail) ? string.Empty : i.HrEmail,
                        HrPhone = string.IsNullOrEmpty(i.HrPhone) ? string.Empty : i.HrPhone,
                        CompanyName = !string.IsNullOrEmpty(i.CompanyName) ? i.CompanyName : (i.Application != null && i.Application.Job != null && i.Application.Job.Company != null ? i.Application.Job.Company.Name : "Unknown Company"),
                        OfficeAddress = string.IsNullOrEmpty(i.OfficeAddress) ? string.Empty : i.OfficeAddress,
                        Venue = string.IsNullOrEmpty(i.Venue) ? string.Empty : i.Venue,
                        ReportingTime = string.IsNullOrEmpty(i.ReportingTime) ? string.Empty : i.ReportingTime,
                        DressCode = string.IsNullOrEmpty(i.DressCode) ? string.Empty : i.DressCode,
                        RequiredDocuments = string.IsNullOrEmpty(i.RequiredDocuments) ? string.Empty : i.RequiredDocuments,
                        CandidateConfirmation = string.IsNullOrEmpty(i.CandidateConfirmation) ? "Pending" : i.CandidateConfirmation,
                        ResultStatus = string.IsNullOrEmpty(i.ResultStatus) ? "Pending" : i.ResultStatus,
                        Feedback = string.IsNullOrEmpty(i.Feedback) ? string.Empty : i.Feedback,
                        Remarks = string.IsNullOrEmpty(i.Remarks) ? string.Empty : i.Remarks
                    })
                    .ToListAsync();

                // Trigger simulated reminder emails to candidate
                var now = DateTime.UtcNow;
                foreach (var i in interviews)
                {
                    var diff = i.InterviewDate - now;
                    var totalHours = diff.TotalHours;
                    var totalDays = diff.TotalDays;

                    if (i.Status == "Scheduled" && totalHours > 0)
                    {
                        string alertType = "";
                        if (totalHours <= 2) alertType = "2 Hours Before";
                        else if (totalDays <= 1) alertType = "1 Day Before";
                        else if (totalDays <= 3) alertType = "3 Days Before";
                        else if (totalDays <= 5) alertType = "5 Days Before";

                        if (!string.IsNullOrEmpty(alertType))
                        {
                            var candidateEmail = _context.Users.FirstOrDefault(u => u.Id == userId)?.Email ?? "candidate@gmail.com";
                            Console.WriteLine($"\n========================================================");
                            Console.WriteLine($"[REMINDER EMAIL SENT] To: {candidateEmail} ({alertType})");
                            Console.WriteLine($"Subject: Reminder: RecruitNexus Interview Scheduled");
                            Console.WriteLine($"Body: Dear Candidate, this is a reminder that your interview for '{i.JobTitle}' is in {alertType}.");
                            Console.WriteLine($"========================================================\n");

                            try
                            {
                                var subject = $"Reminder: RecruitNexus Interview Scheduled ({alertType})";
                                var body = $@"
                                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                        <h2 style='color: #fd7e14;'>Interview Reminder</h2>
                                        <p>Dear Candidate,</p>
                                        <p>This is a reminder that your scheduled interview for the position <strong>{i.JobTitle}</strong> is starting in <strong>{alertType}</strong>.</p>
                                        <p><strong>Format:</strong> {i.Format}</p>
                                        <p><strong>Scheduled Time:</strong> {i.InterviewDate:f}</p>
                                        <br/>
                                        <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                                    </div>";
                                await _emailService.SendEmailAsync(candidateEmail, subject, body);
                            }
                            catch
                            {
                                // Silently ignore exception inside loop
                            }
                        }
                    }
                }

                return Ok(interviews);
            }
            else
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                var recruiterCompanyId = recruiter?.CompanyId;

                // Recruiter sees company scope, Admin sees all
                var interviews = await _context.Interviews
                    .Include(i => i.Application)
                    .ThenInclude(a => a!.Job)
                    .Include(i => i.Application!.Candidate)
                    .Include(i => i.Interviewer)
                    .Where(i => i.InterviewerId == userId || (recruiterCompanyId != null && i.Application!.CompanyId == recruiterCompanyId) || role == "Admin")
                    .OrderByDescending(i => i.InterviewDate)
                    .Select(i => new InterviewDto
                    {
                        Id = i.Id,
                        ApplicationId = i.ApplicationId,
                        JobTitle = i.Application!.Job!.Title,
                        CandidateName = i.Application.Candidate != null ? i.Application.Candidate.FullName : "Unknown",
                        InterviewerName = i.Interviewer != null ? i.Interviewer.FullName : "Unknown",
                        InterviewDate = i.InterviewDate,
                        Format = string.IsNullOrEmpty(i.Format) ? "Online" : i.Format,
                        MeetingLink = string.IsNullOrEmpty(i.MeetingLink) ? string.Empty : i.MeetingLink,
                        Notes = string.IsNullOrEmpty(i.Notes) ? string.Empty : i.Notes,
                        AI_Questions = string.IsNullOrEmpty(i.AI_Questions) ? string.Empty : i.AI_Questions,
                        Status = string.IsNullOrEmpty(i.Status) ? "Scheduled" : i.Status,
                        HrName = string.IsNullOrEmpty(i.HrName) ? string.Empty : i.HrName,
                        HrEmail = string.IsNullOrEmpty(i.HrEmail) ? string.Empty : i.HrEmail,
                        HrPhone = string.IsNullOrEmpty(i.HrPhone) ? string.Empty : i.HrPhone,
                        CompanyName = !string.IsNullOrEmpty(i.CompanyName) ? i.CompanyName : (i.Application != null && i.Application.Job != null && i.Application.Job.Company != null ? i.Application.Job.Company.Name : "Unknown Company"),
                        OfficeAddress = string.IsNullOrEmpty(i.OfficeAddress) ? string.Empty : i.OfficeAddress,
                        Venue = string.IsNullOrEmpty(i.Venue) ? string.Empty : i.Venue,
                        ReportingTime = string.IsNullOrEmpty(i.ReportingTime) ? string.Empty : i.ReportingTime,
                        DressCode = string.IsNullOrEmpty(i.DressCode) ? string.Empty : i.DressCode,
                        RequiredDocuments = string.IsNullOrEmpty(i.RequiredDocuments) ? string.Empty : i.RequiredDocuments,
                        CandidateConfirmation = string.IsNullOrEmpty(i.CandidateConfirmation) ? "Pending" : i.CandidateConfirmation,
                        ResultStatus = string.IsNullOrEmpty(i.ResultStatus) ? "Pending" : i.ResultStatus,
                        Feedback = string.IsNullOrEmpty(i.Feedback) ? string.Empty : i.Feedback,
                        Remarks = string.IsNullOrEmpty(i.Remarks) ? string.Empty : i.Remarks
                    })
                    .ToListAsync();

                return Ok(interviews);
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetInterviewById(int id)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            var interview = await _context.Interviews
                .Include(i => i.Application)
                .ThenInclude(a => a!.Job)
                .Include(i => i.Application!.Candidate)
                .Include(i => i.Interviewer)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interview == null) return NotFound(new { message = "Interview not found." });

            if (role == "Candidate" && interview.Application!.CandidateId != userId) return Forbid();
            if (role == "Recruiter")
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (interview.Application!.CompanyId != recruiter?.CompanyId && interview.InterviewerId != userId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }
            }

            var dto = new InterviewDto
            {
                Id = interview.Id,
                ApplicationId = interview.ApplicationId,
                JobTitle = interview.Application!.Job!.Title,
                CandidateName = interview.Application.Candidate != null ? interview.Application.Candidate.FullName : "Unknown",
                InterviewerName = interview.Interviewer != null ? interview.Interviewer.FullName : "Unknown",
                InterviewDate = interview.InterviewDate,
                Format = interview.Format,
                MeetingLink = interview.MeetingLink,
                Notes = interview.Notes,
                AI_Questions = role == "Candidate" ? "" : interview.AI_Questions, // Hide questions from candidate
                Status = interview.Status,
                HrName = interview.HrName,
                HrEmail = interview.HrEmail,
                HrPhone = interview.HrPhone,
                CompanyName = !string.IsNullOrEmpty(interview.CompanyName) ? interview.CompanyName : (interview.Application != null && interview.Application.Job != null && interview.Application.Job.Company != null ? interview.Application.Job.Company.Name : "Unknown Company"),
                OfficeAddress = interview.OfficeAddress,
                Venue = interview.Venue,
                ReportingTime = interview.ReportingTime,
                DressCode = interview.DressCode,
                RequiredDocuments = interview.RequiredDocuments,
                CandidateConfirmation = interview.CandidateConfirmation,
                ResultStatus = interview.ResultStatus,
                Feedback = interview.Feedback,
                Remarks = interview.Remarks
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> ScheduleInterview([FromBody] InterviewScheduleRequest request)
        {
            var recruiterId = GetUserId();

            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Candidate)
                .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);

            if (application == null) return NotFound(new { message = "Application not found." });

            // Check if user belongs to the job's company (unless Admin)
            if (!User.IsInRole("Admin"))
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == recruiterId);
                if (application.Job!.CompanyId != recruiter?.CompanyId && application.Job!.RecruiterId != recruiterId)
                {
                    return Forbid();
                }
            }

            // Generate AI tailored interview questions using Gemini
            string resumeText = GetResumeText(application.ResumePath);
            string aiQuestionsJson = "[]";

            if (!string.IsNullOrEmpty(resumeText))
            {
                var aiQuestionsResult = await _geminiService.GenerateInterviewQuestionsAsync(
                    resumeText,
                    application.Job.Title,
                    application.Job.Description,
                    application.Job.Requirements
                );
                
                aiQuestionsJson = JsonSerializer.Serialize(aiQuestionsResult.Questions);
            }

            var interview = new Interview
            {
                ApplicationId = request.ApplicationId,
                InterviewerId = recruiterId,
                InterviewDate = request.InterviewDate,
                Format = request.Format,
                MeetingLink = request.MeetingLink,
                Notes = request.Notes,
                AI_Questions = aiQuestionsJson,
                Status = "Scheduled",
                HrName = request.HrName,
                HrEmail = request.HrEmail,
                HrPhone = request.HrPhone,
                CompanyName = request.CompanyName,
                OfficeAddress = request.OfficeAddress,
                Venue = request.Venue,
                ReportingTime = request.ReportingTime,
                DressCode = request.DressCode,
                RequiredDocuments = request.RequiredDocuments
            };

            // Update application status to "Interviewing"
            application.Status = "Interviewing";

            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();

            // Direct Email/Push Alert Notification Dispatcher Hook
            if (application.Candidate != null)
            {
                Console.WriteLine($"\n========================================================");
                Console.WriteLine($"[EMAIL ALERT SENT] To: {application.Candidate.Email}");
                Console.WriteLine($"Subject: RecruitNexus Interview Scheduled");
                Console.WriteLine($"Body: Dear {application.Candidate.FullName}, you have been scheduled for an interview for the position '{application.Job!.Title}' on {request.InterviewDate:g}. Format: {request.Format}. Meeting Link: {request.MeetingLink}");
                Console.WriteLine($"========================================================\n");

                try
                {
                    var subject = $"Interview Scheduled: {application.Job!.Title}";
                    var locationDetail = request.Format == "Online" 
                        ? $"<p><strong>Meeting Link:</strong> <a href='{request.MeetingLink}'>{request.MeetingLink}</a></p>" 
                        : $@"<p><strong>Company:</strong> {request.CompanyName}</p>
                             <p><strong>Address:</strong> {request.OfficeAddress}</p>
                             <p><strong>Venue Room:</strong> {request.Venue}</p>";

                    var body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                            <h2 style='color: #0056b3;'>Interview Scheduled</h2>
                            <p>Dear {application.Candidate.FullName},</p>
                            <p>An interview has been scheduled for the position of <strong>{application.Job!.Title}</strong>.</p>
                            <p><strong>Date & Time:</strong> {request.InterviewDate:f}</p>
                            <p><strong>Format:</strong> {request.Format}</p>
                            {locationDetail}
                            <p><strong>Reporting Time:</strong> {request.ReportingTime}</p>
                            <p><strong>Dress Code:</strong> {request.DressCode}</p>
                            <p><strong>Required Documents:</strong> {request.RequiredDocuments}</p>
                            <p><strong>HR Coordinator:</strong> {request.HrName} ({request.HrEmail} / {request.HrPhone})</p>
                            <p>Please log in to your dashboard to confirm your attendance.</p>
                            <br/>
                            <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                        </div>";

                    await _emailService.SendEmailAsync(application.Candidate.Email, subject, body);
                }
                catch (Exception ex)
                {
                    // Silently ignore exception inside controller
                }
            }

            return Ok(new { message = "Interview scheduled successfully.", interviewId = interview.Id });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> UpdateInterviewStatus(int id, [FromBody] UpdateInterviewStatusRequest request)
        {
            var recruiterId = GetUserId();
            var interview = await _context.Interviews.FirstOrDefaultAsync(i => i.Id == id);

            if (interview == null) return NotFound(new { message = "Interview not found." });

            if (interview.InterviewerId != recruiterId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            interview.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Interview status updated to {request.Status}." });
        }

        [HttpPut("{id}/confirm")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> ConfirmInterviewAttendance(int id, [FromBody] UpdateConfirmationRequest request)
        {
            var candidateId = GetUserId();
            var interview = await _context.Interviews
                .Include(i => i.Application)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interview == null) return NotFound(new { message = "Interview not found." });

            // Ensure candidate owns this interview
            if (interview.Application!.CandidateId != candidateId)
            {
                return Forbid();
            }

            var validConfirmations = new[] { "Pending", "Confirmed", "CannotAttend", "RescheduleRequested" };
            if (!validConfirmations.Contains(request.Confirmation))
            {
                return BadRequest(new { message = "Invalid confirmation status." });
            }

            interview.CandidateConfirmation = request.Confirmation;
            await _context.SaveChangesAsync();

            // Send interview confirmation emails
            try
            {
                var candidate = await _context.Users.FirstOrDefaultAsync(u => u.Id == candidateId);
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == interview.InterviewerId);
                var job = interview.Application != null ? await _context.Jobs.FirstOrDefaultAsync(j => j.Id == interview.Application.JobId) : null;

                if (candidate != null && job != null)
                {
                    string statusWord = request.Confirmation;
                    if (statusWord == "CannotAttend") statusWord = "Declined (Cannot Attend)";
                    else if (statusWord == "RescheduleRequested") statusWord = "Reschedule Requested";

                    // Notify Recruiter
                    if (recruiter != null && !string.IsNullOrEmpty(recruiter.Email))
                    {
                        var recruiterSubject = $"Interview Update: {candidate.FullName} - {statusWord}";
                        var recruiterBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: #0056b3;'>Interview Response Update</h2>
                                <p>Dear {recruiter.FullName},</p>
                                <p>Candidate <strong>{candidate.FullName}</strong> has updated their interview attendance status for the position <strong>{job.Title}</strong> to:</p>
                                <p style='font-size: 16px; font-weight: bold; color: #0056b3;'>{statusWord}</p>
                                <p>Scheduled Time: {interview.InterviewDate:f}</p>
                                <br/>
                                <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                            </div>";
                        await _emailService.SendEmailAsync(recruiter.Email, recruiterSubject, recruiterBody);
                    }

                    // Notify Candidate
                    if (!string.IsNullOrEmpty(candidate.Email))
                    {
                        var candidateSubject = $"Interview Attendance Status: {job.Title}";
                        var candidateBody = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: #28a745;'>Attendance Confirmation Registered</h2>
                                <p>Dear {candidate.FullName},</p>
                                <p>Your response of <strong>{statusWord}</strong> has been registered for your interview for the position <strong>{job.Title}</strong> scheduled on {interview.InterviewDate:f}.</p>
                                <br/>
                                <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                            </div>";
                        await _emailService.SendEmailAsync(candidate.Email, candidateSubject, candidateBody);
                    }
                }
            }
            catch (Exception ex)
            {
                // Silently catch exceptions to ensure DB operations are not blocked
            }

            return Ok(new { message = $"Interview attendance updated to {request.Confirmation}.", confirmation = request.Confirmation });
        }

        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> CompleteInterview(int id, [FromBody] CompleteInterviewRequest request)
        {
            var recruiterId = GetUserId();
            var interview = await _context.Interviews
                .Include(i => i.Application)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interview == null) return NotFound(new { message = "Interview not found." });

            if (!User.IsInRole("Admin"))
            {
                var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == recruiterId);
                if (interview.Application!.CompanyId != recruiter?.CompanyId && interview.InterviewerId != recruiterId)
                {
                    return Forbid();
                }
            }

            var validResults = new[] { "Selected", "Rejected", "OnHold", "NextRound" };
            if (!validResults.Contains(request.ResultStatus))
            {
                return BadRequest(new { message = "Invalid interview result status." });
            }

            interview.Status = "Completed";
            interview.ResultStatus = request.ResultStatus;
            interview.Feedback = request.Feedback;
            interview.Remarks = request.Remarks;

            // Also update candidate's application status accordingly!
            if (request.ResultStatus == "Selected")
            {
                interview.Application.Status = "Selected";
            }
            else if (request.ResultStatus == "Rejected")
            {
                interview.Application.Status = "Rejected";
            }
            else if (request.ResultStatus == "OnHold")
            {
                interview.Application.Status = "Under Review";
            }
            else if (request.ResultStatus == "NextRound")
            {
                interview.Application.Status = "Interviewing";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Interview completed and results updated successfully." });
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

    public class UpdateInterviewStatusRequest
    {
        public string Status { get; set; } = string.Empty; // Scheduled, Completed, Cancelled
    }

    public class UpdateConfirmationRequest
    {
        public string Confirmation { get; set; } = string.Empty; // Pending, Confirmed, CannotAttend, RescheduleRequested
    }

    public class CompleteInterviewRequest
    {
        public string ResultStatus { get; set; } = string.Empty; // Selected, Rejected, OnHold, NextRound
        public string Feedback { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }
}
