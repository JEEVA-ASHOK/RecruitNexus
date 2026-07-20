using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "Candidate"; // "Candidate", "Recruiter", "Admin"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }

        public string? PasswordResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }

        // Navigation properties
        public Profile? Profile { get; set; }
        public ICollection<Job> CreatedJobs { get; set; } = new List<Job>();
        public ICollection<Application> Applications { get; set; } = new List<Application>();
        public ICollection<Interview> InterviewsAsInterviewer { get; set; } = new List<Interview>();
    }
}
