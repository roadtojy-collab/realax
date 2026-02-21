@echo off
echo Python 설치를 시작합니다...
echo.

REM winget을 사용한 설치 시도
echo [방법 1] winget을 사용하여 Python 설치 시도 중...
winget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
if %errorlevel% == 0 (
    echo Python 설치가 완료되었습니다!
    echo 설치 후 새 터미널을 열어주세요.
    pause
    exit /b 0
)

REM 수동 설치 안내
echo.
echo 자동 설치가 실패했습니다. 수동 설치 방법:
echo 1. https://www.python.org/downloads/ 에서 Python 다운로드
echo 2. 설치 시 'Add Python to PATH' 옵션을 체크하세요!
echo 3. 설치 후 새 터미널을 열어주세요.
echo.
pause
