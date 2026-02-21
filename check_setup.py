"""
설치 상태 확인 스크립트
"""
import sys
import os

print("=" * 50)
print("Python 및 Claude 코드 설정 확인")
print("=" * 50)

# 1. Python 버전 확인
print(f"\n[1] Python 버전: {sys.version}")
print(f"    Python 경로: {sys.executable}")

# 2. 필요한 파일 확인
print("\n[2] 파일 확인:")
files_to_check = [
    "claude_client.py",
    "requirements.txt",
    "README.md"
]

for file in files_to_check:
    if os.path.exists(file):
        print(f"    ✓ {file} 존재")
    else:
        print(f"    ✗ {file} 없음")

# 3. anthropic 패키지 확인
print("\n[3] 패키지 확인:")
try:
    import anthropic
    print(f"    ✓ anthropic 패키지 설치됨 (버전: {anthropic.__version__})")
except ImportError:
    print("    ✗ anthropic 패키지 미설치")
    print("    → 설치 필요: pip install anthropic")

# 4. API 키 확인
print("\n[4] API 키 확인:")
api_key = os.getenv("ANTHROPIC_API_KEY")
if api_key:
    print(f"    ✓ ANTHROPIC_API_KEY 설정됨 (길이: {len(api_key)} 문자)")
else:
    print("    ✗ ANTHROPIC_API_KEY 미설정")
    print("    → 설정 필요: $env:ANTHROPIC_API_KEY='your-api-key'")

# 5. Claude 클라이언트 테스트
print("\n[5] Claude 클라이언트 테스트:")
try:
    from claude_client import ClaudeClient
    print("    ✓ claude_client 모듈 임포트 성공")
    
    if api_key:
        try:
            claude = ClaudeClient()
            print("    ✓ ClaudeClient 초기화 성공")
        except Exception as e:
            print(f"    ✗ ClaudeClient 초기화 실패: {e}")
    else:
        print("    ⚠ API 키가 없어 클라이언트 테스트 불가")
        
except ImportError as e:
    print(f"    ✗ claude_client 모듈 임포트 실패: {e}")

print("\n" + "=" * 50)
print("확인 완료!")
print("=" * 50)
