# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy remaining code and publish
COPY . ./
RUN dotnet publish -c Release -o out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .

# Expose port 5000 (standard for local API dev/containers)
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

# Run backend API
ENTRYPOINT ["dotnet", "backend.dll"]
