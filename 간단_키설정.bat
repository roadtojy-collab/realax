@echo off
chcp 65001 >nul
echo ==================================================
echo Claude API 키 설정
echo ==================================================
echo.

set /p api_key="API 키를 입력하세요: "

if "%api_key%"=="" (
    echo 오류: API 키가 입력되지 않았습니다.
    pause
    exit /b 1
)

REM .env 파일에 저장
(
echo # Claude API 키 설정
echo # 이 파일은 .gitignore에 포함되어 있어 Git에 커밋되지 않습니다
echo.
echo ANTHROPIC_API_KEY=%api_key%
) > .env

echo.
echo ✓ API 키가 .env 파일에 저장되었습니다!
echo.
echo 테스트 실행:
echo   python claude_client.py
echo.
pause
