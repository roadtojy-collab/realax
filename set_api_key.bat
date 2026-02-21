@echo off
chcp 65001 >nul
echo ==================================================
echo Claude API 키 설정
echo ==================================================
echo.

REM 현재 API 키 확인
if defined ANTHROPIC_API_KEY (
    echo [현재 설정된 API 키]
    echo 길이: 확인됨
    echo.
    set /p overwrite="이미 API 키가 설정되어 있습니다. 덮어쓰시겠습니까? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo 취소되었습니다.
        pause
        exit /b 0
    )
)

echo Anthropic API 키를 입력하세요:
echo (입력한 키는 현재 세션의 환경변수로 설정됩니다)
echo.
set /p api_key="API 키: "

if "%api_key%"=="" (
    echo 오류: API 키가 입력되지 않았습니다.
    pause
    exit /b 1
)

REM 환경변수 설정
set ANTHROPIC_API_KEY=%api_key%

echo.
echo ✓ API 키가 현재 세션에 설정되었습니다!
echo.
echo 설정된 API 키 정보:
echo   길이: 확인됨
echo.
echo 참고:
echo   - 이 설정은 현재 CMD 세션에만 적용됩니다.
echo   - 영구적으로 설정하려면 시스템 환경변수를 설정하거나 .env 파일을 사용하세요.
echo.
echo 테스트 실행:
echo   python claude_client.py
echo.
pause
