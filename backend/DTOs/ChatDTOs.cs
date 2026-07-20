using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ChatMessageDto
    {
        [Required]
        public string Sender { get; set; } = "user"; // "user" or "ai"

        [Required]
        public string Text { get; set; } = string.Empty;
    }

    public class ChatRequest
    {
        [Required]
        public string Message { get; set; } = string.Empty;

        public List<ChatMessageDto> History { get; set; } = new();
    }

    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
    }
}
