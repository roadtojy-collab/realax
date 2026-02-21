"""
Anthropic 콘솔 열기
"""
import webbrowser
import sys

def open_anthropic_console():
    """Anthropic 콘솔을 브라우저에서 열기"""
    url = "https://console.anthropic.com/"
    print("=" * 60)
    print("Anthropic 콘솔 열기")
    print("=" * 60)
    print()
    print(f"브라우저에서 다음 주소를 엽니다: {url}")
    print()
    
    try:
        webbrowser.open(url)
        print("✓ 브라우저가 열렸습니다!")
        print()
        print("다음 단계:")
        print("1. 계정에 로그인 (또는 계정 생성)")
        print("2. 'API Keys' 메뉴로 이동")
        print("3. 'Create Key' 버튼 클릭")
        print("4. 생성된 API 키를 복사")
        print("5. 복사한 키를 사용하여 로그인하세요")
        print()
        print("API 키를 복사한 후:")
        print("  python quick_login.py")
        print("  또는")
        print("  간단_키설정.bat")
    except Exception as e:
        print(f"오류 발생: {e}")
        print()
        print("수동으로 브라우저에서 다음 주소를 열어주세요:")
        print(url)

if __name__ == "__main__":
    open_anthropic_console()
