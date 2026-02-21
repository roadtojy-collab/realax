"""
Claude API 클라이언트 연결 코드
"""
import os
from anthropic import Anthropic

# .env 파일 지원
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv가 없어도 환경변수로 작동 가능

class ClaudeClient:
    def __init__(self, api_key=None):
        """
        Claude API 클라이언트 초기화
        
        Args:
            api_key: Anthropic API 키 (없으면 환경변수에서 가져옴)
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("API 키가 필요합니다. 환경변수 ANTHROPIC_API_KEY를 설정하거나 api_key 파라미터를 제공하세요.")
        
        self.client = Anthropic(api_key=self.api_key)
    
    def send_message(self, message, model="claude-3-5-sonnet-20241022", max_tokens=1024):
        """
        Claude에게 메시지 전송
        
        Args:
            message: 전송할 메시지
            model: 사용할 모델 (기본값: claude-3-5-sonnet-20241022)
            max_tokens: 최대 토큰 수
            
        Returns:
            Claude의 응답
        """
        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=[
                    {"role": "user", "content": message}
                ]
            )
            return response.content[0].text
        except Exception as e:
            return f"오류 발생: {str(e)}"
    
    def chat(self, messages, model="claude-3-5-sonnet-20241022", max_tokens=1024):
        """
        대화형 채팅
        
        Args:
            messages: 메시지 리스트 (예: [{"role": "user", "content": "안녕하세요"}])
            model: 사용할 모델
            max_tokens: 최대 토큰 수
            
        Returns:
            Claude의 응답
        """
        try:
            response = self.client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=messages
            )
            return response.content[0].text
        except Exception as e:
            return f"오류 발생: {str(e)}"


if __name__ == "__main__":
    # 사용 예제
    try:
        # 클라이언트 생성
        claude = ClaudeClient()
        
        # 메시지 전송
        response = claude.send_message("안녕하세요! 파이썬에 대해 설명해주세요.")
        print("Claude 응답:")
        print(response)
        
    except ValueError as e:
        print(f"설정 오류: {e}")
        print("\n사용 방법:")
        print("1. 환경변수 설정: export ANTHROPIC_API_KEY='your-api-key'")
        print("2. 또는 코드에서 직접 전달: ClaudeClient(api_key='your-api-key')")
    except Exception as e:
        print(f"오류 발생: {e}")
