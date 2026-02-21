# API 키 설정 가이드

Claude API를 사용하기 위해 API 키를 설정하는 여러 방법을 제공합니다.

## 방법 1: 스크립트 사용 (권장)

### PowerShell 사용
```powershell
.\set_api_key.ps1
```
스크립트를 실행하면 API 키를 입력하라는 프롬프트가 나타납니다.

### CMD 사용
```cmd
set_api_key.bat
```

## 방법 2: .env 파일 사용 (영구 설정)

1. `.env.example` 파일을 `.env`로 복사:
   ```bash
   copy .env.example .env
   ```

2. `.env` 파일을 열고 실제 API 키 입력:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-실제API키여기에입력
   ```

3. python-dotenv 패키지 설치 (자동으로 .env 파일 로드):
   ```bash
   pip install python-dotenv
   ```

**장점:** 
- Git에 커밋되지 않음 (.gitignore에 포함됨)
- 프로젝트별로 다른 키 사용 가능
- 코드 수정 없이 키 변경 가능

## 방법 3: 환경변수 직접 설정

### Windows PowerShell
```powershell
$env:ANTHROPIC_API_KEY='your-api-key-here'
```

### Windows CMD
```cmd
set ANTHROPIC_API_KEY=your-api-key-here
```

### Windows 시스템 환경변수 (영구 설정)
1. 시스템 속성 > 고급 > 환경 변수
2. 사용자 변수 또는 시스템 변수에 추가:
   - 변수 이름: `ANTHROPIC_API_KEY`
   - 변수 값: 실제 API 키

## 방법 4: 코드에서 직접 설정

```python
from claude_client import ClaudeClient

# API 키를 직접 전달
claude = ClaudeClient(api_key='your-api-key-here')
response = claude.send_message("안녕하세요!")
```

## API 키 확인

설정이 제대로 되었는지 확인:

```python
import os
print(os.getenv("ANTHROPIC_API_KEY"))
```

또는 테스트 실행:
```bash
python claude_client.py
```

## API 키 발급 방법

1. https://console.anthropic.com/ 에 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 API 키 생성
4. 생성된 키를 복사하여 위의 방법 중 하나로 설정

## 보안 주의사항

⚠️ **중요:**
- API 키는 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- API 키를 다른 사람과 공유하지 마세요
- 키가 유출되면 즉시 Anthropic 콘솔에서 키를 삭제하세요

## 문제 해결

### API 키가 인식되지 않는 경우
1. 새 터미널 창을 열어보세요 (환경변수는 세션별로 설정됨)
2. `.env` 파일이 프로젝트 루트에 있는지 확인
3. `python-dotenv` 패키지가 설치되어 있는지 확인

### "API 키가 필요합니다" 오류
- 환경변수가 설정되었는지 확인
- `.env` 파일의 형식이 올바른지 확인 (공백 없이)
- 코드에서 직접 키를 전달하는 방법 시도
