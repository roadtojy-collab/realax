"""
직접 API 키 설정 (Python 실행 문제 해결용)
"""
import sys

# API 키를 명령줄 인자로 받기
if len(sys.argv) < 2:
    print("사용법: python set_key_direct.py YOUR_API_KEY")
    print("또는 대화형으로 입력받기")
    print()
    api_key = input("API 키를 입력하세요: ").strip()
else:
    api_key = sys.argv[1].strip()

if not api_key:
    print("오류: API 키가 입력되지 않았습니다.")
    sys.exit(1)

# .env 파일에 저장
try:
    with open('.env', 'w', encoding='utf-8') as f:
        f.write("# Claude API 키 설정\n")
        f.write("# 이 파일은 .gitignore에 포함되어 있어 Git에 커밋되지 않습니다\n\n")
        f.write(f"ANTHROPIC_API_KEY={api_key}\n")
    
    print("✓ API 키가 .env 파일에 저장되었습니다!")
    print(f"  길이: {len(api_key)} 문자")
    print(f"  처음 10자: {api_key[:10]}...")
    print()
    print("이제 다음 명령어로 테스트할 수 있습니다:")
    print("  python claude_client.py")
except Exception as e:
    print(f"오류 발생: {e}")
    sys.exit(1)
