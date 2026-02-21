"""
Claude API 로그인 인터페이스
"""
import os
import sys
import webbrowser
from pathlib import Path

def open_anthropic_console():
    """Anthropic 콘솔을 브라우저에서 열기"""
    url = "https://console.anthropic.com/"
    print(f"브라우저에서 Anthropic 콘솔을 엽니다: {url}")
    webbrowser.open(url)
    print("브라우저가 열렸습니다. API 키를 생성하거나 복사하세요.")
    print()

def save_api_key_to_env(api_key):
    """API 키를 .env 파일에 저장"""
    env_file = Path(".env")
    
    # .env 파일 읽기
    env_content = {}
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_content[key.strip()] = value.strip()
    
    # API 키 업데이트
    env_content['ANTHROPIC_API_KEY'] = api_key
    
    # .env 파일 쓰기
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write("# Claude API 키 설정\n")
        f.write("# 이 파일은 .gitignore에 포함되어 있어 Git에 커밋되지 않습니다\n\n")
        f.write(f"ANTHROPIC_API_KEY={api_key}\n")
    
    print(f"✓ API 키가 .env 파일에 저장되었습니다!")

def login():
    """로그인 프로세스"""
    print("=" * 60)
    print("Claude API 로그인")
    print("=" * 60)
    print()
    
    # 현재 설정 확인
    current_key = os.getenv("ANTHROPIC_API_KEY")
    if current_key:
        print("[현재 설정된 API 키]")
        print(f"  길이: {len(current_key)} 문자")
        print(f"  처음 10자: {current_key[:10]}...")
        print()
        choice = input("이미 API 키가 설정되어 있습니다. 새로 설정하시겠습니까? (y/n): ")
        if choice.lower() != 'y':
            print("로그인을 취소했습니다.")
            return True
    
    print("API 키를 가져오는 방법:")
    print("1. 이미 API 키가 있는 경우: 직접 입력")
    print("2. API 키가 없는 경우: Anthropic 콘솔에서 생성")
    print()
    
    choice = input("어떤 방법을 사용하시겠습니까? (1/2): ").strip()
    
    if choice == '2':
        print()
        print("Anthropic 콘솔을 열까요?")
        open_console = input("브라우저에서 콘솔 열기 (y/n): ").strip().lower()
        
        if open_console == 'y':
            open_anthropic_console()
            print()
            print("API 키 생성 방법:")
            print("1. 콘솔에 로그인 (또는 계정 생성)")
            print("2. 'API Keys' 메뉴로 이동")
            print("3. 'Create Key' 버튼 클릭")
            print("4. 생성된 API 키를 복사")
            print()
            input("API 키를 복사한 후 Enter를 누르세요...")
    
    print()
    print("-" * 60)
    api_key = input("API 키를 입력하세요: ").strip()
    
    if not api_key:
        print("오류: API 키가 입력되지 않았습니다.")
        return False
    
    # API 키 형식 간단 검증
    if not api_key.startswith('sk-ant-'):
        print("⚠️  경고: API 키 형식이 올바르지 않을 수 있습니다.")
        print("   일반적으로 'sk-ant-'로 시작합니다.")
        continue_anyway = input("   계속하시겠습니까? (y/n): ").strip().lower()
        if continue_anyway != 'y':
            return False
    
    print()
    print("API 키 저장 방법을 선택하세요:")
    print("1. 현재 세션에만 저장 (환경변수)")
    print("2. .env 파일에 저장 (영구, 권장)")
    print("3. 둘 다 저장")
    
    save_choice = input("선택 (1/2/3): ").strip()
    
    if save_choice in ['1', '3']:
        os.environ["ANTHROPIC_API_KEY"] = api_key
        print("✓ 현재 세션 환경변수에 저장되었습니다.")
    
    if save_choice in ['2', '3']:
        save_api_key_to_env(api_key)
    
    print()
    print("=" * 60)
    print("로그인 완료!")
    print("=" * 60)
    print()
    print("설정된 API 키 정보:")
    print(f"  길이: {len(api_key)} 문자")
    print(f"  처음 10자: {api_key[:10]}...")
    print()
    print("테스트 실행:")
    print("  python claude_client.py")
    print()
    
    return True

def verify_login():
    """로그인 상태 확인 및 테스트"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key:
        # .env 파일에서 읽기 시도
        env_file = Path(".env")
        if env_file.exists():
            try:
                from dotenv import load_dotenv
                load_dotenv()
                api_key = os.getenv("ANTHROPIC_API_KEY")
            except ImportError:
                pass
    
    if not api_key:
        print("❌ API 키가 설정되지 않았습니다.")
        return False
    
    print("✓ API 키가 설정되어 있습니다.")
    print(f"  길이: {len(api_key)} 문자")
    
    # 간단한 연결 테스트
    print()
    print("API 연결 테스트 중...")
    try:
        from claude_client import ClaudeClient
        claude = ClaudeClient()
        print("✓ Claude 클라이언트 초기화 성공!")
        return True
    except Exception as e:
        print(f"❌ 연결 테스트 실패: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        verify_login()
    else:
        success = login()
        if success:
            print()
            test = input("지금 연결 테스트를 실행하시겠습니까? (y/n): ").strip().lower()
            if test == 'y':
                print()
                verify_login()
