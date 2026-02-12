$ErrorActionPreference = "Stop"

# Configuration
$projectFile = "Jellyfin.Plugin.NewReviewPlugin.csproj"
$manifestFile = "manifest.json"
$outputDir = "bin/Release/net8.0"
$zipName = "plugin_reviews.zip"

# Read version from manifest
$manifestContent = Get-Content $manifestFile -Raw | ConvertFrom-Json
$version = $manifestContent.version
Write-Host "Building version: $version"

# Update .csproj version
$xml = [xml](Get-Content $projectFile)
$xml.Project.PropertyGroup.AssemblyVersion = "$version"
$xml.Project.PropertyGroup.FileVersion = "$version"
$xml.Save($projectFile)

# Restore and Build
dotnet restore
dotnet build -c Release --no-restore

# Create ZIP
$zipPath = "plugin_reviews.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$dllPath = Join-Path $outputDir "Jellyfin.Plugin.NewReviewPlugin.dll"
if (-not (Test-Path $dllPath)) {
    Write-Error "DLL not found at $dllPath"
}

# Wait for file handles to be released
Start-Sleep -Seconds 2

Compress-Archive -Path $dllPath, $manifestFile -DestinationPath $zipPath -Force
Write-Host "Created ZIP at $zipPath"

# Calculate MD5
$md5 = (Get-FileHash $zipPath -Algorithm MD5).Hash.ToLower()
Write-Host "MD5 Checksum: $md5"

# Update manifest with checksum (read original again to ensure clean state)
# Update manifest with checksum (read original again to ensure clean state)
$manifestContent = Get-Content $manifestFile -Raw | ConvertFrom-Json
$latestVersion = $manifestContent.versions | Where-Object { $_.version -eq $version }

if ($null -eq $latestVersion) {
    # If version doesn't exist, create a new entry (basic)
    $latestVersion = @{
        version = $version
        changelog = "Automated build"
        targetAbi = $manifestContent.targetAbi
        sourceUrl = ""
        checksum = ""
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    $manifestContent.versions += $latestVersion
}

# Update the checksum and sourceUrl
$latestVersion.checksum = $md5
$latestVersion.sourceUrl = "https://github.com/luiscorbachoflores/pluginratingtest/releases/download/$version/plugin_reviews.zip"
$latestVersion.timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")

$manifestContent | ConvertTo-Json -Depth 10 | Set-Content $manifestFile
Write-Host "Updated manifest.json with new checksum"

Write-Host "Build and packaging complete!"
