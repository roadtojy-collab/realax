/**
 * 실제 테스트용: 브라우저로 앱 + 프리뷰 열기 (서버는 별도 터미널에서 npm run dev 실행 후 사용)
 */
import { execSync } from 'child_process';

const base = process.env.TEST_BASE || 'http://localhost:3000';

function open(url) {
  const u = url.startsWith('http') ? url : `${base}${url}`;
  try {
    if (process.platform === 'win32') {
      execSync(`start "" "${u}"`, { shell: true });
    } else if (process.platform === 'darwin') {
      execSync(`open "${u}"`);
    } else {
      execSync(`xdg-open "${u}"`);
    }
    console.log('열기:', u);
  } catch (e) {
    console.log('브라우저 열기 실패. 직접 접속하세요:', u);
  }
}

console.log('실제 테스트용 브라우저 열기 (먼저 다른 터미널에서 npm run dev 실행하세요)\n');
open(base);
open(`${base}/preview.html`);
console.log('\n메인 앱과 테스트 프리뷰 탭이 열렸습니다.');
