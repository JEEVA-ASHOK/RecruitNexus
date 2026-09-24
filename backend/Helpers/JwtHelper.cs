using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using backend.Models;

namespace backend.Controllers
{
    public static class JwtHelper
    {
        public static string GetJwtSecret(IConfiguration configuration, IHostEnvironment? environment = null)
        {
            var secret = configuration["Jwt:Secret"] 
                         ?? configuration["JWT_SECRET"] 
                         ?? Environment.GetEnvironmentVariable("JWT_SECRET");

            if (string.IsNullOrWhiteSpace(secret) || secret.Trim().Length < 32)
            {
                throw new InvalidOperationException("JWT Secret configuration is missing or invalid. A strong secret of at least 32 characters must be configured in Jwt:Secret or JWT_SECRET.");
            }

            return secret.Trim();
        }

        public static string GenerateJwtToken(User user, IConfiguration configuration, IHostEnvironment? environment = null)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secret = GetJwtSecret(configuration, environment);
            var key = Encoding.ASCII.GetBytes(secret);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(ClaimTypes.Name, user.FullName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
