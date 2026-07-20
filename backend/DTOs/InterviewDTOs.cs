using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class InterviewScheduleRequest
    {
        [Required]
        public int ApplicationId { get; set; }

        [Required]
        public DateTime InterviewDate { get; set; }

        [Required]
        public string Format { get; set; } = "Online"; // Online, InPerson

        public string MeetingLink { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;

        public string HrName { get; set; } = string.Empty;
        public string HrEmail { get; set; } = string.Empty;
        public string HrPhone { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string OfficeAddress { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public string ReportingTime { get; set; } = string.Empty;
        public string DressCode { get; set; } = string.Empty;
        public string RequiredDocuments { get; set; } = string.Empty;
    }

    public class InterviewDto
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string CandidateName { get; set; } = string.Empty;
        public string InterviewerName { get; set; } = string.Empty;
        public DateTime InterviewDate { get; set; }
        public string Format { get; set; } = string.Empty;
        public string MeetingLink { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string AI_Questions { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public string HrName { get; set; } = string.Empty;
        public string HrEmail { get; set; } = string.Empty;
        public string HrPhone { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string OfficeAddress { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public string ReportingTime { get; set; } = string.Empty;
        public string DressCode { get; set; } = string.Empty;
        public string RequiredDocuments { get; set; } = string.Empty;
        public string CandidateConfirmation { get; set; } = string.Empty;
        public string ResultStatus { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
    }
}
