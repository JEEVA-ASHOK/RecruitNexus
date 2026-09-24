using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/activity")]
    [Authorize]
    public class ActivityController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;

        public ActivityController(RecruitmentDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("id")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetActivityLogs()
        {
            var userId = GetUserId();
            if (userId <= 0)
            {
                return Unauthorized(new { message = "Invalid authentication token." });
            }

            var activities = new List<ActivityDto>();

            // A. Read Applications belonging to the authenticated candidate
            var applications = await _context.Applications
                .AsNoTracking()
                .Include(a => a.Job)
                .ThenInclude(j => j.Company)
                .Where(a => a.CandidateId == userId)
                .ToListAsync();

            foreach (var app in applications)
            {
                var jobTitle = app.Job?.Title ?? "Position";
                var companyName = app.Job?.CompanyName ?? app.Job?.Company?.Name ?? "RecruitNexus Partner";
                
                activities.Add(new ActivityDto
                {
                    Action = $"Applied for {jobTitle}",
                    Details = $"Company: {companyName} | Status: {app.Status}",
                    IpAddress = "System Session",
                    Status = "Success",
                    CreatedAt = app.AppliedAt
                });
            }

            // B. Read Interviews belonging to applications of the authenticated candidate
            var interviews = await _context.Interviews
                .AsNoTracking()
                .Include(i => i.Application)
                .ThenInclude(a => a.Job)
                .ThenInclude(j => j.Company)
                .Where(i => i.Application != null && i.Application.CandidateId == userId)
                .ToListAsync();

            foreach (var intv in interviews)
            {
                var jobTitle = intv.Application?.Job?.Title ?? "Position";
                var companyName = !string.IsNullOrEmpty(intv.CompanyName) ? intv.CompanyName : (intv.Application?.Job?.CompanyName ?? intv.Application?.Job?.Company?.Name ?? "RecruitNexus Partner");
                var format = intv.Format ?? "Online";
                
                activities.Add(new ActivityDto
                {
                    Action = $"Interview: {jobTitle}",
                    Details = $"Format: {format} | Company: {companyName} | Status: {intv.Status}",
                    IpAddress = "System Session",
                    Status = "Success",
                    CreatedAt = intv.InterviewDate
                });
            }

            // C. Read Authenticated User Registration Record
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                activities.Add(new ActivityDto
                {
                    Action = "Account Created",
                    Details = "Candidate account registered and verified",
                    IpAddress = "System Session",
                    Status = "Success",
                    CreatedAt = user.CreatedAt
                });
            }

            // Combine all activities and sort descending by CreatedAt
            var sortedActivities = activities
                .OrderByDescending(a => a.CreatedAt)
                .Select((a, index) => new
                {
                    id = index + 1,
                    action = a.Action,
                    details = a.Details,
                    ipAddress = a.IpAddress,
                    status = a.Status,
                    createdAt = a.CreatedAt.ToString("o")
                })
                .ToList();

            return Ok(sortedActivities);
        }

        private class ActivityDto
        {
            public string Action { get; set; } = string.Empty;
            public string Details { get; set; } = string.Empty;
            public string IpAddress { get; set; } = "System Session";
            public string Status { get; set; } = "Success";
            public DateTime CreatedAt { get; set; }
        }
    }
}
