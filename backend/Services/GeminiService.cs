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
        Task<ResumeAnalysisResult> GenerateResumeAnalysisAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements);
        Task<InterviewQuestionsResult> GenerateInterviewQuestionsAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements);
        Task<InterviewEvaluationResult> EvaluateInterviewAnswersAsync(string candidateName, string jobTitle, string format, System.Collections.Generic.List<CandidateQaAnswerDto> qaList);
        Task<HiringDecisionResult> GenerateHiringDecisionAsync(string resumeText, string candidateName, string jobTitle, string jobDescription, string jobRequirements, int matchScore, string aiFeedback, string interviewNotes);
        Task<string> GenerateOfferLetterAsync(string candidateName, string jobTitle, string companyName, string salaryRange, string location, string jobType, string requirements);
        Task<OnboardingPlanResult> GenerateOnboardingPlanAsync(string candidateName, string jobTitle, string companyName, string department, string location);
        Task<string> GetChatReplyAsync(string message, string userContext, List<ChatMessageDto> history);
        Task<string> TranslateTextAsync(string text, string targetLanguage);
    }

    public class CandidateQaAnswerDto
    {
        public int QuestionNumber { get; set; }
        public string Category { get; set; } = "Technical";
        public string QuestionText { get; set; } = string.Empty;
        public string CandidateAnswer { get; set; } = string.Empty;
    }

    public class CandidateQaAnswerEvaluation
    {
        public int QuestionNumber { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string CandidateAnswer { get; set; } = string.Empty;
        public int Score { get; set; } = 0;
        public string Relevance { get; set; } = string.Empty;
        public string TechnicalAccuracy { get; set; } = string.Empty;
        public string Completeness { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public string Status { get; set; } = "Skipped"; // Answered, Skipped, Irrelevant
    }

    public class InterviewEvaluationResult
    {
        public int OverallScore { get; set; } = 0;
        public int QuestionsAnswered { get; set; } = 0;
        public int QuestionsSkipped { get; set; } = 0;
        public int TechnicalScore { get; set; } = 0;
        public int CommunicationScore { get; set; } = 0;
        public int ProblemSolvingScore { get; set; } = 0;
        public string ConfidenceRating { get; set; } = "Low";
        public string RecruiterRecommendation { get; set; } = "Reject";
        public string ExecutiveSummary { get; set; } = string.Empty;
        public string[] Strengths { get; set; } = Array.Empty<string>();
        public string[] Weaknesses { get; set; } = Array.Empty<string>();
        public string[] ImprovementSuggestions { get; set; } = Array.Empty<string>();
        public string[] SuitableLearningResources { get; set; } = Array.Empty<string>();
        public string[] JobSkillAssessment { get; set; } = Array.Empty<string>();
        public CandidateQaAnswerEvaluation[] QaEvaluations { get; set; } = Array.Empty<CandidateQaAnswerEvaluation>();
    }

    public class ResumeAnalysisResult
    {
        public string CandidateName { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public int AtsScore { get; set; } = 85;
        public string ExecutiveSummary { get; set; } = string.Empty;
        public string[] Skills { get; set; } = Array.Empty<string>();
        public string[] SkillsDetected { get; set; } = Array.Empty<string>();
        public string[] TechnicalSkills { get; set; } = Array.Empty<string>();
        public string[] SoftSkills { get; set; } = Array.Empty<string>();
        public string[] Experience { get; set; } = Array.Empty<string>();
        public string[] Education { get; set; } = Array.Empty<string>();
        public string[] Projects { get; set; } = Array.Empty<string>();
        public string[] Certifications { get; set; } = Array.Empty<string>();
        public string[] Strengths { get; set; } = Array.Empty<string>();
        public string[] Weaknesses { get; set; } = Array.Empty<string>();
        public string[] MissingSkills { get; set; } = Array.Empty<string>();
        public string[] MissingKeywords { get; set; } = Array.Empty<string>();
        public int KeywordMatchPercentage { get; set; } = 80;
        public string[] ImprovementSuggestions { get; set; } = Array.Empty<string>();
        public string[] RecommendedCertifications { get; set; } = Array.Empty<string>();
        public string[] BestSuitableRoles { get; set; } = Array.Empty<string>();
        public string RecruiterRecommendation { get; set; } = "Highly Recommended";

        // Job-Specific Analysis
        public string JobTitle { get; set; } = string.Empty;
        public string[] MatchedSkills { get; set; } = Array.Empty<string>();
        public int SkillMatchScore { get; set; } = 0;
        public int ExperienceMatchScore { get; set; } = 0;
        public int OverallMatchScore { get; set; } = 0;
        public string Recommendation { get; set; } = string.Empty;
    }

    public class OnboardingPlanResult
    {
        public string WelcomeMessage { get; set; } = string.Empty;
        public string[] FirstDayAgenda { get; set; } = Array.Empty<string>();
        public string[] Checklist { get; set; } = Array.Empty<string>();
        public string[] LearningPlan30Days { get; set; } = Array.Empty<string>();
        public string[] LearningPlan60Days { get; set; } = Array.Empty<string>();
        public string[] LearningPlan90Days { get; set; } = Array.Empty<string>();
        public string ManagerNote { get; set; } = string.Empty;
        public string[] FAQs { get; set; } = Array.Empty<string>();
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
        public string[] MatchingSkills { get; set; } = Array.Empty<string>();
        public string[] MissingSkills { get; set; } = Array.Empty<string>();
        public string[] LearningRecommendations { get; set; } = Array.Empty<string>();
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

    public class HiringDecisionResult
    {
        public string Recommendation { get; set; } = "Hire"; // Strongly Recommend, Hire, Consider, Reject
        public int ConfidenceScore { get; set; } = 90;
        public string ExecutiveSummary { get; set; } = string.Empty;
        public string[] Strengths { get; set; } = Array.Empty<string>();
        public string[] SkillGaps { get; set; } = Array.Empty<string>();
        public string[] Reasoning { get; set; } = Array.Empty<string>();
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
                return GetMockMatchResult(resumeText, jobTitle, jobDescription, jobRequirements);
            }

            string prompt = $@"Compare the candidate's resume details with the job description and requirements.
Evaluate how well the candidate fits the job. Provide:
1. A compatibility score (integer between 0 and 100).
2. A detailed feedback paragraph summarizing their strengths, skill gaps, and custom recommendations.
3. List of matching technical skills.
4. List of missing skills / skill gaps.
5. Personalized learning recommendations (2-3 actionable courses or topics to bridge skill gaps).

Output MUST be a raw JSON object matching this schema EXACTLY:
{{
  ""Score"": integer,
  ""Feedback"": ""string"",
  ""MatchingSkills"": [""string""],
  ""MissingSkills"": [""string""],
  ""LearningRecommendations"": [""string""]
}}
Do not include any markdown formatting wrappers (like ```json), just return the raw JSON structure.

Job Details:
Title: {jobTitle}
Description: {jobDescription}
Requirements: {jobRequirements}

Candidate Resume:
{resumeText}";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                jsonResponse = jsonResponse.Replace("```json", "").Replace("```", "").Trim();
                var result = JsonSerializer.Deserialize<JobMatchResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return result ?? GetMockMatchResult(resumeText, jobTitle, jobDescription, jobRequirements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error matching resume with Gemini API. Falling back to content-based matcher.");
                return GetMockMatchResult(resumeText, jobTitle, jobDescription, jobRequirements);
            }
        }

        private JobMatchResult GetMockMatchResult(string resumeText, string jobTitle, string jobDescription = "", string jobRequirements = "")
        {
            string rText = (resumeText ?? "").Trim();
            if (string.IsNullOrWhiteSpace(rText))
            {
                return new JobMatchResult
                {
                    Score = 0,
                    Feedback = "No usable resume text available for AI evaluation.",
                    MatchingSkills = Array.Empty<string>(),
                    MissingSkills = Array.Empty<string>(),
                    LearningRecommendations = Array.Empty<string>()
                };
            }

            string rUpper = rText.ToUpperInvariant();
            string jReqsUpper = ((jobTitle ?? "") + " " + (jobRequirements ?? "") + " " + (jobDescription ?? "")).ToUpperInvariant();

            string[] skillDict = { 
                "REACT", "TYPESCRIPT", "JAVASCRIPT", "C#", "ASP.NET", ".NET", "SQL", "PYTHON", "JAVA", "SPRING", 
                "SPRING BOOT", "HTML", "CSS", "GIT", "GITHUB", "DOCKER", "AWS", "KUBERNETES", "REST", "REST API", 
                "MICROSERVICES", "UNIT TESTING", "CI/CD", "PANDAS", "NUMPY", "MACHINE LEARNING", "JPA", "HIBERNATE",
                "NODE", "EXPRESS", "AGILE", "SCRUM", "MONGODB", "POSTGRESQL", "TAILWIND", "REDUX"
            };

            var detectedSkills = skillDict.Where(s => rUpper.Contains(s)).ToList();
            var jobSkills = skillDict.Where(s => jReqsUpper.Contains(s)).ToList();

            if (jobSkills.Count == 0)
            {
                jobSkills = new List<string> { "REACT", "C#", "SQL", "REST API", "GIT" };
            }

            var matchedSkills = detectedSkills.Intersect(jobSkills).ToList();
            var missingSkills = jobSkills.Except(detectedSkills).ToList();

            int matchPercentage = (int)Math.Round(((double)matchedSkills.Count / Math.Max(jobSkills.Count, 1)) * 100);
            int wordCount = rText.Split(new[] { ' ', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Length;
            int contentPenalty = wordCount < 20 ? 40 : (wordCount < 50 ? 20 : 0);
            int score = Math.Max(15, Math.Min(98, matchPercentage - contentPenalty));

            return new JobMatchResult
            {
                Score = score,
                Feedback = $"Content-Based AI Evaluation for {jobTitle}: Candidate matches {matchPercentage}% of required keywords. Demonstrated skills: {string.Join(", ", matchedSkills.Select(CapitalizeSkill).DefaultIfEmpty("General Engineering"))}.",
                MatchingSkills = matchedSkills.Select(CapitalizeSkill).ToArray(),
                MissingSkills = missingSkills.Select(CapitalizeSkill).ToArray(),
                LearningRecommendations = missingSkills.Select(s => $"Complete {CapitalizeSkill(s)} course & hands-on practical module").Take(3).ToArray()
            };
        }

        public async Task<InterviewQuestionsResult> GenerateInterviewQuestionsAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return GetMockQuestions(jobTitle, jobDescription, jobRequirements);
            }

            string prompt = $@"Given the target job role and requirements, generate 5-6 highly specific interview questions tailored specifically to the position:

JOB TITLE: {jobTitle}
JOB DESCRIPTION: {jobDescription}
JOB REQUIREMENTS: {jobRequirements}
CANDIDATE RESUME SUMMARY: {resumeText}

Generate a balanced question set covering:
1. Core technical concepts specific to {jobTitle} and {jobRequirements}.
2. Practical problem-solving and coding scenarios.
3. Architecture / system design question for {jobTitle}.
4. Job-specific situational scenario.

Output MUST be a raw JSON object matching this schema EXACTLY:
{{
  ""Questions"": [
    {{ ""Category"": ""Technical"", ""QuestionText"": ""string"", ""Rationale"": ""string"" }}
  ],
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
Do not include any markdown formatting wrappers (like ```json), just return raw JSON structure.";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                var result = JsonSerializer.Deserialize<InterviewQuestionsResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                
                if (result != null && ((result.Questions != null && result.Questions.Length > 0) || (result.TechnicalQuestions != null && result.TechnicalQuestions.Length > 0)))
                {
                    if (result.Questions == null || result.Questions.Length == 0)
                    {
                        var allList = new List<InterviewQuestionItem>();
                        if (result.TechnicalQuestions != null) allList.AddRange(result.TechnicalQuestions);
                        if (result.HrQuestions != null) allList.AddRange(result.HrQuestions);
                        if (result.ScenarioQuestions != null) allList.AddRange(result.ScenarioQuestions);
                        result.Questions = allList.ToArray();
                    }
                    return result;
                }

                return GetMockQuestions(jobTitle, jobDescription, jobRequirements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating interview questions with Gemini API. Falling back to job-specific mock.");
                return GetMockQuestions(jobTitle, jobDescription, jobRequirements);
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

        private InterviewQuestionsResult GetMockQuestions(string jobTitle, string jobDescription, string jobRequirements)
        {
            string titleLower = (jobTitle ?? "").ToLower();
            string reqsLower = (jobRequirements ?? "").ToLower();

            List<InterviewQuestionItem> questions = new List<InterviewQuestionItem>();

            if (titleLower.Contains("java") || reqsLower.Contains("java") || reqsLower.Contains("spring"))
            {
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "1. How does Java Garbage Collection work (G1GC / ZGC) and how do you diagnose memory leaks using heap dumps?", Rationale = "Evaluates JVM memory management and debugging expertise." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "2. Explain Spring Boot dependency injection scopes (@Component, @Service, @Scope) and bean lifecycle hooks.", Rationale = "Tests Spring framework core architecture knowledge." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "3. How do you implement secure stateless JWT authentication and CORS filtering in Spring Security?", Rationale = "Assesses Java web security configuration proficiency." });
                questions.Add(new InterviewQuestionItem { Category = "Scenario", QuestionText = "4. Describe how you would build a high-throughput REST API using Spring Data JPA and Hibernate without N+1 query overhead.", Rationale = "Evaluates database ORM optimization techniques." });
                questions.Add(new InterviewQuestionItem { Category = "Architecture", QuestionText = "5. How do you design microservice event-driven architecture using Kafka or RabbitMQ for order processing?", Rationale = "Tests distributed messaging and full-stack system architecture." });
            }
            else if (titleLower.Contains("data scientist") || titleLower.Contains("python") || reqsLower.Contains("machine learning") || reqsLower.Contains("pandas"))
            {
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "1. How do you handle missing data, outliers, and feature scaling in Pandas and NumPy pipelines?", Rationale = "Evaluates data preprocessing and feature engineering skills." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "2. Explain the Bias-Variance tradeoff and how regularization (L1 Lasso vs L2 Ridge) prevents overfitting.", Rationale = "Tests core machine learning theoretical understanding." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "3. What evaluation metrics (Precision, Recall, F1-Score, ROC-AUC) do you choose for imbalanced classification tasks?", Rationale = "Evaluates model performance validation methodology." });
                questions.Add(new InterviewQuestionItem { Category = "Scenario", QuestionText = "4. Describe how you deploy a PyTorch / Scikit-Learn model to production using FastAPI and Docker.", Rationale = "Tests MLOps model deployment and API serving." });
                questions.Add(new InterviewQuestionItem { Category = "Architecture", QuestionText = "5. How do you write optimized SQL queries with CTEs and window functions to compute rolling customer retention metrics?", Rationale = "Assesses advanced data analytics and database query capability." });
            }
            else if (titleLower.Contains(".net") || titleLower.Contains("c#") || reqsLower.Contains("c#") || reqsLower.Contains("asp.net"))
            {
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "1. What is the difference between value types (structs) and reference types (classes) in C#, and how does boxing/unboxing affect performance?", Rationale = "Evaluates CLR memory allocation understanding." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "2. How do you optimize Entity Framework Core query execution to avoid N+1 query problems using AsNoTracking and Include?", Rationale = "Evaluates EF Core ORM performance tuning techniques." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "3. Explain the difference between Transient, Scoped, and Singleton service lifetimes in ASP.NET Core Dependency Injection.", Rationale = "Verifies dependency injection and object lifecycle knowledge." });
                questions.Add(new InterviewQuestionItem { Category = "Scenario", QuestionText = "4. How do you handle database transaction concurrency conflicts in SQL Server / MySQL using EF Core optimistic concurrency?", Rationale = "Tests database ACID transaction management." });
                questions.Add(new InterviewQuestionItem { Category = "Architecture", QuestionText = "5. How do you design an asynchronous non-blocking web API using async/await and Task Parallel Library under high load?", Rationale = "Evaluates high-throughput async C# API design." });
            }
            else if (titleLower.Contains("react") || titleLower.Contains("frontend") || reqsLower.Contains("react"))
            {
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "1. How does the Virtual DOM diffing algorithm work in React 18, and how do useMemo / useCallback prevent unnecessary re-renders?", Rationale = "Tests React rendering optimization." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "2. Explain state management patterns: Context API vs Redux Toolkit vs Zustand for large scale enterprise applications.", Rationale = "Evaluates frontend state architecture." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = "3. How do you manage custom hooks and side-effects safely using useEffect without causing infinite render loops?", Rationale = "Tests React lifecycle and side effect management." });
                questions.Add(new InterviewQuestionItem { Category = "Scenario", QuestionText = "4. Describe how you implement responsive layouts, WCAG accessibility, and dark/light theme switching using CSS Modules or Tailwind.", Rationale = "Evaluates UI styling and accessibility standards." });
                questions.Add(new InterviewQuestionItem { Category = "Architecture", QuestionText = "5. How do you implement code splitting, lazy loading, and web performance optimization for SPA web apps?", Rationale = "Tests frontend performance tuning." });
            }
            else
            {
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = $"1. What are the core technical principles and methodologies essential for a successful {jobTitle}?", Rationale = $"Evaluates foundational domain knowledge for {jobTitle}." });
                questions.Add(new InterviewQuestionItem { Category = "Technical", QuestionText = $"2. How do you approach code quality, technical documentation, and peer code reviews in a collaborative team?", Rationale = "Assesses engineering practices and teamwork." });
                questions.Add(new InterviewQuestionItem { Category = "Scenario", QuestionText = $"3. Describe a challenging technical problem you encountered in a recent project and how you diagnosed and resolved it.", Rationale = "Evaluates problem-solving and diagnostic skills." });
                questions.Add(new InterviewQuestionItem { Category = "Architecture", QuestionText = $"4. How do you design APIs and system components to meet strict security, performance, and scalability requirements for {jobTitle}?", Rationale = "Tests system design and security principles." });
                questions.Add(new InterviewQuestionItem { Category = "HR", QuestionText = $"5. Tell us about a time you had to balance competing project deadlines while maintaining high delivery quality.", Rationale = "Measures time management and resilience." });
            }

            return new InterviewQuestionsResult
            {
                Questions = questions.ToArray(),
                TechnicalQuestions = questions.Where(q => q.Category == "Technical").ToArray(),
                HrQuestions = questions.Where(q => q.Category == "HR").ToArray(),
                ScenarioQuestions = questions.Where(q => q.Category == "Scenario" || q.Category == "Architecture").ToArray()
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

        public async Task<HiringDecisionResult> GenerateHiringDecisionAsync(string resumeText, string candidateName, string jobTitle, string jobDescription, string jobRequirements, int matchScore, string aiFeedback, string interviewNotes)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return GetMockHiringDecision(candidateName, jobTitle, matchScore);
            }

            try
            {
                string prompt = $@"You are a Senior Technical Hiring Manager and Enterprise Talent Architect.
Analyze the following complete candidate profile, resume text, match score, AI feedback, and recruiter interview notes, then make a final executive hiring decision recommendation.

Candidate Name: {candidateName}
Target Job Title: {jobTitle}
Job Description: {jobDescription}
Job Requirements: {jobRequirements}
AI Resume Match Score: {matchScore}%
AI Match Feedback: {aiFeedback}
Interview & Recruiter Notes: {interviewNotes}
Resume Text:
{resumeText}

Return raw JSON strictly adhering to this JSON schema:
{{
  ""recommendation"": ""Hire"", // Must be one of: ""Strongly Recommend"", ""Hire"", ""Consider"", ""Reject""
  ""confidenceScore"": 92, // Integer 0 to 100
  ""executiveSummary"": ""Concise 2-3 sentence executive decision summary."",
  ""strengths"": [""Key candidate strength 1"", ""Key candidate strength 2"", ""Key candidate strength 3""],
  ""skillGaps"": [""Minor gap or development area 1"", ""Minor gap 2""],
  ""reasoning"": [""Key decision justification factor 1"", ""Justification factor 2"", ""Justification factor 3""]
}}

Return ONLY valid raw JSON with NO markdown blocks or code wrap tags.";

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

                string cleanJson = textElement.GetString() ?? "";
                cleanJson = cleanJson.Replace("```json", "").Replace("```", "").Trim();

                var result = JsonSerializer.Deserialize<HiringDecisionResult>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return result ?? GetMockHiringDecision(candidateName, jobTitle, matchScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI hiring decision via Gemini.");
                return GetMockHiringDecision(candidateName, jobTitle, matchScore);
            }
        }

        private HiringDecisionResult GetMockHiringDecision(string candidateName, string jobTitle, int matchScore)
        {
            string recommendation = matchScore >= 85 ? "Hire" : matchScore >= 70 ? "Consider" : "Reject";
            int confidence = Math.Min(98, Math.Max(70, matchScore + 5));

            return new HiringDecisionResult
            {
                Recommendation = recommendation,
                ConfidenceScore = confidence,
                ExecutiveSummary = $"{candidateName} exhibits strong technical alignment for the {jobTitle} position with an AI fit score of {matchScore}%. Candidate demonstrates key domain competencies required for core deliverables.",
                Strengths = new[]
                {
                    $"Proven domain experience relevant to {jobTitle}",
                    $"Strong technical match score ({matchScore}%) with job requirements",
                    "Clear communication and problem-solving capability"
                },
                SkillGaps = new[]
                {
                    "Specific enterprise tool chain onboarding required",
                    "Recommend initial technical mentoring during probation"
                },
                Reasoning = new[]
                {
                    $"High fit score ({matchScore}%) exceeds minimum threshold for role",
                    "Core skills match primary job responsibilities",
                    "Low onboarding friction and strong background credentials"
                }
            };
        }

        public async Task<string> GenerateOfferLetterAsync(string candidateName, string jobTitle, string companyName, string salaryRange, string location, string jobType, string requirements)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return GetMockOfferLetter(candidateName, jobTitle, companyName, salaryRange, location);
            }

            string prompt = $@"Generate a formal, highly professional, enterprise-grade job offer letter for the candidate based on the role and company parameters below.
