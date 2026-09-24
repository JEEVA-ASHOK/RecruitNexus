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
    public class JobsController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;

        public JobsController(RecruitmentDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobs([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] bool all = false)
        {
            page = page < 1 ? 1 : page;
            if (!all)
            {
                pageSize = pageSize < 1 ? 20 : (pageSize > 100 ? 100 : pageSize);
            }

            var query = _context.Jobs
                .AsNoTracking()
                .OrderByDescending(j => j.CreatedAt)
                .ThenByDescending(j => j.Id);

            var totalCount = await query.CountAsync();

            var projectedQuery = query.Select(j => new JobDto
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
                ApplicationCount = j.Applications.Count,
                ApplicationDeadline = j.ApplicationDeadline,
                CompanyId = j.CompanyId
            });

            List<JobDto> items;
            if (all)
            {
                items = await projectedQuery.ToListAsync();
                pageSize = totalCount > 0 ? totalCount : 20;
            }
            else
            {
                items = await projectedQuery
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }

            var response = PaginatedResponse<JobDto>.Create(items, totalCount, page, pageSize);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobById(int id)
        {
            var job = await _context.Jobs
                .AsNoTracking()
                .Include(j => j.Recruiter)
                .Include(j => j.Applications)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
            {
                return NotFound(new { message = "Job not found." });
            }

            var jobDto = new JobDto
            {
                Id = job.Id,
                RecruiterId = job.RecruiterId,
                RecruiterName = string.IsNullOrEmpty(job.CompanyName) ? (job.Recruiter != null ? job.Recruiter.FullName : "Unknown") : job.CompanyName,
                CompanyName = string.IsNullOrEmpty(job.CompanyName) ? (job.Recruiter != null ? job.Recruiter.FullName : "Unknown") : job.CompanyName,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Location = job.Location,
                JobType = job.JobType,
                SalaryRange = job.SalaryRange,
                Status = job.Status,
                CreatedAt = job.CreatedAt,
                ApplicationCount = job.Applications.Count,
                ApplicationDeadline = job.ApplicationDeadline,
                CompanyId = job.CompanyId
            };

            return Ok(jobDto);
        }

        [HttpPost]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> CreateJob([FromBody] JobCreateRequest request)
        {
            var recruiterId = GetUserId();
            if (!recruiterId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var recruiter = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == recruiterId.Value);
            int? companyId = recruiter?.CompanyId;

            var job = new Job
            {
                RecruiterId = recruiterId.Value,
                CompanyId = companyId,
                Title = request.Title,
                CompanyName = string.IsNullOrWhiteSpace(request.CompanyName) ? (recruiter?.FullName ?? string.Empty) : request.CompanyName,
                Description = request.Description,
                Requirements = request.Requirements,
                Location = request.Location,
                JobType = request.JobType,
                SalaryRange = request.SalaryRange,
                Status = "Open",
                CreatedAt = DateTime.UtcNow,
                ApplicationDeadline = request.ApplicationDeadline
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, new { message = "Job posted successfully.", id = job.Id });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> UpdateJob(int id, [FromBody] JobCreateRequest request)
        {
            var recruiterId = GetUserId();
            if (!recruiterId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == id);

            if (job == null) return NotFound(new { message = "Job not found." });

            // Only owner recruiter can update (unless Admin)
            if (job.RecruiterId != recruiterId.Value && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            job.Title = request.Title;
            job.CompanyName = request.CompanyName;
            job.Description = request.Description;
            job.Requirements = request.Requirements;
            job.Location = request.Location;
            job.JobType = request.JobType;
            job.SalaryRange = request.SalaryRange;
            job.ApplicationDeadline = request.ApplicationDeadline;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Job updated successfully." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Recruiter,Admin")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var recruiterId = GetUserId();
            if (!recruiterId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == id);

            if (job == null) return NotFound(new { message = "Job not found." });

            if (job.RecruiterId != recruiterId.Value && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Job deleted successfully." });
        }

        [HttpPost("{id}/save")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> SaveJob(int id)
        {
            var candidateId = GetUserId();
            if (!candidateId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var jobExists = await _context.Jobs.AnyAsync(j => j.Id == id);
            if (!jobExists)
            {
                return NotFound(new { message = "Job not found." });
            }

            var alreadySaved = await _context.SavedJobs.AnyAsync(s => s.CandidateId == candidateId.Value && s.JobId == id);
            if (alreadySaved)
            {
                return BadRequest(new { message = "Job is already saved." });
            }

            var savedJob = new SavedJob
            {
                CandidateId = candidateId.Value,
                JobId = id,
                SavedAt = DateTime.UtcNow
            };

            _context.SavedJobs.Add(savedJob);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job saved successfully." });
        }

        [HttpDelete("{id}/save")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UnsaveJob(int id)
        {
            var candidateId = GetUserId();
            if (!candidateId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var savedJob = await _context.SavedJobs
                .FirstOrDefaultAsync(s => s.CandidateId == candidateId.Value && s.JobId == id);

            if (savedJob == null)
            {
                return NotFound(new { message = "Saved job not found." });
            }

            _context.SavedJobs.Remove(savedJob);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job removed from saved list successfully." });
        }

        [HttpGet("saved")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetSavedJobs()
        {
            var candidateId = GetUserId();
            if (!candidateId.HasValue)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }

            var savedJobs = await _context.SavedJobs
                .AsNoTracking()
                .Where(s => s.CandidateId == candidateId.Value)
                .OrderByDescending(s => s.SavedAt)
                .Select(s => new JobDto
                {
                    Id = s.Job!.Id,
                    RecruiterId = s.Job.RecruiterId,
                    RecruiterName = string.IsNullOrEmpty(s.Job.CompanyName) ? (s.Job.Recruiter != null ? s.Job.Recruiter.FullName : "Unknown") : s.Job.CompanyName,
                    CompanyName = string.IsNullOrEmpty(s.Job.CompanyName) ? (s.Job.Recruiter != null ? s.Job.Recruiter.FullName : "Unknown") : s.Job.CompanyName,
                    Title = s.Job.Title,
                    Description = s.Job.Description,
                    Requirements = s.Job.Requirements,
                    Location = s.Job.Location,
                    JobType = s.Job.JobType,
                    SalaryRange = s.Job.SalaryRange,
                    Status = s.Job.Status,
                    CreatedAt = s.Job.CreatedAt,
                    ApplicationCount = _context.Applications.Count(a => a.JobId == s.Job.Id),
                    ApplicationDeadline = s.Job.ApplicationDeadline
                })
                .ToListAsync();

            return Ok(savedJobs);
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
    }
}
