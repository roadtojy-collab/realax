/**
 * API 실제 테스트 (개발 서버 실행 중일 때)
 * 사용법: npm run dev 띄운 뒤 → npm run test:api
 */
const BASE = process.env.TEST_BASE || 'http://localhost:3000';

async function request(method, path, body) {
  const url = `${BASE}${path}`;
  const opt = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opt.body = JSON.stringify(body);
  const res = await fetch(url, opt);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (_) {}
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 200) };
}

let passed = 0;
let failed = 0;

function ok(cond, msg) {
  if (cond) {
    console.log('   ✓', msg);
    passed++;
  } else {
    console.log('   ✗', msg);
    failed++;
  }
}

async function run() {
  console.log('=== API 실제 테스트 ===');
  console.log('Base URL:', BASE);
  console.log('');

  // 1. GET / (메인 페이지)
  try {
    const r = await fetch(BASE, { method: 'GET' });
    const len = (await r.text()).length;
    ok(r.status === 200, `GET / → ${r.status}, length ${len}`);
  } catch (e) {
    console.log('   ✗ GET / -', e.message);
    failed++;
  }
  console.log('');

  // 2. GET /api/settings
  try {
    const r = await request('GET', '/api/settings');
    ok(r.ok && r.json && typeof r.json.hasKey === 'boolean', `GET /api/settings → ${r.status}`);
  } catch (e) {
    console.log('   ✗ GET /api/settings -', e.message);
    failed++;
  }
  console.log('');

  // 3. POST /api/generate (body 없음 → 400 또는 500)
  try {
    const r = await request('POST', '/api/generate', {});
    ok(r.status === 400 || r.status === 500, `POST /api/generate (no body) → ${r.status}`);
  } catch (e) {
    console.log('   ✗ POST /api/generate -', e.message);
    failed++;
  }
  console.log('');

  // 4. POST /api/generate (데이터 있음 → 200 또는 API키 없으면 400/500)
  try {
    const r = await request('POST', '/api/generate', {
      propertyData: {
        title: '테스트 매물',
        deal_type: 'MONTHLY',
        property_type: 'ONEROOM',
        region: '서울시 강남구',
        area_m2: 33,
        floor: '3층',
        deposit: 1000,
        monthly_rent: 50,
        price: null,
        options: ['에어컨', '냉장고'],
        highlights: '역세권',
      },
      saveToDb: false,
    });
    const success = r.ok && r.json?.success && r.json?.content;
    const expectedError = !r.ok && (r.json?.error?.includes('API 키') || r.status === 400 || r.status === 500);
    ok(success || expectedError, `POST /api/generate (with data) → ${r.status} ${success ? '(콘텐츠 생성 성공)' : '(API키 없음 등)'}`);
  } catch (e) {
    console.log('   ✗ POST /api/generate -', e.message);
    failed++;
  }
  console.log('');

  // 5. POST /api/scrape (잘못된 URL → 400)
  try {
    const r = await request('POST', '/api/scrape', { url: 'not-a-url' });
    ok(r.status === 400, `POST /api/scrape (invalid url) → ${r.status} (expected 400)`);
  } catch (e) {
    console.log('   ✗ POST /api/scrape -', e.message);
    failed++;
  }
  console.log('');

  // 6. POST /api/parse-image (이미지 없음 → 400)
  try {
    const r = await request('POST', '/api/parse-image', {});
    ok(r.status === 400, `POST /api/parse-image (no image) → ${r.status} (expected 400)`);
  } catch (e) {
    console.log('   ✗ POST /api/parse-image -', e.message);
    failed++;
  }

  console.log('');
  console.log('--- 결과 ---');
  console.log('통과:', passed, '실패:', failed);
  return failed;
}

run()
  .then((fails) => {
    if (fails > 0) process.exit(1);
  })
  .catch((e) => {
    if (e.cause?.code === 'ECONNREFUSED' || e.message?.includes('fetch')) {
      console.error('\n서버에 연결할 수 없습니다. 먼저 실행하세요: npm run dev\n');
    } else {
      console.error(e);
    }
    process.exit(1);
  });
