"""
간단한 웹 기반 로그인 인터페이스 (선택사항)
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import webbrowser
import threading
import os
from pathlib import Path
import urllib.parse

class LoginHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/login':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            html = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude API 로그인</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
            font-size: 14px;
        }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn:active {
            transform: translateY(0);
        }
        .link-btn {
            display: block;
            text-align: center;
            margin-top: 15px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        .link-btn:hover {
            text-decoration: underline;
        }
        .message {
            margin-top: 20px;
            padding: 12px;
            border-radius: 8px;
            display: none;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Claude API 로그인</h1>
        <p class="subtitle">API 키를 입력하여 로그인하세요</p>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="apiKey">API 키</label>
                <input type="text" id="apiKey" name="apiKey" placeholder="sk-ant-api03-..." required>
            </div>
            <button type="submit" class="btn">로그인</button>
            <a href="https://console.anthropic.com/" target="_blank" class="link-btn">
                API 키가 없으신가요? Anthropic 콘솔에서 생성하기 →
            </a>
        </form>
        
        <div id="message" class="message"></div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const apiKey = document.getElementById('apiKey').value;
            const messageDiv = document.getElementById('message');
            
            try {
                const response = await fetch('/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'apiKey=' + encodeURIComponent(apiKey)
                });
                
                const result = await response.text();
                
                if (response.ok) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = '✓ 로그인 성공! API 키가 저장되었습니다.';
                    messageDiv.style.display = 'block';
                    document.getElementById('apiKey').value = '';
                } else {
                    throw new Error(result);
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = '❌ 오류: ' + error.message;
                messageDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>
            """
            self.wfile.write(html.encode('utf-8'))
        
        elif self.path == '/save':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'OK')
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            params = urllib.parse.parse_qs(post_data)
            
            api_key = params.get('apiKey', [''])[0]
            
            if api_key:
                # .env 파일에 저장
                env_file = Path(".env")
                with open(env_file, 'w', encoding='utf-8') as f:
                    f.write("# Claude API 키 설정\n")
                    f.write(f"ANTHROPIC_API_KEY={api_key}\n")
                
                self.send_response(200)
                self.send_header('Content-type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'OK')
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'API key required')
    
    def log_message(self, format, *args):
        pass  # 로그 메시지 숨기기

def start_web_login():
    """웹 기반 로그인 서버 시작"""
    port = 8000
    server = HTTPServer(('localhost', port), LoginHandler)
    
    url = f'http://localhost:{port}/login'
    print("=" * 60)
    print("웹 기반 로그인 인터페이스")
    print("=" * 60)
    print()
    print(f"서버가 시작되었습니다: {url}")
    print("브라우저가 자동으로 열립니다...")
    print()
    print("종료하려면 Ctrl+C를 누르세요.")
    print()
    
    # 브라우저 열기
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다...")
        server.shutdown()

if __name__ == "__main__":
    start_web_login()
