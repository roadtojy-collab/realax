/**
 * 유틸/로직 단위 테스트 (서버 불필요)
 * 사용법: node scripts/test-utils.mjs
 */

// formatPrice와 동일한 로직 (utils.ts와 계약 유지)
function formatPrice(price, unit = '만원') {
  if (price == null || price === undefined) return '미확인';
  if (price >= 10000) {
    const billions = Math.floor(price / 10000);
    const remainder = price % 10000;
    return remainder > 0 ? `${billions}억 ${remainder.toLocaleString()}${unit}` : `${billions}억`;
  }
  return `${price.toLocaleString()}${unit}`;
}

// URL 판별 정규식 (scraper.ts와 동일)
function isNaverLandUrl(url) {
  return /land\.naver\.com/i.test(url) || /fin\.land\.naver\.com/i.test(url);
}
function isZigbangUrl(url) {
  return /zigbang\.com/i.test(url);
}
function isDabangUrl(url) {
  return /dabang\.com/i.test(url) || /dabangapp\.com/i.test(url) || /다방/i.test(url);
}

let passed = 0;
let failed = 0;

function ok(cond, name) {
  if (cond) {
    console.log('  OK:', name);
    passed++;
  } else {
    console.log('  FAIL:', name);
    failed++;
  }
}

function eq(a, b, name) {
  const same = a === b;
  ok(same, name + (same ? '' : ` (got ${JSON.stringify(a)}, expected ${JSON.stringify(b)})`));
}

console.log('--- formatPrice ---');
eq(formatPrice(null), '미확인', 'formatPrice(null)');
eq(formatPrice(undefined), '미확인', 'formatPrice(undefined)');
eq(formatPrice(500), '500만원', 'formatPrice(500)');
eq(formatPrice(1000), '1,000만원', 'formatPrice(1000)');
eq(formatPrice(10000), '1억', 'formatPrice(10000)');
eq(formatPrice(15000), '1억 5,000만원', 'formatPrice(15000)');
eq(formatPrice(25000), '2억 5,000만원', 'formatPrice(25000)');

console.log('');
console.log('--- URL 판별 (scraper) ---');
ok(isNaverLandUrl('https://m.land.naver.com/article/info/123'), '네이버 m.land');
ok(isNaverLandUrl('https://fin.land.naver.com/articles/123'), '네이버 fin.land');
ok(!isNaverLandUrl('https://zigbang.com/items/1'), '직방은 네이버 아님');
ok(isZigbangUrl('https://www.zigbang.com/items/123'), '직방');
ok(isDabangUrl('https://www.dabangapp.com/room/abc'), '다방 dabangapp.com');
ok(!isZigbangUrl('https://land.naver.com/'), '네이버는 직방 아님');

console.log('');
console.log('--- 결과 ---');
console.log('Passed:', passed, 'Failed:', failed);
process.exit(failed > 0 ? 1 : 0);
