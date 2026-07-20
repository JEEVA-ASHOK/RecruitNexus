using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Interview
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public Application? Application { get; set; }

        public int InterviewerId { get; set; }
        public User? Interviewer { get; set; }

        public DateTime InterviewDate { get; set; }
        public string? Format { get; set; } = "Online"; // Online, InPerson
        public string? MeetingLink { get; set; } = string.Empty;
        public string? Notes { get; set; } = string.Empty;
        public string? AI_Questions { get; set; } = string.Empty; // Store generated questions
        public string? Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled

        public string? HrName { get; set; } = string.Empty;
        public string? HrEmail { get; set; } = string.Empty;
        public string? HrPhone { get; set; } = string.Empty;
        public string? CompanyName { get; set; } = string.Empty;
        public string? OfficeAddress { get; set; } = string.Empty;
        public string? Venue { get; set; } = string.Empty;
        public string? ReportingTime { get; set; } = string.Empty;
        public string? DressCode { get; set; } = string.Empty;
        public string? RequiredDocuments { get; set; } = string.Empty;
        public string? CandidateConfirmation { get; set; } = "Pending"; // Pending, Confirmed, CannotAttend, RescheduleRequested
        public string? ResultStatus { get; set; } = "Pending"; // Selected, Rejected, OnHold, NextRound, Pending
        public string? Feedback { get; set; } = string.Empty;
        public string? Remarks { get; set; } = string.Empty;
    }
}