The offer letter must include:
1. Formal Date & Header
2. Candidate Name & Address Placeholder
3. Formal Position Title, Department, & Employment Type ({jobType})
4. Work Location ({location}) & Reporting Structure
5. Probation Period & Joining Date Placeholder (Standard 2-week notice period)
6. Compensation & Annual CTC ({salaryRange}) with monthly breakdown estimate
7. Key Benefits (Medical Insurance, Paid Time Off, Performance Bonuses)
8. Terms & Conditions (Confidentiality, Intellectual Property, Pre-employment Verification)
9. Offer Acceptance Deadline (7 Calendar Days from issuance)
10. Official HR Signature Block & Contact Details

Candidate Name: {candidateName}
Job Title: {jobTitle}
Company Name: {companyName}
Salary Range: {salaryRange}
Location: {location}
Job Type: {jobType}
Key Requirements / Scope: {requirements}";

            try
            {
                string text = await CallGeminiApiAsync(prompt);
                if (string.IsNullOrWhiteSpace(text)) return GetMockOfferLetter(candidateName, jobTitle, companyName, salaryRange, location);
                return text;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI Offer Letter via Gemini.");
                return GetMockOfferLetter(candidateName, jobTitle, companyName, salaryRange, location);
            }
        }

        private string GetMockOfferLetter(string candidateName, string jobTitle, string companyName, string salaryRange, string location)
        {
            string today = DateTime.UtcNow.ToString("MMMM dd, yyyy");
            string deadline = DateTime.UtcNow.AddDays(7).ToString("MMMM dd, yyyy");
            string comp = string.IsNullOrWhiteSpace(companyName) ? "RecruitNexus Partner Organization" : companyName;

            return $@"CONFIDENTIAL & PERSONAL

Date: {today}

To:
{candidateName}
Candidate ID: RN-{DateTime.UtcNow.Ticks % 10000:D4}

Subject: Letter of Offer - Position of {jobTitle} at {comp}

Dear {candidateName},

1. APPOINTMENT & DESIGNATION
On behalf of {comp}, we are pleased to offer you the position of '{jobTitle}' based at our {location} facility. Your employment will be subject to the terms and conditions outlined in this agreement.

2. COMPENSATION & BENEFITS
- Compensation Package: {salaryRange} (Annual CTC)
- Pay Frequency: Monthly via Direct Bank Transfer on the 1st of every month
- Key Benefits: Comprehensive Group Health Insurance, Paid Annual Leave (24 days/year), and Eligible Performance Bonuses.

3. PROBATION & NOTICE PERIOD
- Probation Period: 3 (Three) Months from the date of joining.
- Notice Period: 30 days written notice required by either party during employment.

4. TERMS & CONDITIONS
- Confidentiality: You shall maintain absolute confidentiality regarding proprietary algorithms, codebase, and business strategies.
- Background Verification: This offer is contingent upon successful completion of background checks and verification of academic credentials.

5. ACCEPTANCE DEADLINE
Please sign and return the duplicate copy of this letter or confirm your acceptance electronically by {deadline}. If we do not receive your confirmation by this date, this offer will be deemed automatically lapsed.

We are excited about the prospect of you joining our team and contributing to our continued success.

Sincerely,

Human Resources Department
{comp}
Official HR Signature Block: _______________________
Contact: hr@{comp.ToLower().Replace(" ", "")}.com";
        }

        public async Task<OnboardingPlanResult> GenerateOnboardingPlanAsync(string candidateName, string jobTitle, string companyName, string department, string location)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                return GetMockOnboardingPlan(candidateName, jobTitle, companyName);
            }

            string prompt = $@"Generate a comprehensive AI Employee Onboarding & Pre-Joining Package for a new team member.
