using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Application
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public Job? Job { get; set; }

        public int CandidateId { get; set; }
        public User? Candidate { get; set; }

        public string? CoverLetter { get; set; } = string.Empty;
        public string? ResumePath { get; set; } = string.Empty;
        public string? Status { get; set; } = "Applied"; // Applied, Reviewing, Interviewing, Offered, Rejected
        
        public int MatchingScore { get; set; } = 0;
        public string? AI_Feedback { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }

        public string? RecruiterNotes { get; set; } = string.Empty;
        public string? OfferLetterContent { get; set; } = string.Empty;
        public string? OfferStatus { get; set; } = "None"; // None, Pending, Accepted, Rejected
 
        // Navigation properties
        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    }
}
