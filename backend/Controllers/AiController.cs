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

        public AiController(RecruitmentDbContext context, IGeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
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
            var role = GetUserRole();

            // Fetch context data based on the user's role
            string userContext = "";

            if (role == "Candidate")
            {
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .Include(u => u.Applications)
                    .ThenInclude(a => a.Job)
                    .FirstOrDefaultAsync(u => u.Id == userId);

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
                    .FirstOrDefaultAsync(u => u.Id == userId);

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

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim != null && int.TryParse(claim.Value, out int id))
            {
                return id;
            }
            throw new UnauthorizedAccessException();
        }

        private string GetUserRole()
        {
            var claim = User.FindFirst(ClaimTypes.Role);
            return claim?.Value ?? "Candidate";
        }
    }
}
