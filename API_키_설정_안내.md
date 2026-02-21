# API 키 설정 안내

Python 실행에 문제가 있는 경우, 다음 방법 중 하나를 사용하세요.

## 방법 1: 배치 파일 사용 (가장 간단)

```cmd
간단_키설정.bat
```

실행하면 API 키를 입력하라는 프롬프트가 나타납니다.

## 방법 2: 직접 .env 파일 생성

1. 프로젝트 폴더에 `.env` 파일을 만드세요
2. 다음 내용을 입력하세요:

```
ANTHROPIC_API_KEY=여기에_실제_API_키_입력
```

예시:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 방법 3: Python 스크립트 사용

```bash
python set_key_direct.py YOUR_API_KEY
```

또는 대화형으로:
```bash
python set_key_direct.py
```

## 방법 4: PowerShell에서 직접 설정

```powershell
$apiKey = Read-Host "API 키를 입력하세요"
"ANTHROPIC_API_KEY=$apiKey" | Out-File -FilePath .env -Encoding utf8
```

## 확인

설정 후 테스트:
```bash
python claude_client.py
```

## 주의사항

- API 키는 일반적으로 `sk-ant-`로 시작합니다
- `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- API 키를 다른 사람과 공유하지 마세요
