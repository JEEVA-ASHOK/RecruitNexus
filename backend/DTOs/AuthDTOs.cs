using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class RegisterRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "Candidate"; // "Candidate" or "Recruiter"
    }

    public class LoginRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string[] Skills { get; set; } = Array.Empty<string>();
        public int ExperienceYears { get; set; }
        public string ResumePath { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string AI_Summary { get; set; } = string.Empty;
    }

    public class UpdateProfileRequest
    {
        public string Bio { get; set; } = string.Empty;
        public string[] Skills { get; set; } = Array.Empty<string>();
        public int ExperienceYears { get; set; }
        public string Education { get; set; } = string.Empty;
    }
}
