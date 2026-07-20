using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;

        public AnalyticsController(RecruitmentDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = GetUserId();
            var role = GetUserRole();

            // Total statistics
            var totalJobs = await _context.Jobs.CountAsync();
            var totalApplications = await _context.Applications.CountAsync();
            var totalRecruiters = await _context.Users.CountAsync(u => u.Role == "Recruiter");
            var totalCandidates = await _context.Users.CountAsync(u => u.Role == "Candidate");
            var totalInterviews = await _context.Interviews.CountAsync();

            // Application breakdown
            var pendingApplications = await _context.Applications.CountAsync(a => a.Status == "Applied" || a.Status == "Reviewing");
            var selectedApplications = await _context.Applications.CountAsync(a => a.Status == "Offered" || a.Status == "Selected");
            var rejectedApplications = await _context.Applications.CountAsync(a => a.Status == "Rejected");

            // Recruiter specific constraints (if not Admin, filter data relevant to this recruiter's company)
            var recruiter = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var recruiterCompanyId = recruiter?.CompanyId;

            int recruiterJobs = 0;
            int recruiterApps = 0;
            int recruiterInterviews = 0;
            int recruiterPending = 0;
            int recruiterSelected = 0;
            int recruiterRejected = 0;

            if (role == "Recruiter")
            {
                recruiterJobs = await _context.Jobs.CountAsync(j => j.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && j.RecruiterId == userId));
                recruiterApps = await _context.Applications.CountAsync(a => a.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && a.Job!.RecruiterId == userId));
                recruiterInterviews = await _context.Interviews.CountAsync(i => i.Application!.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && i.Application!.Job!.RecruiterId == userId));
                recruiterPending = await _context.Applications.CountAsync(a => (a.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && a.Job!.RecruiterId == userId)) && (a.Status == "Applied" || a.Status == "Reviewing"));
                recruiterSelected = await _context.Applications.CountAsync(a => (a.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && a.Job!.RecruiterId == userId)) && (a.Status == "Offered" || a.Status == "Selected"));
                recruiterRejected = await _context.Applications.CountAsync(a => (a.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && a.Job!.RecruiterId == userId)) && a.Status == "Rejected");
            }

            // Monthly applications trend (last 6 months)
            var today = DateTime.UtcNow;
            var monthlyTrend = Enumerable.Range(0, 6)
                .Select(i => today.AddMonths(-i))
                .Select(d => new { Month = d.ToString("MMM yyyy"), Year = d.Year, MonthNum = d.Month })
                .Reverse()
                .ToList();

            var trendData = new System.Collections.Generic.List<object>();
            foreach (var m in monthlyTrend)
            {
                int count = 0;
                if (role == "Admin")
                {
                    count = await _context.Applications
                        .CountAsync(a => a.AppliedAt.Year == m.Year && a.AppliedAt.Month == m.MonthNum);
                }
                else
                {
                    count = await _context.Applications
                        .CountAsync(a => (a.CompanyId == recruiterCompanyId || (recruiterCompanyId == null && a.Job!.RecruiterId == userId)) && a.AppliedAt.Year == m.Year && a.AppliedAt.Month == m.MonthNum);
                }

                trendData.Add(new { month = m.Month, count = count });
            }

            return Ok(new
            {
                Global = new
                {
                    TotalJobs = totalJobs,
                    TotalApplications = totalApplications,
                    TotalRecruiters = totalRecruiters,
                    TotalCandidates = totalCandidates,
                    TotalInterviews = totalInterviews,
                    PendingApplications = pendingApplications,
                    SelectedCandidates = selectedApplications,
                    RejectedCandidates = rejectedApplications
                },
                Recruiter = role == "Recruiter" ? new
                {
                    TotalJobs = recruiterJobs,
                    TotalApplications = recruiterApps,
                    TotalInterviews = recruiterInterviews,
                    PendingApplications = recruiterPending,
                    SelectedCandidates = recruiterSelected,
                    RejectedCandidates = recruiterRejected
                } : null,
                MonthlyTrend = trendData
            });
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
}
