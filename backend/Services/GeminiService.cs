using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using backend.DTOs;

namespace backend.Services
{
    public interface IGeminiService
    {
        Task<ParsedResumeResult> ParseResumeAsync(string resumeText);
        Task<JobMatchResult> MatchResumeAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements);
        Task<InterviewQuestionsResult> GenerateInterviewQuestionsAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements);
        Task<string> GetChatReplyAsync(string message, string userContext, List<ChatMessageDto> history);
        Task<string> TranslateTextAsync(string text, string targetLanguage);
    }

    public class ParsedResumeResult
    {
        public string Bio { get; set; } = string.Empty;
        public string[] Skills { get; set; } = Array.Empty<string>();
        public int ExperienceYears { get; set; }
    }

    public class JobMatchResult
    {
        public int Score { get; set; }
        public string Feedback { get; set; } = string.Empty;
    }

    public class InterviewQuestionItem
    {
        public string QuestionText { get; set; } = string.Empty;
        public string Rationale { get; set; } = string.Empty;
    }

    public class InterviewQuestionsResult
    {
        public InterviewQuestionItem[] Questions { get; set; } = Array.Empty<InterviewQuestionItem>();
    }

    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;
        private readonly ILogger<GeminiService> _logger;

        public GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            // Get from environment or config
            _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
                       ?? configuration["Gemini:ApiKey"];
            
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogWarning("GEMINI_API_KEY is not configured. AI features will run in mock mode.");
            }
        }

        public async Task<ParsedResumeResult> ParseResumeAsync(string resumeText)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                // Fallback Mock
                return GetMockParsedResume(resumeText);
            }

            string prompt = $@"Analyze the following resume text and extract candidate information.
