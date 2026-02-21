# GitHub에서 작업 가져오기

## 1. 저장소가 이미 있을 때 (clone)

GitHub에서 저장소 주소를 복사한 뒤, 원하는 폴더에서:

```bash
# 새 폴더에 가져오기
git clone https://github.com/사용자명/저장소명.git

# 예시
git clone https://github.com/roadt/my-project.git
```

가져온 폴더로 이동:
```bash
cd 저장소명
```

## 2. 이 폴더를 Git 저장소로 만들고 GitHub과 연결

이미 작업 중인 "ai project" 폴더를 GitHub에 올리려면:

```bash
cd "C:\Users\roadt\ai project"

# Git 초기화
git init

# GitHub에서 새 저장소 만든 후, 주소 연결
git remote add origin https://github.com/사용자명/저장소명.git

# 파일 추가 및 첫 커밋
git add .
git commit -m "Initial commit"

# 푸시 (main 브랜치)
git branch -M main
git push -u origin main
```

## 3. 이미 연결된 저장소에서 최신 작업 가져오기 (pull)

다른 PC에서 클론해 둔 경우, 최신 내용만 가져오기:

```bash
cd "저장소가_있는_폴더"
git pull origin main
```

## GitHub 사이트

- GitHub: https://github.com
- 새 저장소 만들기: https://github.com/new

## 참고

- **clone**: 저장소 전체를 새 폴더로 가져옴
- **pull**: 이미 clone한 저장소에서 최신 변경사항만 가져옴
- **push**: 로컬 커밋을 GitHub에 올림
