# Claude API 연결 코드

Anthropic Claude API를 사용하기 위한 Python 클라이언트입니다.

## 설치

```bash
pip install -r requirements.txt
```

## 사용 방법

### 1. 로그인 (API 키 설정)

**방법 1: 대화형 로그인 (권장)**
```bash
python login.py
```
- API 키를 입력받아 자동으로 설정합니다
- 필요시 Anthropic 콘솔을 브라우저에서 열어줍니다
- .env 파일에 영구 저장 가능

**방법 2: 웹 기반 로그인**
```bash
python login_web.py
```
- 브라우저에서 시각적인 인터페이스로 로그인
- http://localhost:8000/login 에서 접속

**방법 3: 환경변수로 직접 설정**
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

또는 Windows PowerShell:
```powershell
$env:ANTHROPIC_API_KEY='your-api-key-here'
```

### 2. 코드 실행

```bash
python claude_client.py
```

### 3. 코드에서 사용

```python
from claude_client import ClaudeClient

# 클라이언트 생성
claude = ClaudeClient()

# 단일 메시지 전송
response = claude.send_message("안녕하세요!")
print(response)

# 대화형 채팅
messages = [
    {"role": "user", "content": "파이썬이란?"}
]
response = claude.chat(messages)
print(response)
```

## 주요 기능

- `send_message()`: 단일 메시지 전송
- `chat()`: 대화형 채팅 (메시지 히스토리 포함)

## 모델 선택

기본 모델은 `claude-3-5-sonnet-20241022`입니다. 다른 모델을 사용하려면:

```python
response = claude.send_message("메시지", model="claude-3-opus-20240229")
```
