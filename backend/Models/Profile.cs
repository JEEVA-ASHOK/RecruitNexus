using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Profile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        
        [JsonIgnore]
        public User? User { get; set; }
        
        public string Bio { get; set; } = string.Empty;
        public string Skills { get; set; } = "[]"; // JSON array representation of skills
        public int ExperienceYears { get; set; } = 0;
        public string ResumePath { get; set; } = string.Empty;
        public string Education { get; set; } = string.Empty;
        public string AI_Summary { get; set; } = string.Empty;

        // Phase 2 Personal Information Fields
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
        public string? DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }
}
