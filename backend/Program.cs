using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Services;
using System.IO;
using Microsoft.OpenApi.Models;

// Load local .env file if it exists
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
        {
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register Swagger Generator with JWT bearer support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RecruitNexus API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Setup CORS (Dynamic origins with local development fallback)
var allowedOrigins = new List<string> { "http://localhost:5173" };

var configOrigins = builder.Configuration["Cors:AllowedOrigins"] 
                    ?? builder.Configuration["CORS_ALLOWED_ORIGINS"]
                    ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");

if (!string.IsNullOrWhiteSpace(configOrigins))
{
    var parsedOrigins = configOrigins.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                                     .Select(o => o.Trim())
                                     .Where(o => !string.IsNullOrWhiteSpace(o));
    foreach (var origin in parsedOrigins)
    {
        if (!allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
        {
            allowedOrigins.Add(origin);
        }
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Database Connection (SQLite fallback, MySQL target)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? Environment.GetEnvironmentVariable("DATABASE_CONNECTION");

builder.Services.AddDbContext<RecruitmentDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) && 
        (connectionString.Contains("server=", StringComparison.OrdinalIgnoreCase) || 
         connectionString.Contains("uid=", StringComparison.OrdinalIgnoreCase) ||
         connectionString.Contains("database=", StringComparison.OrdinalIgnoreCase)))
    {
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        options.UseMySql(connectionString, serverVersion);
    }
    else
    {
        // Use SQLite for simple local development fallback
        var sqlitePath = Path.Combine(Directory.GetCurrentDirectory(), "recruitment.db");
        options.UseSqlite($"Data Source={sqlitePath}");
    }
});

// Configure JWT Authentication
var jwtSecret = backend.Controllers.JwtHelper.GetJwtSecret(builder.Configuration, builder.Environment);
var key = Encoding.ASCII.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Register services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IGeminiService, GeminiService>();
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddHostedService<InterviewReminderBackgroundService>();

var app = builder.Build();

// Auto-run Database Migrations on Startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RecruitmentDbContext>();
    try
    {
        // Ensures database exists and applies pending migrations or schema creation
        db.Database.EnsureCreated();
        DatabaseSeeder.Seed(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating, migrating or seeding the database.");
    }
}

// Configure the HTTP request pipeline.

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        if (exceptionHandlerPathFeature?.Error != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(exceptionHandlerPathFeature.Error, "Unhandled exception occurred while processing request path {Path}", exceptionHandlerPathFeature.Path);
        }

        await context.Response.WriteAsJsonAsync(new { message = "An error occurred while processing your request." });
    });
});

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "RecruitNexus API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
