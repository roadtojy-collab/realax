# 실제 테스트 방법

## 1. 유틸 테스트 (서버 불필요)

```bash
npm run test:utils
```

- `formatPrice`, URL 판별 로직 등 단위 검증
- 13개 항목 통과 시 성공

---

## 2. API 테스트 (개발 서버 필요)

**터미널 1** – 서버 실행:

```bash
npm run dev
```

**터미널 2** – API 테스트:

```bash
npm run test:api
```

- 메인 페이지, `/api/settings`, `/api/generate`, `/api/scrape`, `/api/parse-image` 호출 검증
- API 키가 없어도 에러 메시지까지 포함해 동작만 확인

---

## 3. 한 번에 실행 (유틸 → API)

서버를 **먼저** 띄운 뒤:

```bash
npm run test
```

- `test:utils` 실행 후 `test:api` 실행

---

## 4. 브라우저에서 직접 테스트

**터미널 1** – 서버 실행:

```bash
npm run dev
```

**터미널 2** – 앱 + 프리뷰 페이지 열기:

```bash
npm run test:open
```

- 메인 앱(`http://localhost:3000`)과 테스트 프리뷰(`/preview.html`) 탭이 브라우저에 열림
- URL 입력, 직접 입력, 콘텐츠 생성 등을 직접 조작해 보면서 테스트
