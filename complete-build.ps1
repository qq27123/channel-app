# Complete APK Build Script
Write-Host "========================================" -ForegroundColor Green
Write-Host " Complete APK Build Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:EAS_NO_VCS = "1"
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "EAS_NO_VCS = $env:EAS_NO_VCS" -ForegroundColor Gray
Write-Host "Current directory = $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Initialize EAS project if needed
Write-Host "Initializing EAS project..." -ForegroundColor Yellow
try {
    # Try to run EAS init first
    $initResult = npx eas init --non-interactive
    Write-Host "EAS project initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "EAS project may already be initialized" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting EAS Build..." -ForegroundColor Yellow
Write-Host "This may take 10-20 minutes. Please be patient." -ForegroundColor Gray
Write-Host ""

# Start the build process
try {
    $buildProcess = Start-Process -FilePath "npx" -ArgumentList "eas", "build", "--platform", "android", "--profile", "preview", "--non-interactive" -NoNewWindow -PassThru -Wait
    Write-Host "Build process completed with exit code: $($buildProcess.ExitCode)" -ForegroundColor Green
} catch {
    Write-Host "Build process encountered an error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Build script completed!" -ForegroundColor Green
Write-Host "Check the Expo dashboard for your build status:" -ForegroundColor Yellow
Write-Host "https://expo.dev/accounts/qq27122/projects/channel-app/builds" -ForegroundColor Gray