using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class JobCreateRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Requirements { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public string JobType { get; set; } = "FullTime"; // FullTime, PartTime, Remote, Contract

        public string SalaryRange { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public DateTime? ApplicationDeadline { get; set; }
    }

    public class JobDto
    {
        public int Id { get; set; }
        public int RecruiterId { get; set; }
        public string RecruiterName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public string SalaryRange { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ApplicationCount { get; set; }
        public DateTime? ApplicationDeadline { get; set; }
        public int? CompanyId { get; set; }
    }
}
