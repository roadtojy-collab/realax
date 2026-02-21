# Python 설치 가이드

## 자동 설치 방법

### 방법 1: PowerShell 스크립트 실행
```powershell
.\install_python.ps1
```

### 방법 2: 배치 파일 실행
```cmd
install_python.bat
```

## 수동 설치 방법 (권장)

### 1. Python 다운로드
- 공식 웹사이트: https://www.python.org/downloads/
- 최신 버전 (Python 3.12 이상) 다운로드

### 2. 설치 시 주의사항
⚠️ **중요**: 설치 시 반드시 **"Add Python to PATH"** 옵션을 체크하세요!

### 3. 설치 확인
새 터미널을 열고 다음 명령어로 확인:
```bash
python --version
```

또는
```bash
py --version
```

## 설치 후 Claude 코드 실행

1. 패키지 설치:
```bash
pip install anthropic
```

2. API 키 설정:
```powershell
$env:ANTHROPIC_API_KEY='your-api-key-here'
```

3. 코드 실행:
```bash
python claude_client.py
```

## 문제 해결

### Python이 인식되지 않는 경우
1. 설치 시 "Add Python to PATH"를 체크했는지 확인
2. 새 터미널 창을 열어보기
3. 환경 변수 수동 설정:
   - 시스템 속성 > 환경 변수 > Path에 Python 경로 추가
   - 일반 경로: `C:\Users\사용자명\AppData\Local\Programs\Python\Python3XX\`

### pip이 작동하지 않는 경우
```bash
python -m ensurepip --upgrade
```
