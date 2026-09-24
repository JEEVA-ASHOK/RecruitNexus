using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace backend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            // Read configuration properties
            var server = _configuration["Smtp:Server"];
            var portStr = _configuration["Smtp:Port"];
            var senderName = _configuration["Smtp:SenderName"] ?? "RecruitNexus Portal";
            var senderEmail = _configuration["Smtp:SenderEmail"];
            var password = _configuration["Smtp:Password"];
            var enableSslStr = _configuration["Smtp:EnableSsl"];

            // Check if configurations are missing or set to placeholder
            if (string.IsNullOrWhiteSpace(server) || 
                string.IsNullOrWhiteSpace(senderEmail) || 
                string.IsNullOrWhiteSpace(password) ||
                senderEmail.Equals("YOUR_ACTUAL_GMAIL@gmail.com", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("SMTP Configuration is incomplete or using placeholder (Server, SenderEmail, or Password). Skipping real email delivery to {ToEmail}.", toEmail);
                _logger.LogInformation("[MOCK EMAIL] To: {ToEmail} | Subject: {Subject}\nBody: {Body}", toEmail, subject, htmlMessage);
                return;
            }

            if (!int.TryParse(portStr, out int port))
            {
                port = 587; // default SMTP port
            }

            bool.TryParse(enableSslStr, out bool enableSsl);

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = htmlMessage
                };
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    var secureSocketOption = SecureSocketOptions.StartTls;
                    if (port == 465)
                    {
                        secureSocketOption = SecureSocketOptions.SslOnConnect;
                    }
                    else if (!enableSsl)
                    {
                        secureSocketOption = SecureSocketOptions.None;
                    }

                    await client.ConnectAsync(server, port, secureSocketOption);
                    await client.AuthenticateAsync(senderEmail, password);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                _logger.LogInformation("Successfully sent email to {ToEmail} with subject '{Subject}'.", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to deliver email to {ToEmail} via MailKit SMTP. Continuing execution without throwing error.", toEmail);
            }
        }
    }
}
