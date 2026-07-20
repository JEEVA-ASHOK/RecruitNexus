using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Job
    {
        public int Id { get; set; }
        public int RecruiterId { get; set; }
        
        [JsonIgnore]
        public User? Recruiter { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string? CompanyName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string JobType { get; set; } = "FullTime"; // FullTime, PartTime, Remote, Contract
        public string SalaryRange { get; set; } = string.Empty;
        public string Status { get; set; } = "Open"; // Open, Closed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
        public DateTime? ApplicationDeadline { get; set; }

        // Navigation properties
        public ICollection<Application> Applications { get; set; } = new List<Application>();
    }
}
