# Claude API Key Setup Script (PowerShell)
# UTF-8 encoding

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Claude API Key Setup" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check current API key
$currentKey = $env:ANTHROPIC_API_KEY
if ($currentKey) {
    Write-Host "[Current API Key]" -ForegroundColor Yellow
    Write-Host "Length: $($currentKey.Length) characters" -ForegroundColor Gray
    Write-Host "First 10 chars: $($currentKey.Substring(0, [Math]::Min(10, $currentKey.Length)))..." -ForegroundColor Gray
    Write-Host ""
    $overwrite = Read-Host "API key already set. Overwrite? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Enter your Anthropic API key:" -ForegroundColor Cyan
Write-Host "(This will be set for the current session only)" -ForegroundColor Gray
Write-Host ""

# Get API key input
$apiKey = Read-Host "API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Error: API key was not entered." -ForegroundColor Red
    exit 1
}

# Set environment variable
$env:ANTHROPIC_API_KEY = $apiKey

Write-Host ""
Write-Host "API key has been set for the current session!" -ForegroundColor Green
Write-Host ""
Write-Host "API Key Info:" -ForegroundColor Cyan
Write-Host "  Length: $($apiKey.Length) characters" -ForegroundColor Gray
Write-Host "  First 10 chars: $($apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)))..." -ForegroundColor Gray
Write-Host ""
Write-Host "Note:" -ForegroundColor Yellow
Write-Host "  - This setting applies only to the current PowerShell session." -ForegroundColor Gray
Write-Host "  - For permanent setup, use system environment variables or .env file." -ForegroundColor Gray
Write-Host ""
Write-Host "Test:" -ForegroundColor Cyan
Write-Host "  python claude_client.py" -ForegroundColor White
Write-Host ""
