using System;

namespace backend.DTOs
{
    public class ApplicationSubmitRequest
    {
        public string CoverLetter { get; set; } = string.Empty;
        // The resume file will be uploaded via form data.
    }

    public class ApplicationDto
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string JobCompany { get; set; } = string.Empty;
        public int CandidateId { get; set; }
        public string CandidateName { get; set; } = string.Empty;
        public string CoverLetter { get; set; } = string.Empty;
        public string ResumePath { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int MatchingScore { get; set; }
        public string AI_Feedback { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
        public string RecruiterNotes { get; set; } = string.Empty;
        public string OfferLetterContent { get; set; } = string.Empty;
        public string OfferStatus { get; set; } = string.Empty;
    }
}
