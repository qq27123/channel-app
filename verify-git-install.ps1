# Git Installation Verification Script
Write-Host "========================================" -ForegroundColor Green
Write-Host " Git Installation Verification Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git successfully installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git not properly installed or not added to PATH" -ForegroundColor Red
    Write-Host "Please ensure Git is properly installed and added to system PATH environment variable" -ForegroundColor Yellow
    Write-Host ""
    
    # Check default installation path
    if (Test-Path "C:\Program Files\Git\bin\git.exe") {
        Write-Host "Git detected at default location, attempting to add to PATH..." -ForegroundColor Yellow
        
        # Get current PATH
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        
        # Add Git paths
        $gitPaths = "C:\Program Files\Git\bin;C:\Program Files\Git\cmd"
        if (-not ($currentPath -like "*$gitPaths*")) {
            $newPath = "$currentPath;$gitPaths"
            [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
            Write-Host "Git paths added to system PATH, please restart PowerShell and try again" -ForegroundColor Green
        } else {
            Write-Host "Git paths already exist in PATH" -ForegroundColor Green
        }
    } else {
        Write-Host "Git not found at default location, please re-run the installer" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Installation verification completed!" -ForegroundColor Green