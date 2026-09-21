using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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
    public class AuthController : ControllerBase
    {
        private readonly RecruitmentDbContext _context;
        private readonly IGeminiService _geminiService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(RecruitmentDbContext context, IGeminiService geminiService, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _geminiService = geminiService;
            _configuration = configuration;
            _emailService = emailService;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            var emailLower = request.Email.Trim().ToLower();
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailLower))
            {
                return BadRequest(new { message = "Email already registered." });
            }

            var roleNormalized = "Candidate";
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var trimmed = request.Role.Trim();
                if (trimmed.Equals("recruiter", StringComparison.OrdinalIgnoreCase))
                {
                    roleNormalized = "Recruiter";
                }
                else if (trimmed.Equals("admin", StringComparison.OrdinalIgnoreCase))
                {
                    roleNormalized = "Admin";
                }
            }

            var user = new User
            {
                Email = emailLower,
                FullName = request.FullName,
                Role = roleNormalized
            };

            if (user.Role == "Recruiter")
            {
                var companyName = string.IsNullOrWhiteSpace(request.FullName) ? "Independent Recruiter" : request.FullName.Trim();
                var company = await _context.Companies.FirstOrDefaultAsync(c => c.Name.ToLower() == companyName.ToLower());
                if (company == null)
                {
                    company = new Company { Name = companyName };
                    _context.Companies.Add(company);
                    await _context.SaveChangesAsync();
                }
                user.CompanyId = company.Id;
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create empty profile if Candidate
            if (user.Role == "Candidate")
            {
                var profile = new Profile
                {
                    UserId = user.Id,
                    Bio = "No bio added yet.",
                    Skills = "[]",
                    ExperienceYears = 0,
                    ResumePath = "",
                    AI_Summary = ""
                };
                _context.Profiles.Add(profile);
                await _context.SaveChangesAsync();
            }

            if (user.Role == "Candidate")
            {
                var welcomeSubject = "Welcome to RecruitNexus!";
                var welcomeBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #0056b3;'>Welcome to RecruitNexus, {user.FullName}!</h2>
                        <p>Thank you for registering on our platform as a candidate.</p>
                        <p>You can now log in, upload your PDF resume, view automatic AI resume alignments, save jobs of interest, and apply for open positions.</p>
                        <br/>
                        <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                    </div>";
                await _emailService.SendEmailAsync(user.Email, welcomeSubject, welcomeBody);
            }

            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            var emailLower = request.Email.Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = JwtHelper.GenerateJwtToken(user, _configuration);

            // Send non-blocking login notification email for candidate logins
            if (user.Role == "Candidate" && !string.IsNullOrWhiteSpace(user.Email))
            {
                var loginEmail = user.Email;
                var fullName = user.FullName;
                var loginTimeIst = DateTime.UtcNow.AddHours(5).AddMinutes(30).ToString("f");

                _ = Task.Run(async () =>
                {
                    try
                    {
                        var subject = "Security Alert: Successful Login to RecruitNexus";
                        var body = $@"
                            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                                <h2 style='color: #0056b3;'>New Account Login Detected</h2>
                                <p>Dear {fullName},</p>
                                <p>Your RecruitNexus candidate account was successfully logged in.</p>
                                <p><strong>Login Date & Time (IST):</strong> {loginTimeIst}</p>
                                <p><strong>Security Message:</strong> If this login was authorized by you, no further action is required. If you did not initiate this login, please reset your password immediately.</p>
                                <br/>
                                <p>Best regards,<br/><strong>The RecruitNexus Security Team</strong></p>
                            </div>";

                        await _emailService.SendEmailAsync(loginEmail, subject, body);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[LOGIN EMAIL WARNING] Safe log: Failed to dispatch login notification: {ex.Message}");
                    }
                });
            }

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role
            });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetUserId();
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null) return NotFound(new { message = "User not found." });

                string[] skillsArray = Array.Empty<string>();
                if (user.Profile?.Skills != null)
                {
                    try
                    {
                        skillsArray = JsonSerializer.Deserialize<string[]>(user.Profile.Skills) ?? Array.Empty<string>();
                    }
                    catch { }
                }

                // Default FirstName and LastName from user.FullName if not set in profile
                var defaultFirstName = "";
                var defaultLastName = "";
                if (!string.IsNullOrWhiteSpace(user.FullName))
                {
                    var nameParts = user.FullName.Trim().Split(' ', 2);
                    defaultFirstName = nameParts[0];
                    if (nameParts.Length > 1) defaultLastName = nameParts[1];
                }

                return Ok(new UserProfileDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    Bio = user.Profile?.Bio ?? "",
                    Skills = skillsArray,
                    ExperienceYears = user.Profile?.ExperienceYears ?? 0,
                    ResumePath = user.Profile?.ResumePath ?? "",
                    Education = user.Profile?.Education ?? "",
                    AI_Summary = user.Profile?.AI_Summary ?? "",
                    FirstName = !string.IsNullOrWhiteSpace(user.Profile?.FirstName) ? user.Profile!.FirstName : defaultFirstName,
                    LastName = !string.IsNullOrWhiteSpace(user.Profile?.LastName) ? user.Profile!.LastName : defaultLastName,
                    Gender = user.Profile?.Gender ?? "",
                    DateOfBirth = user.Profile?.DateOfBirth ?? "",
                    PhoneNumber = user.Profile?.PhoneNumber ?? "",
                    Address = user.Profile?.Address ?? "",
                    City = user.Profile?.City ?? "",
                    Country = user.Profile?.Country ?? ""
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile == null)
                {
                    return NotFound(new { message = "Profile not found." });
                }

                profile.Bio = request.Bio;
                profile.Skills = JsonSerializer.Serialize(request.Skills);
                profile.ExperienceYears = request.ExperienceYears;
                profile.Education = request.Education;

                if (request.FirstName != null) profile.FirstName = request.FirstName;
                if (request.LastName != null) profile.LastName = request.LastName;
                if (request.Gender != null) profile.Gender = request.Gender;
                if (request.DateOfBirth != null) profile.DateOfBirth = request.DateOfBirth;
                if (request.PhoneNumber != null) profile.PhoneNumber = request.PhoneNumber;
                if (request.Address != null) profile.Address = request.Address;
                if (request.City != null) profile.City = request.City;
                if (request.Country != null) profile.Country = request.Country;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Profile updated successfully." });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }
        }

        [HttpPut("profile/personal-info")]
        [Authorize]
        public async Task<IActionResult> UpdatePersonalProfile([FromBody] UpdatePersonalProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var user = await _context.Users
                    .Include(u => u.Profile)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null) return NotFound(new { message = "User not found." });

                if (user.Profile == null)
                {
                    user.Profile = new Profile { UserId = user.Id };
                    _context.Profiles.Add(user.Profile);
                }

                var p = user.Profile;
                if (request.FirstName != null) p.FirstName = request.FirstName.Trim();
                if (request.LastName != null) p.LastName = request.LastName.Trim();
                if (request.Gender != null) p.Gender = request.Gender;
                if (request.DateOfBirth != null) p.DateOfBirth = request.DateOfBirth;

                var phoneVal = request.Phone ?? request.PhoneNumber;
                if (phoneVal != null) p.PhoneNumber = phoneVal.Trim();

                if (request.Address != null) p.Address = request.Address.Trim();
                if (request.City != null) p.City = request.City.Trim();
                if (request.Country != null) p.Country = request.Country.Trim();

                // Keep user.FullName in sync if names are provided
                if (!string.IsNullOrWhiteSpace(p.FirstName) || !string.IsNullOrWhiteSpace(p.LastName))
                {
                    user.FullName = $"{p.FirstName ?? ""} {p.LastName ?? ""}".Trim();
                }

                await _context.SaveChangesAsync();

                string[] skillsArray = Array.Empty<string>();
                if (p.Skills != null)
                {
                    try
                    {
                        skillsArray = JsonSerializer.Deserialize<string[]>(p.Skills) ?? Array.Empty<string>();
                    }
                    catch { }
                }

                return Ok(new UserProfileDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    Bio = p.Bio ?? "",
                    Skills = skillsArray,
                    ExperienceYears = p.ExperienceYears,
                    ResumePath = p.ResumePath ?? "",
                    Education = p.Education ?? "",
                    AI_Summary = p.AI_Summary ?? "",
                    FirstName = p.FirstName ?? "",
                    LastName = p.LastName ?? "",
                    Gender = p.Gender ?? "",
                    DateOfBirth = p.DateOfBirth ?? "",
                    PhoneNumber = p.PhoneNumber ?? "",
                    Address = p.Address ?? "",
                    City = p.City ?? "",
                    Country = p.Country ?? ""
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Unable to save personal information: {ex.Message}" });
            }
        }

        [HttpPost("profile/photo")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No photo file provided." });
                }

                // Validate 5 MB max size
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Image size must be 5 MB or less." });
                }

                string extension = Path.GetExtension(file.FileName).ToLower();
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Only JPG, JPEG, PNG, and WEBP formats are allowed." });
                }

                var userId = GetUserId();
                var photosDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "profile-photos", userId.ToString());
                if (!Directory.Exists(photosDir))
                {
                    Directory.CreateDirectory(photosDir);
                }

                var fileName = $"photo_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(photosDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/profile-photos/{userId}/{fileName}";
                return Ok(new { message = "Profile photo validated and uploaded successfully.", photoUrl = relativePath, userId = userId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading profile photo.", error = ex.Message });
            }
        }

        [HttpPost("profile/resume")]
        [Authorize]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded." });
                }

                // Validate 5 MB file size limit
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Resume file size must be 5 MB or less." });
                }

                var userId = GetUserId();
                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile == null)
                {
                    return BadRequest(new { message = "Only candidates can upload resumes." });
                }

                string extension = Path.GetExtension(file.FileName).ToLower();
                string[] allowedExtensions = { ".pdf", ".docx", ".txt" };
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Only PDF, DOCX, and TXT resume files are supported." });
                }

                // Create uploads directory
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                var fileName = $"{userId}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Extract text
                string extractedText = "";
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
                                extractedText = textBuilder.ToString();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new { message = "Failed to parse PDF: " + ex.Message });
                    }
                }
                else if (extension == ".docx")
                {
                    try
                    {
                        using (var archive = System.IO.Compression.ZipFile.OpenRead(filePath))
                        {
                            var entry = archive.GetEntry("word/document.xml");
                            if (entry != null)
                            {
                                using (var stream = entry.Open())
                                using (var reader = new StreamReader(stream))
                                {
                                    string xml = reader.ReadToEnd();
                                    var doc = System.Xml.Linq.XDocument.Parse(xml);
                                    var textNodes = doc.Descendants().Where(e => e.Name.LocalName == "t");
                                    extractedText = string.Join(" ", textNodes.Select(t => t.Value));
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new { message = "Failed to parse DOCX file: " + ex.Message });
                    }
                }
                else
                {
                    extractedText = await System.IO.File.ReadAllTextAsync(filePath);
                }

                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    return BadRequest(new { message = "Could not extract text from the resume. Please ensure it is not scanned/image-only." });
                }

                // Call Gemini for detailed analysis
                var analysis = await _geminiService.GenerateResumeAnalysisAsync(extractedText, "Software Engineer", "Full stack developer role", "React, C#, SQL, REST APIs");

                // Update candidate profile path
                profile.ResumePath = fileName;
                profile.AI_Summary = $"Resume parsed on {DateTime.UtcNow:g}. ATS Score: {analysis.AtsScore}%.";
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Resume uploaded and analyzed successfully.",
                    resumePath = fileName,
                    analysis = analysis
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Session expired or invalid user context." });
            }
        }

        [HttpPost("profile/analyze-resume")]
        [Authorize]
        public async Task<IActionResult> AnalyzeSavedResume([FromQuery] int? jobId)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile == null || string.IsNullOrWhiteSpace(profile.ResumePath))
                {
                    return BadRequest(new { message = "No resume found. Please upload a resume first." });
                }

                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", profile.ResumePath);
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Uploaded resume file was not found on server." });
                }

                string extension = Path.GetExtension(filePath).ToLower();
                string extractedText = "";

                if (extension == ".pdf")
                {
                    using (var pdfStream = System.IO.File.OpenRead(filePath))
                    using (var document = PdfDocument.Open(pdfStream))
                    {
                        var textBuilder = new StringBuilder();
                        foreach (var page in document.GetPages()) textBuilder.AppendLine(page.Text);
                        extractedText = textBuilder.ToString();
                    }
                }
                else if (extension == ".docx")
                {
                    using (var archive = System.IO.Compression.ZipFile.OpenRead(filePath))
                    {
                        var entry = archive.GetEntry("word/document.xml");
                        if (entry != null)
                        {
                            using (var stream = entry.Open())
                            using (var reader = new StreamReader(stream))
                            {
                                string xml = reader.ReadToEnd();
                                var doc = System.Xml.Linq.XDocument.Parse(xml);
                                var textNodes = doc.Descendants().Where(e => e.Name.LocalName == "t");
                                extractedText = string.Join(" ", textNodes.Select(t => t.Value));
                            }
                        }
                    }
                }
                else
                {
                    extractedText = await System.IO.File.ReadAllTextAsync(filePath);
                }

                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    return BadRequest(new { message = "Could not extract text from the stored resume file." });
                }

                string jobTitle = "Software Engineer";
                string jobDesc = "Full stack software development role.";
                string jobReqs = "React, C#, SQL, REST APIs.";

                if (jobId.HasValue && jobId.Value > 0)
                {
                    var targetJob = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId.Value);
                    if (targetJob != null)
                    {
                        jobTitle = targetJob.Title;
                        jobDesc = targetJob.Description;
                        jobReqs = targetJob.Requirements;
                    }
                }

                var analysis = await _geminiService.GenerateResumeAnalysisAsync(extractedText, jobTitle, jobDesc, jobReqs);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error analyzing resume: " + ex.Message });
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
            throw new UnauthorizedAccessException("User context is missing.");
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var emailLower = request.Email.Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

            if (user != null)
            {
                // Generate a cryptographically secure random token (64 hex characters)
                var bytes = new byte[32];
                using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
                {
                    rng.GetBytes(bytes);
                }
                var token = Convert.ToHexString(bytes).ToLower();

                // Save token with 15-minute expiration
                user.PasswordResetToken = token;
                user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);
                await _context.SaveChangesAsync();

                // Dispatch Email Notification using existing IEmailService
                try
                {
                    var subject = "RecruitNexus Password Reset Request";
                    var body = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                            <h2 style='color: #0056b3;'>Password Reset Request</h2>
                            <p>Dear User,</p>
                            <p>We received a request to reset your password for your RecruitNexus account. Click the button below to reset it:</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='http://localhost:5173/reset-password?token={token}' style='background-color: #0056b3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>
                            </div>
                            <p>This link will expire in 15 minutes.</p>
                            <p>If you did not request a password reset, please ignore this email.</p>
                            <br/>
                            <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                        </div>";

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
                catch (Exception ex)
                {
                    // Silently log and swallow exception to never crash the API or rollback DB
                }
            }

            // Always return a generic message to prevent email enumeration/harvesting attacks
            return Ok(new { message = "If the email is registered, a password reset link has been sent." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token) || 
                string.IsNullOrWhiteSpace(request.NewPassword) || 
                string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match." });
            }

            // Validate password strength: minimum 6 characters
            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters long." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

            if (user == null || !user.ResetTokenExpiry.HasValue || user.ResetTokenExpiry.Value < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired password reset link." });
            }

            // Hash the new password and update
            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);

            // Invalidate the reset token immediately
            user.PasswordResetToken = null;
            user.ResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password has been successfully reset." });
        }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
