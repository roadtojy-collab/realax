"""
빠른 로그인 - API 키가 있는 경우
"""
import os
from pathlib import Path

def save_api_key(api_key):
    """API 키를 .env 파일과 환경변수에 저장"""
    # .env 파일에 저장
    env_file = Path(".env")
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write("# Claude API 키 설정\n")
        f.write("# 이 파일은 .gitignore에 포함되어 있어 Git에 커밋되지 않습니다\n\n")
        f.write(f"ANTHROPIC_API_KEY={api_key}\n")
    
    # 환경변수에도 설정
    os.environ["ANTHROPIC_API_KEY"] = api_key
    
    print("✓ API 키가 저장되었습니다!")
    print(f"  - .env 파일에 저장됨")
    print(f"  - 현재 세션 환경변수에 설정됨")
    print()

def main():
    print("=" * 60)
    print("Claude API 키 설정")
    print("=" * 60)
    print()
    
    # 현재 키 확인
    current_key = os.getenv("ANTHROPIC_API_KEY")
    env_file = Path(".env")
    if env_file.exists():
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('ANTHROPIC_API_KEY='):
                        current_key = line.split('=', 1)[1].strip()
                        break
        except:
            pass
    
    if current_key:
        print("[현재 설정된 API 키]")
        print(f"  길이: {len(current_key)} 문자")
        print(f"  처음 10자: {current_key[:10]}...")
        print()
        choice = input("새로운 API 키로 변경하시겠습니까? (y/n): ").strip().lower()
        if choice != 'y':
            print("취소되었습니다.")
            return
    
    print()
    print("API 키를 입력하세요:")
    api_key = input("> ").strip()
    
    if not api_key:
        print("오류: API 키가 입력되지 않았습니다.")
        return
    
    # API 키 형식 검증
    if not api_key.startswith('sk-ant-'):
        print()
        print("⚠️  경고: API 키 형식이 올바르지 않을 수 있습니다.")
        print("   일반적으로 'sk-ant-'로 시작합니다.")
        choice = input("   계속하시겠습니까? (y/n): ").strip().lower()
        if choice != 'y':
            print("취소되었습니다.")
            return
    
    print()
    save_api_key(api_key)
    
    print("=" * 60)
    print("설정 완료!")
    print("=" * 60)
    print()
    print("설정된 API 키 정보:")
    print(f"  길이: {len(api_key)} 문자")
    print(f"  처음 10자: {api_key[:10]}...")
    print()
    print("테스트 실행:")
    print("  python claude_client.py")
    print()

if __name__ == "__main__":
    main()
