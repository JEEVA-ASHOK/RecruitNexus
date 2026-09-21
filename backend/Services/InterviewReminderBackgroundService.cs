using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.Models;

namespace backend.Services
{
    public class InterviewReminderBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger<InterviewReminderBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

        public InterviewReminderBackgroundService(
            IServiceScopeFactory serviceScopeFactory,
            ILogger<InterviewReminderBackgroundService> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("InterviewReminderBackgroundService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndSendInterviewRemindersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing interview reminders in background service.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("InterviewReminderBackgroundService stopping.");
        }

        private async Task CheckAndSendInterviewRemindersAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<RecruitmentDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var nowUtc = DateTime.UtcNow;

            // Target window: Interviews scheduled between 2 and 25 hours from now
            var minWindow = nowUtc.AddHours(2);
            var maxWindow = nowUtc.AddHours(25);

            var upcomingInterviews = await dbContext.Interviews
                .Include(i => i.Application)
                    .ThenInclude(a => a!.Job)
                .Include(i => i.Application!.Candidate)
                .Where(i => i.Status == "Scheduled" && 
                            !i.ReminderSent && 
                            i.InterviewDate >= minWindow && 
                            i.InterviewDate <= maxWindow)
                .ToListAsync(stoppingToken);

            if (!upcomingInterviews.Any())
            {
                return;
            }

            _logger.LogInformation("Found {Count} upcoming scheduled interview(s) requiring 24-hour reminder.", upcomingInterviews.Count);

            foreach (var interview in upcomingInterviews)
            {
                var candidate = interview.Application?.Candidate;
                var job = interview.Application?.Job;
                var candidateEmail = candidate?.Email;

                if (string.IsNullOrWhiteSpace(candidateEmail))
                {
                    // Cannot send without email, mark sent to prevent retrying missing candidate
                    interview.ReminderSent = true;
                    continue;
                }

                var candidateName = candidate?.FullName ?? "Candidate";
                var jobTitle = job?.Title ?? "Open Position";
                var companyName = !string.IsNullOrEmpty(interview.CompanyName) ? interview.CompanyName : (job?.CompanyName ?? "RecruitNexus Partner");
                var format = string.IsNullOrEmpty(interview.Format) ? "Online" : interview.Format;

                // IST Timezone formatting (UTC +5:30)
                DateTime istDate = interview.InterviewDate.Kind == DateTimeKind.Utc 
                    ? interview.InterviewDate.AddHours(5).AddMinutes(30) 
                    : interview.InterviewDate;

                string locationInfo = format.Equals("Online", StringComparison.OrdinalIgnoreCase)
                    ? $"<p><strong>Meeting Link:</strong> <a href='{interview.MeetingLink}'>{interview.MeetingLink}</a></p>"
                    : $"<p><strong>Location/Venue:</strong> {interview.OfficeAddress} {interview.Venue}</p>";

                var subject = $"Reminder: Interview Tomorrow for {jobTitle}";
                var body = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #fd7e14;'>Upcoming Interview Reminder (24h Away)</h2>
                        <p>Dear {candidateName},</p>
                        <p>This is a reminder that your interview for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> is scheduled for tomorrow.</p>
                        <p><strong>Scheduled Time (IST):</strong> {istDate:f}</p>
                        <p><strong>Format:</strong> {format}</p>
                        {locationInfo}
                        <p><strong>Status:</strong> {interview.Status}</p>
                        <br/>
                        <p>Please log in to your RecruitNexus account to confirm or review your interview details.</p>
                        <br/>
                        <p>Best regards,<br/><strong>The RecruitNexus Team</strong></p>
                    </div>";

                try
                {
                    await emailService.SendEmailAsync(candidateEmail, subject, body);
                    _logger.LogInformation("Successfully sent 24-hour reminder for Interview #{InterviewId} to {Email}.", interview.Id, candidateEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send 24-hour reminder for Interview #{InterviewId} to {Email}.", interview.Id, candidateEmail);
                }

                // Mark reminder sent to enforce at-most-once duplicate protection
                interview.ReminderSent = true;
            }

            await dbContext.SaveChangesAsync(stoppingToken);
        }
    }
}