Provide a short professional bio, a list of key technical skills, and estimate the total years of work experience.
Output MUST be a JSON object matching this schema EXACTLY:
{{
  ""Bio"": ""string"",
  ""Skills"": [""string""],
  ""ExperienceYears"": integer
}}
Do not include any markdown formatting wrappers (like ```json) in the raw content, just return the raw JSON structure.

Resume text:
{resumeText}";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                var result = JsonSerializer.Deserialize<ParsedResumeResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return result ?? GetMockParsedResume(resumeText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing resume with Gemini API. Falling back to mock.");
                return GetMockParsedResume(resumeText);
            }
        }

        public async Task<JobMatchResult> MatchResumeAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return new JobMatchResult { Score = 75, Feedback = "Mock feedback: Gemini API key is missing. The candidate appears to have some relevant technical skills." };
            }

            string prompt = $@"Compare the candidate's resume details with the job description and requirements.
Evaluate how well the candidate fits the job. Provide:
1. A compatibility score (integer between 0 and 100).
2. A detailed feedback paragraph summarizing their strengths, skill gaps, and custom recommendations.
Output MUST be a JSON object matching this schema EXACTLY:
{{
  ""Score"": integer,
  ""Feedback"": ""string""
}}
Do not include any markdown formatting wrappers, just return the raw JSON structure.

Job Details:
Title: {jobTitle}
Description: {jobDescription}
Requirements: {jobRequirements}

Candidate Resume:
{resumeText}";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                var result = JsonSerializer.Deserialize<JobMatchResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return result ?? new JobMatchResult { Score = 50, Feedback = "Failed to parse API match response." };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error matching resume with Gemini API. Falling back to mock.");
                return new JobMatchResult { Score = 60, Feedback = "AI Match Error: " + ex.Message };
            }
        }

        public async Task<InterviewQuestionsResult> GenerateInterviewQuestionsAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return GetMockQuestions();
            }

            string prompt = $@"Given the candidate's resume/profile details and the job requirements, generate exactly 5 targeted interview questions (a mix of technical skill checks and behavioral inquiries) along with the rationale or focus of each question.
Output MUST be a JSON object matching this schema EXACTLY:
{{
  ""Questions"": [
    {{
      ""QuestionText"": ""string"",
      ""Rationale"": ""string""
    }}
  ]
}}
Do not include any markdown formatting wrappers, just return the raw JSON structure.

Job Details:
Title: {jobTitle}
Description: {jobDescription}
Requirements: {jobRequirements}

Candidate Resume:
{resumeText}";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                var result = JsonSerializer.Deserialize<InterviewQuestionsResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return result ?? GetMockQuestions();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating interview questions with Gemini API. Falling back to mock.");
                return GetMockQuestions();
            }
        }

        private async Task<string> CallGeminiApiAsync(string prompt)
        {
            // We use the gemini-1.5-flash model which is stable and quick
            string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json"
                }
            };

            string jsonPayload = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            string rawResponse = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(rawResponse);
            
            // Extract the generated text from Gemini API response JSON structure:
            // candidates[0].content.parts[0].text
            var textElement = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text");

            string text = textElement.GetString() ?? string.Empty;
            return text.Trim();
        }

        private ParsedResumeResult GetMockParsedResume(string text)
        {
            // Simple heuristic to extract basic things from text
            var skills = new List<string> { "C#", "React", "JavaScript", "SQL", "HTML/CSS" };
            if (text.Contains("Python", StringComparison.OrdinalIgnoreCase)) skills.Add("Python");
            if (text.Contains("TypeScript", StringComparison.OrdinalIgnoreCase)) skills.Add("TypeScript");
            if (text.Contains("Docker", StringComparison.OrdinalIgnoreCase)) skills.Add("Docker");
            if (text.Contains("AWS", StringComparison.OrdinalIgnoreCase)) skills.Add("AWS");

            int years = 2;
            if (text.Contains("senior", StringComparison.OrdinalIgnoreCase)) years = 6;
            else if (text.Contains("lead", StringComparison.OrdinalIgnoreCase)) years = 8;
            else if (text.Contains("junior", StringComparison.OrdinalIgnoreCase)) years = 1;

            return new ParsedResumeResult
            {
                Bio = "Experienced software developer with a background in building web applications and writing clean code.",
                Skills = skills.ToArray(),
                ExperienceYears = years
            };
        }

        private InterviewQuestionsResult GetMockQuestions()
        {
            return new InterviewQuestionsResult
            {
                Questions = new[]
                {
                    new InterviewQuestionItem { QuestionText = "Can you describe a challenging project you built using C# or React and how you solved technical difficulties?", Rationale = "Assesses direct experience with our core stack." },
                    new InterviewQuestionItem { QuestionText = "How do you optimize SQL database queries for heavy read operations?", Rationale = "Evaluates backend performance and database understanding." },
                    new InterviewQuestionItem { QuestionText = "What is your approach to handling cross-origin resource sharing (CORS) in web applications?", Rationale = "Tests core web infrastructure knowledge." },
                    new InterviewQuestionItem { QuestionText = "Describe a situation where you had to collaborate with a cross-functional team under tight deadlines.", Rationale = "Evaluates soft skills and behavioral competence." },
                    new InterviewQuestionItem { QuestionText = "How do you stay up-to-date with new technologies and frameworks?", Rationale = "Measures passion and continuous learning mindset." }
                }
            };
        }

        public async Task<string> GetChatReplyAsync(string message, string userContext, List<ChatMessageDto> history)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return $"Hello! I am your TalentSphere Assistant. Here is a summary of your profile details I have loaded:\n\n{userContext}\n\nSince no Gemini API Key is configured, I am running in demo mode. Let me know how else I can assist you with your recruitment or application dashboard!";
            }

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("You are TalentSphere's friendly, professional AI Career and Recruitment Assistant.");
            promptBuilder.AppendLine("You are helping a user navigate the TalentSphere portal. Below is the database context we have for this user's account:");
            promptBuilder.AppendLine(userContext);
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Instructions:");
            promptBuilder.AppendLine("- Provide helpful, structured, and concise replies.");
            promptBuilder.AppendLine("- If the user is a Candidate, help them with resume feedback, matching jobs, or platform navigation.");
            promptBuilder.AppendLine("- If the user is a Recruiter, help them write job posts, evaluate candidate scores, or plan interview questions.");
            promptBuilder.AppendLine("- Keep answers to 2-4 sentences where possible, using bullet points for readability.");
            promptBuilder.AppendLine();
            promptBuilder.AppendLine("Conversation History:");

            foreach (var chat in history)
            {
                string role = chat.Sender == "user" ? "User" : "Assistant";
                promptBuilder.AppendLine($"{role}: {chat.Text}");
            }
            promptBuilder.AppendLine($"User: {message}");
            promptBuilder.AppendLine("Assistant:");

            try
            {
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = promptBuilder.ToString() }
                            }
                        }
                    }
                };

                string jsonPayload = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();

                string rawResponse = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(rawResponse);
                
                var textElement = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text");

                return (textElement.GetString() ?? "").Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chat reply from Gemini API.");
                return $"I apologize, but I encountered an error communicating with my AI brain: {ex.Message}";
            }
        }

        public async Task<string> TranslateTextAsync(string text, string targetLanguage)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return $"[Mock Translation to {targetLanguage}]: {text}";
            }

            string prompt = $@"Translate the following text into the specified language: {targetLanguage}.
Return ONLY the exact translated text. Do not add any conversational remarks, introductions, or wrappers like 'Sure, here is the translation:'. Maintain formatting and markdown structure.

Text to translate:
{text}";

            try
            {
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = prompt }
                            }
                        }
                    }
                };

                string jsonPayload = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();

                string rawResponse = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(rawResponse);
                
                var textElement = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text");

                return (textElement.GetString() ?? "").Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating text with Gemini API.");
                return $"[Translation Error]: {ex.Message}";
            }
        }
    }
}