The package must include:
1. Personal Welcome Message
2. First Day Agenda (4-5 key timeline items for Day 1)
3. Pre-Joining Checklist (4-5 items candidate must submit/prepare)
4. 30-Day Learning Goals (3 items)
5. 60-Day Contribution Goals (3 items)
6. 90-Day Performance Impact Goals (3 items)
7. Reporting Manager Welcome Note
8. Frequently Asked Questions (3 Q&A pairs)

Candidate Name: {candidateName}
Job Title: {jobTitle}
Company Name: {companyName}
Department: {department}
Location: {location}

Output MUST be a raw JSON object matching this schema EXACTLY:
{{
  ""welcomeMessage"": ""string"",
  ""firstDayAgenda"": [""string""],
  ""checklist"": [""string""],
  ""learningPlan30Days"": [""string""],
  ""learningPlan60Days"": [""string""],
  ""learningPlan90Days"": [""string""],
  ""managerNote"": ""string"",
  ""faqs"": [""string""]
}}
Do not include any markdown formatting wrappers (like ```json), return ONLY raw valid JSON.";

            try
            {
                string jsonResponse = await CallGeminiApiAsync(prompt);
                jsonResponse = jsonResponse.Replace("```json", "").Replace("```", "").Trim();
                var result = JsonSerializer.Deserialize<OnboardingPlanResult>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return result ?? GetMockOnboardingPlan(candidateName, jobTitle, companyName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating onboarding plan with Gemini API.");
                return GetMockOnboardingPlan(candidateName, jobTitle, companyName);
            }
        }

        private OnboardingPlanResult GetMockOnboardingPlan(string candidateName, string jobTitle, string companyName)
        {
            string comp = string.IsNullOrWhiteSpace(companyName) ? "RecruitNexus Partner Organization" : companyName;

            return new OnboardingPlanResult
            {
                WelcomeMessage = $"Welcome to {comp}, {candidateName}! We are thrilled to have you join our team as a {jobTitle}. Your technical expertise and experience will be instrumental in accelerating our key engineering initiatives.",
                FirstDayAgenda = new[]
                {
                    "09:30 AM - HR Orientation & IT Asset Handover",
                    "11:00 AM - Team Introductions & Executive Welcome",
                    "01:00 PM - Team Welcome Lunch",
                    "02:30 PM - Developer Workstation Setup & Security Access Setup",
                    "04:30 PM - Day 1 Debrief with Assigned Mentor"
                },
                Checklist = new[]
                {
                    "Upload signed offer letter copy",
                    "Submit identity verification (Govt ID / Passport)",
                    "Complete direct deposit banking details form",
                    "Review employee handbook & code of conduct",
                    "Set up corporate 2FA security authentication"
                },
                LearningPlan30Days = new[]
                {
                    "Complete core architecture codebase walkthrough",
                    "Set up local development environment and CI/CD access",
                    "Ship first minor feature or bug fix to staging environment"
                },
                LearningPlan60Days = new[]
                {
                    "Take ownership of primary feature component deliverables",
                    "Participate in sprint planning and design review sessions",
                    "Collaborate with cross-functional product & QA teams"
                },
                LearningPlan90Days = new[]
                {
                    "Lead architectural design for an upcoming feature module",
                    "Mentor junior developers and review team pull requests",
                    "Achieve full independent operational autonomy on team projects"
                },
                ManagerNote = $"Hi {candidateName}, welcome aboard! I am looking forward to working closely with you on our core roadmap goals. Don't hesitate to reach out if you have any questions before Day 1.",
                FAQs = new[]
                {
                    "Q: What is the dress code? A: Smart casual for office days; comfortable for remote days.",
                    "Q: How do I access company tools? A: IT will email login credentials and 2FA keys prior to Day 1.",
                    "Q: When is payroll processed? A: Payroll is processed monthly on the 1st business day."
                }
            };
        }

        public async Task<ResumeAnalysisResult> GenerateResumeAnalysisAsync(string resumeText, string jobTitle, string jobDescription, string jobRequirements)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return GetMockResumeAnalysis(resumeText, jobTitle, jobDescription, jobRequirements);
            }

            try
            {
                var prompt = $@"
You are an Enterprise ATS (Applicant Tracking System) & AI Executive Recruiter.
Analyze the following candidate resume against the specific target job description and requirements.

TARGET JOB TITLE: {jobTitle}
JOB DESCRIPTION: {jobDescription}
JOB REQUIREMENTS: {jobRequirements}

CANDIDATE RESUME TEXT:
{resumeText}

Calculate a comprehensive ATS score (0-100) based on BOTH the resume content and how closely it matches the target job description requirements.

Return strictly a valid JSON object matching this schema EXACTLY:
{{
  ""candidateName"": ""Candidate Name"",
  ""summary"": ""Short summary of resume"",
  ""atsScore"": 88,
  ""executiveSummary"": ""detailed executive summary of candidate fit for the target role"",
  ""skillsDetected"": [""skill1"", ""skill2""],
  ""technicalSkills"": [""tech1"", ""tech2""],
  ""softSkills"": [""soft1"", ""soft2""],
  ""experience"": [""experience line 1""],
  ""education"": [""education line 1""],
  ""projects"": [""project 1""],
  ""certifications"": [""cert 1""],
  ""strengths"": [""strength1""],
  ""missingSkills"": [""missing1""],
  ""missingKeywords"": [""keyword1""],
  ""keywordMatchPercentage"": 84,
  ""improvementSuggestions"": [""suggestion1""],
  ""recommendedCertifications"": [""cert1""],
  ""bestSuitableRoles"": [""role1""],
  ""recruiterRecommendation"": ""Highly Recommended"",
  ""jobTitle"": ""{jobTitle}"",
  ""matchedSkills"": [""matched1""],
  ""skillMatchScore"": 85,
  ""experienceMatchScore"": 80,
  ""overallMatchScore"": 85,
  ""recommendation"": ""Strong Match""
}}";

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

                var jsonPayload = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini API call failed with status: {StatusCode}", response.StatusCode);
                    return GetMockResumeAnalysis(resumeText, jobTitle, jobDescription, jobRequirements);
                }

                var responseString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseString);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (!string.IsNullOrWhiteSpace(text))
                {
                    var result = JsonSerializer.Deserialize<ResumeAnalysisResult>(text, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (result != null) return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API for Resume Analysis");
            }

            return GetMockResumeAnalysis(resumeText, jobTitle, jobDescription, jobRequirements);
        }

        private ResumeAnalysisResult GetMockResumeAnalysis(string resumeText, string jobTitle, string jobDescription = "", string jobRequirements = "")
        {
            string rText = (resumeText ?? "").Trim();
            string rUpper = rText.ToUpperInvariant();
            string jReqsUpper = ((jobTitle ?? "") + " " + (jobRequirements ?? "") + " " + (jobDescription ?? "")).ToUpperInvariant();

            string[] skillDict = { 
                "REACT", "TYPESCRIPT", "JAVASCRIPT", "C#", "ASP.NET", ".NET", "SQL", "PYTHON", "JAVA", "SPRING", 
                "SPRING BOOT", "HTML", "CSS", "GIT", "GITHUB", "DOCKER", "AWS", "KUBERNETES", "REST", "REST API", 
                "MICROSERVICES", "UNIT TESTING", "CI/CD", "PANDAS", "NUMPY", "MACHINE LEARNING", "JPA", "HIBERNATE",
                "NODE", "EXPRESS", "AGILE", "SCRUM", "MONGODB", "POSTGRESQL", "TAILWIND", "REDUX", "COMMUNICATION"
            };

            var detectedSkills = skillDict.Where(s => rUpper.Contains(s)).ToList();
            var jobSkills = skillDict.Where(s => jReqsUpper.Contains(s)).ToList();

            if (jobSkills.Count == 0)
            {
                jobSkills = new List<string> { "REACT", "C#", "SQL", "REST API", "GIT" };
            }

            var matchedSkills = detectedSkills.Intersect(jobSkills).ToList();
            var missingSkills = jobSkills.Except(detectedSkills).ToList();

            int matchPercentage = (int)Math.Round(((double)matchedSkills.Count / Math.Max(jobSkills.Count, 1)) * 100);
            int wordCount = rText.Split(new[] { ' ', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Length;

            int contentPenalty = wordCount < 20 ? 40 : (wordCount < 50 ? 20 : 0);
            int atsScore = Math.Max(15, Math.Min(98, matchPercentage - contentPenalty));

            var techSkills = detectedSkills.Where(s => s != "COMMUNICATION" && s != "AGILE" && s != "SCRUM").Select(CapitalizeSkill).ToArray();
            var softSkills = new[] { "Team Collaboration", "Problem Solving", "Communication", "Adaptability" };

            var strengths = new List<string>();
            if (matchedSkills.Count > 0) strengths.Add($"Demonstrated expertise in key role requirements: {string.Join(", ", matchedSkills.Select(CapitalizeSkill).Take(4))}");
            if (wordCount > 60) strengths.Add("Detailed professional experience history and comprehensive project documentation.");
            if (strengths.Count == 0) strengths.Add("Basic technical profile format detected.");

            var suggestions = new List<string>();
            if (missingSkills.Count > 0) suggestions.Add($"Add missing target keywords to your resume: {string.Join(", ", missingSkills.Select(CapitalizeSkill).Take(3))}");
            suggestions.Add("Quantify past achievements using measurable impact metrics (e.g. 'Improved speed by 35%')");
            suggestions.Add("Include a dedicated Skills Summary section near the top of the resume for ATS scanners");

            string targetTitle = !string.IsNullOrWhiteSpace(jobTitle) ? jobTitle : "Target Software Engineer Role";

            return new ResumeAnalysisResult
            {
                CandidateName = "Candidate",
                Summary = $"Professional candidate profile with background in {string.Join(", ", detectedSkills.Select(CapitalizeSkill).DefaultIfEmpty("Software Engineering"))}.",
                AtsScore = atsScore,
                ExecutiveSummary = missingSkills.Count == 0
                    ? $"Exceptional match for {targetTitle}! The resume covers all required skills ({string.Join(", ", matchedSkills.Select(CapitalizeSkill))})."
                    : $"Candidate matches {matchPercentage}% of requirements for {targetTitle}. Detected skills: {string.Join(", ", detectedSkills.Select(CapitalizeSkill).DefaultIfEmpty("General Engineering"))}.",
                Skills = detectedSkills.Select(CapitalizeSkill).ToArray(),
                SkillsDetected = detectedSkills.Count > 0 ? detectedSkills.Select(CapitalizeSkill).ToArray() : new[] { "General Development", "Problem Solving" },
                TechnicalSkills = techSkills.Length > 0 ? techSkills : new[] { "Software Development", "API Design" },
                SoftSkills = softSkills,
                Experience = new[] { $"{wordCount / 10 + 1}+ years of relevant technical & professional experience" },
                Education = new[] { "Bachelor of Science in Computer Science / Related Field" },
                Projects = new[] { "Enterprise Full Stack Application", "RESTful Web API Service Platform" },
                Certifications = new[] { "AWS Certified Developer", "Professional Scrum Master" },
                Strengths = strengths.ToArray(),
                Weaknesses = missingSkills.Count > 0 ? new[] { $"Missing required role skills: {string.Join(", ", missingSkills.Select(CapitalizeSkill).Take(3))}" } : new[] { "Can elaborate further on cloud microservice architecture" },
                MissingSkills = missingSkills.Count > 0 ? missingSkills.Select(CapitalizeSkill).ToArray() : new[] { "Advanced System Architecture" },
                MissingKeywords = missingSkills.Count > 0 ? missingSkills.Select(CapitalizeSkill).ToArray() : new[] { "Automated CI/CD Pipeline" },
                KeywordMatchPercentage = matchPercentage,
                ImprovementSuggestions = suggestions.ToArray(),
                RecommendedCertifications = new[] { $"{targetTitle} Professional Certification", "AWS / Azure Cloud Developer" },
                BestSuitableRoles = new[] { targetTitle, "Software Engineer", "Full Stack Developer" },
                RecruiterRecommendation = atsScore >= 85 ? "Highly Recommended" : (atsScore >= 65 ? "Recommended" : "Consider"),

                // Job-Specific Analysis
                JobTitle = targetTitle,
                MatchedSkills = matchedSkills.Select(CapitalizeSkill).ToArray(),
                SkillMatchScore = matchPercentage,
                ExperienceMatchScore = Math.Min(100, matchPercentage + 5),
                OverallMatchScore = atsScore,
                Recommendation = atsScore >= 80 ? "Strong Match for Role" : (atsScore >= 55 ? "Moderate Match" : "Potential Skill Gap")
            };
        }

        private string CapitalizeSkill(string skill)
        {
            if (string.IsNullOrWhiteSpace(skill)) return skill;
            return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(skill.ToLower());
        }

        public async Task<InterviewEvaluationResult> EvaluateInterviewAnswersAsync(string candidateName, string jobTitle, string format, List<CandidateQaAnswerDto> qaList)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                return GetMockInterviewEvaluation(candidateName, jobTitle, qaList);
            }

            try
            {
                var qaJson = JsonSerializer.Serialize(qaList);
                var prompt = $@"
You are an Enterprise AI Interview Assessor evaluating a candidate's completed interactive interview for {jobTitle}.

CANDIDATE NAME: {candidateName}
TARGET JOB ROLE: {jobTitle}
INTERVIEW FORMAT: {format}

CANDIDATE QUESTIONS AND ANSWERS:
{qaJson}

CRITICAL EVALUATION & SCORING RULES:
1. IF candidateAnswer IS EMPTY, BLANK, ""[Skipped]"", ""Skipped"", OR ""No response provided."":
   - score MUST BE EXACTLY 0.
   - status MUST BE ""Skipped"".
   - relevance MUST BE ""Skipped / Unanswered"".
   - technicalAccuracy MUST BE ""0%"".
   - completeness MUST BE ""0%"".
   - feedback MUST BE ""Question was skipped by candidate without an answer.""
2. IF candidateAnswer IS UNRELATED TO THE QUESTION OR GIBBERISH (e.g. ""asdf"", ""hello world"", ""banana""):
   - score MUST BE BETWEEN 0 AND 20.
   - status MUST BE ""Irrelevant"".
   - feedback MUST state that answer is unrelated to the question.
3. FOR VALID RELEVANT ANSWERS:
   - Evaluate relevance to the question, technical correctness, completeness, and domain understanding on a 0-100 scale per question.
4. CALCULATE overallScore EXACTLY USING THIS FORMULA:
   overallScore = Math.Round((Sum of all question scores) / (Total questions * 100) * 100).
   If all questions are skipped, overallScore MUST BE 0.

Return strictly a valid JSON object matching this schema EXACTLY:
{{
  ""overallScore"": 50,
  ""questionsAnswered"": 2,
  ""questionsSkipped"": 1,
  ""technicalScore"": 50,
  ""communicationScore"": 50,
  ""problemSolvingScore"": 50,
  ""confidenceRating"": ""Medium"",
  ""recruiterRecommendation"": ""Consider"",
  ""executiveSummary"": ""Candidate answered 2 of 3 questions for {jobTitle}."",
  ""strengths"": [""strength1""],
  ""weaknesses"": [""weakness1""],
  ""improvementSuggestions"": [""suggestion1""],
  ""suitableLearningResources"": [""resource1""],
  ""jobSkillAssessment"": [""assessment1""],
  ""qaEvaluations"": [
    {{
      ""questionNumber"": 1,
      ""questionText"": ""question"",
      ""candidateAnswer"": ""answer"",
      ""score"": 90,
      ""relevance"": ""High"",
      ""technicalAccuracy"": ""90%"",
      ""completeness"": ""90%"",
      ""feedback"": ""feedback on answer"",
      ""status"": ""Answered""
    }}
  ]
}}";

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

                var jsonPayload = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
                var response = await _httpClient.PostAsync(url, content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Gemini API call failed with status: {StatusCode}", response.StatusCode);
                    return GetMockInterviewEvaluation(candidateName, jobTitle, qaList);
                }

                var responseString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseString);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (!string.IsNullOrWhiteSpace(text))
                {
                    var result = JsonSerializer.Deserialize<InterviewEvaluationResult>(text, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (result != null) return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Gemini API for Interview Evaluation");
            }

            return GetMockInterviewEvaluation(candidateName, jobTitle, qaList);
        }

        private InterviewEvaluationResult GetMockInterviewEvaluation(string candidateName, string jobTitle, List<CandidateQaAnswerDto> qaList)
        {
            var evaluations = new List<CandidateQaAnswerEvaluation>();
            int totalQuestions = qaList != null ? qaList.Count : 0;
            int questionsAnswered = 0;
            int questionsSkipped = 0;
            int sumQuestionScores = 0;

            if (qaList != null && qaList.Count > 0)
            {
                foreach (var qa in qaList)
                {
                    var rawAns = qa.CandidateAnswer != null ? qa.CandidateAnswer.Trim() : "";
                    bool isSkipped = string.IsNullOrWhiteSpace(rawAns) ||
                                     rawAns.Equals("[Skipped]", StringComparison.OrdinalIgnoreCase) ||
                                     rawAns.Equals("Skipped", StringComparison.OrdinalIgnoreCase) ||
                                     rawAns.Equals("No response provided.", StringComparison.OrdinalIgnoreCase) ||
                                     rawAns.Equals("Skipped by candidate.", StringComparison.OrdinalIgnoreCase);

                    int qScore = 0;
                    string status = "Skipped";
                    string relevance = "Skipped / Unanswered";
                    string techAccuracy = "0%";
                    string completeness = "0%";
                    string feedback = "Question was skipped by candidate without an answer.";

                    if (isSkipped)
                    {
                        questionsSkipped++;
                        qScore = 0;
                        status = "Skipped";
                        relevance = "Skipped / Unanswered";
                        techAccuracy = "0%";
                        completeness = "0%";
                        feedback = "Question was skipped by candidate without an answer.";
                    }
                    else
                    {
                        int ansLen = rawAns.Length;
                        string ansLower = rawAns.ToLower();

                        if (ansLen < 6 || IsGibberish(ansLower))
                        {
                            questionsAnswered++;
                            qScore = 10;
                            status = "Irrelevant";
                            relevance = "Low / Irrelevant";
                            techAccuracy = "10%";
                            completeness = "10%";
                            feedback = "Answer is unrelated to the question or lacks technical substance.";
                        }
                        else if (ansLen < 35)
                        {
                            questionsAnswered++;
                            qScore = 45;
                            status = "Answered";
                            relevance = "Moderate";
                            techAccuracy = "45%";
                            completeness = "40%";
                            feedback = $"Answer touches on basic concepts but lacks technical depth for {jobTitle}.";
                        }
                        else if (ansLen < 100)
                        {
                            questionsAnswered++;
                            qScore = 75;
                            status = "Answered";
                            relevance = "High";
                            techAccuracy = "75%";
                            completeness = "75%";
                            feedback = $"Solid response demonstrating practical understanding of {jobTitle} requirements.";
                        }
                        else
                        {
                            questionsAnswered++;
                            qScore = 92;
                            status = "Answered";
                            relevance = "High";
                            techAccuracy = "92%";
                            completeness = "95%";
                            feedback = $"Excellent, highly detailed technical response for {jobTitle}.";
                        }
                    }

                    sumQuestionScores += qScore;

                    evaluations.Add(new CandidateQaAnswerEvaluation
                    {
                        QuestionNumber = qa.QuestionNumber,
                        QuestionText = qa.QuestionText,
                        CandidateAnswer = isSkipped ? "[Skipped]" : rawAns,
                        Score = qScore,
                        Relevance = relevance,
                        TechnicalAccuracy = techAccuracy,
                        Completeness = completeness,
                        Feedback = feedback,
                        Status = status
                    });
                }
            }

            int maxPossiblePoints = totalQuestions > 0 ? totalQuestions * 100 : 1;
            int overallScore = totalQuestions > 0 ? (int)Math.Round(((double)sumQuestionScores / maxPossiblePoints) * 100) : 0;

            int techScore = questionsAnswered > 0 ? Math.Min(100, (int)Math.Round(overallScore * 1.05)) : 0;
            int commScore = questionsAnswered > 0 ? Math.Min(100, (int)Math.Round(overallScore * 0.95)) : 0;
            int probScore = overallScore;

            string recommendation = overallScore >= 85 ? "Strongly Recommend" : (overallScore >= 70 ? "Recommend" : (overallScore >= 40 ? "Consider" : "Reject"));
            string confidence = overallScore >= 75 ? "High" : (overallScore >= 40 ? "Medium" : "Low");

            return new InterviewEvaluationResult
            {
                OverallScore = overallScore,
                QuestionsAnswered = questionsAnswered,
                QuestionsSkipped = questionsSkipped,
                TechnicalScore = techScore,
                CommunicationScore = commScore,
                ProblemSolvingScore = probScore,
                ConfidenceRating = confidence,
                RecruiterRecommendation = recommendation,
                ExecutiveSummary = totalQuestions == questionsSkipped
                    ? $"Candidate {candidateName} skipped all {totalQuestions} questions for the {jobTitle} position. Final evaluation score is 0%."
                    : $"Candidate {candidateName} completed the AI Interview for {jobTitle}, answering {questionsAnswered} of {totalQuestions} questions with an overall score of {overallScore}%.",
                Strengths = questionsAnswered > 0 
                    ? new[] { $"Technical comprehension for {jobTitle}", "Active domain participation in simulator" } 
                    : new[] { "None identified (all questions skipped)" },
                Weaknesses = questionsSkipped > 0 
                    ? new[] { $"{questionsSkipped} question(s) were skipped without answers", "Incomplete evaluation response set" } 
                    : new[] { "Elaborate further on cloud microservice security and edge cases" },
                ImprovementSuggestions = new[] { $"Review key technical topics for {jobTitle}", "Ensure all questions are attempted during the interview" },
                SuitableLearningResources = new[] { $"{jobTitle} Masterclass & Architecture Guide", "STAR Method Practice & System Design" },
                JobSkillAssessment = new[] { $"Target Job: {jobTitle}", $"Total Questions: {totalQuestions}", $"Answered: {questionsAnswered}", $"Skipped: {questionsSkipped}" },
                QaEvaluations = evaluations.ToArray()
            };
        }

        private bool IsGibberish(string text)
        {
            string t = text.Trim().ToLower();
            string[] gibberish = { "asdf", "qwerty", "test", "testing", "abc", "xyz", "hello", "foo", "bar", "123" };
            return gibberish.Any(g => t.Equals(g) || t.StartsWith(g + " "));
        }
    }
}
