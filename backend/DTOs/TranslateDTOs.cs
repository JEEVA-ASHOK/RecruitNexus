using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class TranslationRequest
    {
        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public string TargetLanguage { get; set; } = string.Empty; // e.g. "Tamil", "Kannada", "Malayalam", "Hindi", "Japanese"
    }

    public class TranslationResponse
    {
        public string TranslatedText { get; set; } = string.Empty;
    }
}
