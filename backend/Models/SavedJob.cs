using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class SavedJob
    {
        public int Id { get; set; }
        
        public int CandidateId { get; set; }
        [JsonIgnore]
        public User? Candidate { get; set; }

        public int JobId { get; set; }
        public Job? Job { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
