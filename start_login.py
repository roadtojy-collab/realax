"""
대화형 로그인 시작 스크립트
"""
import subprocess
import sys
import os

def check_python():
    """Python 설치 확인"""
    try:
        result = subprocess.run(['python', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✓ Python 설치 확인: {result.stdout.strip()}")
            return True
    except:
        pass
    
    try:
        result = subprocess.run(['py', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✓ Python 설치 확인: {result.stdout.strip()}")
            return True
    except:
        pass
    
    print("❌ Python이 설치되어 있지 않거나 PATH에 없습니다.")
    return False

def check_files():
    """필요한 파일 확인"""
    required_files = ['login.py', 'claude_client.py']
    all_exist = True
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file} 존재")
        else:
            print(f"❌ {file} 없음")
            all_exist = False
    
    return all_exist

def start_login():
    """로그인 프로세스 시작"""
    print("=" * 60)
    print("로그인 준비 확인")
    print("=" * 60)
    print()
    
    # Python 확인
    if not check_python():
        print()
        print("Python을 먼저 설치해주세요.")
        print("https://www.python.org/downloads/")
        return False
    
    print()
    
    # 파일 확인
    if not check_files():
        print()
        print("필요한 파일이 없습니다.")
        return False
    
    print()
    print("=" * 60)
    print("대화형 로그인 시작")
    print("=" * 60)
    print()
    
    # login.py 실행
    try:
        subprocess.run([sys.executable, 'login.py'], check=True)
    except subprocess.CalledProcessError:
        print("로그인 스크립트 실행 중 오류가 발생했습니다.")
        return False
    except KeyboardInterrupt:
        print("\n로그인이 취소되었습니다.")
        return False
    
    return True

if __name__ == "__main__":
    start_login()
