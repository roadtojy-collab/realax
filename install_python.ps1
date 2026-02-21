# Python 설치 스크립트 (Windows)
Write-Host "Python 설치를 시작합니다..." -ForegroundColor Green

# winget을 사용한 설치 시도
try {
    Write-Host "`n[방법 1] winget을 사용하여 Python 설치 시도 중..." -ForegroundColor Yellow
    winget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
    Write-Host "Python 설치가 완료되었습니다!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "winget 설치 실패. 다른 방법을 시도합니다..." -ForegroundColor Yellow
}

# chocolatey를 사용한 설치 시도
try {
    Write-Host "`n[방법 2] Chocolatey를 사용하여 Python 설치 시도 중..." -ForegroundColor Yellow
    choco install python -y
    Write-Host "Python 설치가 완료되었습니다!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "Chocolatey 설치 실패." -ForegroundColor Yellow
}

# 수동 설치 안내
Write-Host "`n자동 설치가 실패했습니다. 수동 설치 방법:" -ForegroundColor Red
Write-Host "1. https://www.python.org/downloads/ 에서 Python 다운로드" -ForegroundColor Cyan
Write-Host "2. 설치 시 'Add Python to PATH' 옵션을 체크하세요!" -ForegroundColor Cyan
Write-Host "3. 설치 후 새 터미널을 열어주세요." -ForegroundColor Cyan
