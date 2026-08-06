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
        public string Category { get; set; } = "Technical"; // Technical, HR, Scenario
        public string QuestionText { get; set; } = string.Empty;
        public string Rationale { get; set; } = string.Empty;
    }

    public class InterviewQuestionsResult
    {
        public InterviewQuestionItem[] Questions { get; set; } = Array.Empty<InterviewQuestionItem>();
        public InterviewQuestionItem[] TechnicalQuestions { get; set; } = Array.Empty<InterviewQuestionItem>();
        public InterviewQuestionItem[] HrQuestions { get; set; } = Array.Empty<InterviewQuestionItem>();
        public InterviewQuestionItem[] ScenarioQuestions { get; set; } = Array.Empty<InterviewQuestionItem>();
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

            string prompt = $@"Given the candidate's resume/profile details and the job requirements, generate interview questions categorized into three distinct sets:
1. 10 Technical Questions checking core skills, code architecture, and database/web principles.
2. 5 HR Questions evaluating behavioral competence, teamwork, and cultural fit.
3. 3 Scenario Questions evaluating real-world problem solving under pressure.

Output MUST be a raw JSON object matching this schema EXACTLY:
{{
  ""TechnicalQuestions"": [
    {{ ""Category"": ""Technical"", ""QuestionText"": ""string"", ""Rationale"": ""string"" }}
  ],
  ""HrQuestions"": [
    {{ ""Category"": ""HR"", ""QuestionText"": ""string"", ""Rationale"": ""string"" }}
  ],
  ""ScenarioQuestions"": [
    {{ ""Category"": ""Scenario"", ""QuestionText"": ""string"", ""Rationale"": ""string"" }}
  ]
}}
Do not include any markdown formatting wrappers (like ```json), just return raw JSON structure.

Job Details:
Title: {jobTitle}
Description: {jobDescription}
Requirements: {jobRequirements}

Candidate Resume / Profile Details:
{resumeText}";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                var result = JsonSerializer.Deserialize<InterviewQuestionsResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                if (result != null && (result.TechnicalQuestions.Length > 0 || result.HrQuestions.Length > 0 || result.ScenarioQuestions.Length > 0))
                {
                    var allList = new List<InterviewQuestionItem>();
                    allList.AddRange(result.TechnicalQuestions);
                    allList.AddRange(result.HrQuestions);
                    allList.AddRange(result.ScenarioQuestions);
                    result.Questions = allList.ToArray();
                    return result;
                }

                return GetMockQuestions();
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
            var tech = new[]
            {
                new InterviewQuestionItem { Category = "Technical", QuestionText = "1. Can you explain the difference between value types and reference types in C# / .NET?", Rationale = "Assesses core language runtime memory allocation understanding." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "2. How do you optimize Entity Framework Core queries to avoid N+1 query execution problems?", Rationale = "Evaluates database ORM performance tuning techniques." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "3. Describe how Virtual DOM diffing works in React 18.", Rationale = "Tests core frontend framework rendering concepts." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "4. How do you implement CORS policies securely in an ASP.NET Core REST API?", Rationale = "Evaluates web security configuration knowledge." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "5. What is the difference between scoped, transient, and singleton service lifetimes in Dependency Injection?", Rationale = "Verifies understanding of inversion of control and object lifecycles." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "6. How do you handle database transaction concurrency conflicts in SQL / MySQL?", Rationale = "Evaluates database ACID transaction management." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "7. What are the key performance benefits of using TypeScript interfaces over plain JavaScript objects?", Rationale = "Tests type safety and compile-time optimization knowledge." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "8. Explain how JWT bearer tokens are validated statically without database lookups.", Rationale = "Tests stateless authentication token security principles." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "9. How do you implement asynchronous non-blocking I/O using async/await in C#?", Rationale = "Evaluates multi-threaded web API throughput capabilities." },
                new InterviewQuestionItem { Category = "Technical", QuestionText = "10. What strategies do you use for REST API payload validation and error handling?", Rationale = "Assesses API design consistency and DTO validation patterns." }
            };

            var hr = new[]
            {
                new InterviewQuestionItem { Category = "HR", QuestionText = "1. Tell us about a time you had to handle conflicting priorities under tight project deadlines.", Rationale = "Evaluates stress management and time prioritization." },
                new InterviewQuestionItem { Category = "HR", QuestionText = "2. How do you approach receiving constructive feedback on your code during peer reviews?", Rationale = "Measures team collaboration and growth mindset." },
                new InterviewQuestionItem { Category = "HR", QuestionText = "3. Why are you interested in joining our company and working on this specific tech stack?", Rationale = "Assesses candidate motivation and company alignment." },
                new InterviewQuestionItem { Category = "HR", QuestionText = "4. Describe a scenario where you had to explain a complex technical concept to a non-technical stakeholder.", Rationale = "Evaluates communication and stakeholder management skills." },
                new InterviewQuestionItem { Category = "HR", QuestionText = "5. What environment or team culture enables you to perform at your best?", Rationale = "Assesses cultural fit and workplace preferences." }
            };

            var scenario = new[]
            {
                new InterviewQuestionItem { Category = "Scenario", QuestionText = "1. If a production API endpoint suddenly experiences 504 Gateway Timeouts during peak traffic, what step-by-step diagnostic process would you follow?", Rationale = "Evaluates real-world incident response and debugging methodology." },
                new InterviewQuestionItem { Category = "Scenario", QuestionText = "2. Imagine a third-party payment or AI API service goes down completely. How would you design the application fallback behavior?", Rationale = "Tests fault tolerance and graceful degradation engineering." },
                new InterviewQuestionItem { Category = "Scenario", QuestionText = "3. If a database migration locks a production table holding millions of records, how would you resolve the lock safely?", Rationale = "Evaluates database administration and zero-downtime deployment strategies." }
            };

            var all = new List<InterviewQuestionItem>();
            all.AddRange(tech);
            all.AddRange(hr);
            all.AddRange(scenario);

            return new InterviewQuestionsResult
            {
                Questions = all.ToArray(),
                TechnicalQuestions = tech,
                HrQuestions = hr,
                ScenarioQuestions = scenario
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
