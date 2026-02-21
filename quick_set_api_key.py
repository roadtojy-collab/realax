"""
빠른 API 키 설정 도구
"""
import os
import sys

def set_api_key():
    print("=" * 50)
    print("Claude API 키 설정")
    print("=" * 50)
    print()
    
    # 현재 API 키 확인
    current_key = os.getenv("ANTHROPIC_API_KEY")
    if current_key:
        print("[현재 설정된 API 키]")
        print(f"길이: {len(current_key)} 문자")
        print(f"처음 10자: {current_key[:10]}...")
        print()
        overwrite = input("이미 API 키가 설정되어 있습니다. 덮어쓰시겠습니까? (y/n): ")
        if overwrite.lower() != 'y':
            print("취소되었습니다.")
            return
    
    print("Anthropic API 키를 입력하세요:")
    print("(입력한 키는 현재 세션의 환경변수로 설정됩니다)")
    print()
    
    api_key = input("API 키: ").strip()
    
    if not api_key:
        print("오류: API 키가 입력되지 않았습니다.")
        sys.exit(1)
    
    # 환경변수 설정
    os.environ["ANTHROPIC_API_KEY"] = api_key
    
    print()
    print("✓ API 키가 현재 세션에 설정되었습니다!")
    print()
    print("설정된 API 키 정보:")
    print(f"  길이: {len(api_key)} 문자")
    print(f"  처음 10자: {api_key[:10]}...")
    print()
    print("참고:")
    print("  - 이 설정은 현재 Python 세션에만 적용됩니다.")
    print("  - 영구적으로 설정하려면 시스템 환경변수를 설정하거나 .env 파일을 사용하세요.")
    print()
    print("테스트 실행:")
    print("  python claude_client.py")
    print()

if __name__ == "__main__":
    set_api_key()
