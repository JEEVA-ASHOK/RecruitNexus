using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompaniesController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;

        public CompaniesController(RecruitmentDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCompanies()
        {
            var companies = await _context.Companies.ToListAsync();
            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompanyById(int id)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id);
            if (company == null)
            {
                return NotFound(new { message = "Company not found." });
            }

            // Also retrieve open jobs for this company
            var openJobs = await _context.Jobs
                .Where(j => j.CompanyId == id && j.Status == "Open")
                .Select(j => new JobDto
                {
                    Id = j.Id,
                    RecruiterId = j.RecruiterId,
                    RecruiterName = string.IsNullOrEmpty(j.CompanyName) ? (j.Recruiter != null ? j.Recruiter.FullName : "Unknown") : j.CompanyName,
                    CompanyName = string.IsNullOrEmpty(j.CompanyName) ? (j.Recruiter != null ? j.Recruiter.FullName : "Unknown") : j.CompanyName,
                    Title = j.Title,
                    Description = j.Description,
                    Requirements = j.Requirements,
                    Location = j.Location,
                    JobType = j.JobType,
                    SalaryRange = j.SalaryRange,
                    Status = j.Status,
                    CreatedAt = j.CreatedAt,
                    ApplicationCount = _context.Applications.Count(a => a.JobId == j.Id),
                    ApplicationDeadline = j.ApplicationDeadline
                })
                .ToListAsync();

            return Ok(new
            {
                company.Id,
                company.Name,
                company.Logo,
                company.Industry,
                company.Website,
                company.Location,
                company.About,
                OpenJobs = openJobs
            });
        }

        [HttpGet("my-company")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> GetMyCompany()
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.CompanyId == null)
            {
                return NotFound(new { message = "Recruiter does not belong to any company." });
            }

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == user.CompanyId);
            if (company == null)
            {
                return NotFound(new { message = "Company not found." });
            }

            return Ok(company);
        }

        [HttpPut("my-company")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> UpdateMyCompany([FromBody] CompanyUpdateRequest request)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.CompanyId == null)
            {
                return NotFound(new { message = "Recruiter does not belong to any company." });
            }

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == user.CompanyId);
            if (company == null)
            {
                return NotFound(new { message = "Company not found." });
            }

            company.Name = request.Name ?? company.Name;
            company.Logo = request.Logo ?? company.Logo;
            company.Industry = request.Industry ?? company.Industry;
            company.Website = request.Website ?? company.Website;
            company.Location = request.Location ?? company.Location;
            company.About = request.About ?? company.About;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Company profile updated successfully.", company });
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
    }

    public class CompanyUpdateRequest
    {
        public string? Name { get; set; }
        public string? Logo { get; set; }
        public string? Industry { get; set; }
        public string? Website { get; set; }
        public string? Location { get; set; }
        public string? About { get; set; }
    }
}
