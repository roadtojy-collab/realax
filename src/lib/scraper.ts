import * as cheerio from 'cheerio';

const MAX_TEXT_LENGTH = 3000;

export interface ScrapeResult {
    success: boolean;
    text?: string;
    error?: string;
}

// ─── 메인 스크래핑 함수: 다단계 폴백 전략 ─────────────────────────
export async function scrapePropertyPage(url: string): Promise<ScrapeResult> {
    console.log('[scraper] 시작:', url);

    // 1단계: 사이트별 API 직접 호출 (가장 안정적)
    const siteResult = await trySiteSpecificApi(url);
    if (siteResult.success && siteResult.text && siteResult.text.length >= 50) {
        console.log('[scraper] 사이트별 API 성공, 텍스트 길이:', siteResult.text.length);
        return siteResult;
    }
    if (siteResult.error) {
        console.log('[scraper] 사이트별 API 실패:', siteResult.error);
    }

    // 2단계: 강화된 fetch + Cheerio (일반 사이트 대응)
    const fetchResult = await tryFetchWithCheerio(url);
    if (fetchResult.success && fetchResult.text && fetchResult.text.length >= 50) {
        console.log('[scraper] Fetch+Cheerio 성공, 텍스트 길이:', fetchResult.text.length);
        return fetchResult;
    }
    if (fetchResult.error) {
        console.log('[scraper] Fetch+Cheerio 실패:', fetchResult.error);
    }

    // 3단계: 모바일 URL 변환 후 재시도
    const mobileUrl = convertToMobileUrl(url);
    if (mobileUrl !== url) {
        const mobileResult = await tryFetchWithCheerio(mobileUrl);
        if (mobileResult.success && mobileResult.text && mobileResult.text.length >= 50) {
            console.log('[scraper] 모바일 URL 성공, 텍스트 길이:', mobileResult.text.length);
            return mobileResult;
        }
    }

    // 모든 전략 실패
    return {
        success: false,
        error: '이 사이트에서 매물 정보를 자동으로 가져올 수 없습니다. 사이트가 JavaScript로만 콘텐츠를 렌더링하거나 접근이 제한되었을 수 있습니다.',
    };
}

// ─── 1단계: 사이트별 API 직접 호출 ──────────────────────────────
async function trySiteSpecificApi(url: string): Promise<ScrapeResult> {
    try {
        if (isNaverLandUrl(url)) return await scrapeNaverLandApi(url);
        if (isZigbangUrl(url)) return await scrapeZigbangApi(url);
        if (isDabangUrl(url)) return await scrapeDabangApi(url);
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
    return { success: false, error: '지원되는 사이트가 아닙니다.' };
}

// ─── URL 판별 함수들 ────────────────────────────────────────────
function isNaverLandUrl(url: string): boolean {
    return /land\.naver\.com/i.test(url) || /fin\.land\.naver\.com/i.test(url);
}

function isZigbangUrl(url: string): boolean {
    return /zigbang\.com/i.test(url);
}

function isDabangUrl(url: string): boolean {
    return /dabang\.com/i.test(url) || /다방/i.test(url);
}

// ─── 네이버 부동산 API 스크래퍼 ─────────────────────────────────
async function scrapeNaverLandApi(url: string): Promise<ScrapeResult> {
    // URL에서 articleId 추출 (다양한 URL 패턴 대응)
    const articleId = extractNaverArticleId(url);
    if (!articleId) {
        return { success: false, error: '네이버 부동산 매물 ID를 URL에서 추출할 수 없습니다.' };
    }

    console.log('[scraper:naver] articleId:', articleId);

    // 네이버 부동산 내부 API 호출
    const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://m.land.naver.com/',
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        // 방법 1: fin.land.naver.com API
        const apiUrl = `https://fin.land.naver.com/front-api/v1/article/basicInfo?articleId=${articleId}`;
        console.log('[scraper:naver] API 호출:', apiUrl);

        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers,
        });

        if (response.ok) {
            const data = await response.json();
            const text = formatNaverApiData(data);
            if (text.length >= 50) {
                return { success: true, text };
            }
        }

        // 방법 2: new.land.naver.com API (구버전 호환)
        const apiUrl2 = `https://new.land.naver.com/api/articles/${articleId}`;
        const response2 = await fetch(apiUrl2, {
            signal: controller.signal,
            headers: {
                ...headers,
                'Referer': 'https://new.land.naver.com/',
            },
        });

        if (response2.ok) {
            const data2 = await response2.json();
            const text2 = formatNaverApiData(data2);
            if (text2.length >= 50) {
                return { success: true, text: text2 };
            }
        }

        // 방법 3: 모바일 페이지 직접 스크래핑 (SSR 콘텐츠 추출)
        const mobileUrl = `https://m.land.naver.com/article/info/${articleId}`;
        return await tryFetchWithCheerio(mobileUrl);
    } finally {
        clearTimeout(timeout);
    }
}

function extractNaverArticleId(url: string): string | null {
    // 패턴들:
    // https://m.land.naver.com/article/info/2501186950
    // https://new.land.naver.com/articles/2501186950
    // https://fin.land.naver.com/articles/2501186950
    // https://land.naver.com/article/info/2501186950
    // articleId=2501186950 (쿼리 파라미터)
    const patterns = [
        /article\/info\/(\d+)/,
        /articles?\/(\d+)/,
        /articleId[=:](\d+)/,
        /atclNo[=:](\d+)/,
        /\/(\d{8,12})(?:\?|$|\/)/,  // 8~12자리 숫자 (매물 ID 길이)
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    // URL 쿼리 파라미터에서도 시도
    try {
        const parsed = new URL(url);
        const articleId = parsed.searchParams.get('articleId') || parsed.searchParams.get('atclNo');
        if (articleId) return articleId;
    } catch { /* ignore */ }

    return null;
}

function formatNaverApiData(data: Record<string, unknown>): string {
    // API 응답값을 LLM에 전달할 텍스트로 변환
    const parts: string[] = [];

    const extract = (obj: Record<string, unknown>, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined || value === '') continue;
            if (typeof value === 'object' && !Array.isArray(value)) {
                extract(value as Record<string, unknown>, `${prefix}${key}.`);
            } else if (Array.isArray(value)) {
                if (value.length > 0) {
                    parts.push(`${prefix}${key}: ${value.join(', ')}`);
                }
            } else {
                parts.push(`${prefix}${key}: ${value}`);
            }
        }
    };

    // result나 body 안에 실제 데이터가 있는 경우 대응
    const body = (data.result || data.body || data.articleDetail || data) as Record<string, unknown>;
    extract(typeof body === 'object' ? body : data);

    return parts.join('\n').substring(0, MAX_TEXT_LENGTH);
}

// ─── 직방 API 스크래퍼 ──────────────────────────────────────────
async function scrapeZigbangApi(url: string): Promise<ScrapeResult> {
    const itemId = extractZigbangItemId(url);
    if (!itemId) {
        return { success: false, error: '직방 매물 ID를 URL에서 추출할 수 없습니다.' };
    }

    console.log('[scraper:zigbang] itemId:', itemId);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        // 직방 내부 API
        const apiUrl = `https://apis.zigbang.com/v2/items/${itemId}`;
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const text = formatGenericApiData(data);
            if (text.length >= 50) {
                return { success: true, text };
            }
        }

        // API 실패 시 모바일 페이지 시도
        return await tryFetchWithCheerio(`https://m.zigbang.com/items/${itemId}`);
    } finally {
        clearTimeout(timeout);
    }
}

function extractZigbangItemId(url: string): string | null {
    const patterns = [
        /items?\/(\d+)/,
        /room\/(\d+)/,
        /detail\/(\d+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// ─── 다방 API 스크래퍼 ──────────────────────────────────────────
async function scrapeDabangApi(url: string): Promise<ScrapeResult> {
    const roomId = extractDabangRoomId(url);
    if (!roomId) {
        return { success: false, error: '다방 매물 ID를 URL에서 추출할 수 없습니다.' };
    }

    console.log('[scraper:dabang] roomId:', roomId);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        // 다방 내부 API
        const apiUrl = `https://www.dabangapp.com/api/3/room/${roomId}`;
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                'Accept': 'application/json',
                'Referer': 'https://www.dabangapp.com/',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const text = formatGenericApiData(data);
            if (text.length >= 50) {
                return { success: true, text };
            }
        }

        // API 실패 시 모바일 페이지 시도
        return await tryFetchWithCheerio(`https://m.dabangapp.com/room/${roomId}`);
    } finally {
        clearTimeout(timeout);
    }
}

function extractDabangRoomId(url: string): string | null {
    const patterns = [
        /room\/([a-zA-Z0-9]+)/,
        /detail\/([a-zA-Z0-9]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// ─── 범용 API 데이터 포맷팅 ─────────────────────────────────────
function formatGenericApiData(data: Record<string, unknown>): string {
    const parts: string[] = [];
    const seen = new Set<string>();

    const extract = (obj: unknown, depth = 0): void => {
        if (depth > 5 || !obj || typeof obj !== 'object') return;

        const entries = Array.isArray(obj)
            ? obj.map((v, i) => [String(i), v] as [string, unknown])
            : Object.entries(obj as Record<string, unknown>);

        for (const [key, value] of entries) {
            // 불필요한 키 스킵
            if (['id', '_id', 'seq', 'createdAt', 'updatedAt', 'version', 'images', 'image'].includes(key)) continue;

            if (value === null || value === undefined || value === '') continue;

            if (typeof value === 'object' && !Array.isArray(value)) {
                extract(value, depth + 1);
            } else if (Array.isArray(value)) {
                const str = value.filter(v => typeof v === 'string' || typeof v === 'number').join(', ');
                if (str && !seen.has(str)) {
                    seen.add(str);
                    parts.push(`${key}: ${str}`);
                }
            } else {
                const str = `${key}: ${value}`;
                if (!seen.has(str)) {
                    seen.add(str);
                    parts.push(str);
                }
            }
        }
    };

    // API 응답 구조를 자동 탐색
    const body = (data as Record<string, unknown>).result
        || (data as Record<string, unknown>).data
        || (data as Record<string, unknown>).room
        || (data as Record<string, unknown>).item
        || data;
    extract(body);

    return parts.join('\n').substring(0, MAX_TEXT_LENGTH);
}

// ─── 2단계: fetch + Cheerio 스크래핑 ──────────────────────────────
async function tryFetchWithCheerio(url: string): Promise<ScrapeResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                'Accept-Language': 'ko-KR,ko;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}: 페이지를 불러올 수 없습니다.` };
        }

        const html = await response.text();

        // SSR 데이터 먼저 추출 시도 (Next.js __NEXT_DATA__, Nuxt, 등)
        const ssrText = extractSSRData(html);
        if (ssrText && ssrText.length >= 50) {
            return { success: true, text: ssrText };
        }

        // 일반 HTML 텍스트 추출
        const text = extractRelevantText(html);
        if (!text || text.length < 50) {
            return {
                success: false,
                error: '페이지에서 유의미한 텍스트를 추출하지 못했습니다. JavaScript로만 렌더링되는 페이지일 수 있습니다.',
            };
        }

        return { success: true, text };
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            return { success: false, error: '요청 시간이 초과되었습니다 (9초).' };
        }
        return { success: false, error: (error as Error).message };
    } finally {
        clearTimeout(timeout);
    }
}

// ─── SSR 데이터 추출 (Next.js __NEXT_DATA__ 등) ───────────────
function extractSSRData(html: string): string | null {
    try {
        // __NEXT_DATA__ (Next.js SSR)
        const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
            const data = JSON.parse(nextDataMatch[1]);
            const pageProps = data?.props?.pageProps;
            if (pageProps) {
                return formatGenericApiData(pageProps as Record<string, unknown>);
            }
        }

        // window.__PRELOADED_STATE__ (Redux SSR)
        const preloadedMatch = html.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/);
        if (preloadedMatch) {
            const data = JSON.parse(preloadedMatch[1]);
            return formatGenericApiData(data as Record<string, unknown>);
        }

        // window.__INITIAL_STATE__ (일반 SSR)
        const initialMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/);
        if (initialMatch) {
            const data = JSON.parse(initialMatch[1]);
            return formatGenericApiData(data as Record<string, unknown>);
        }

        // Nuxt.js (__NUXT__)
        const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*({[\s\S]*?});?\s*<\/script>/);
        if (nuxtMatch) {
            const data = JSON.parse(nuxtMatch[1]);
            return formatGenericApiData(data as Record<string, unknown>);
        }
    } catch {
        // JSON 파싱 실패 — 무시하고 계속
    }

    return null;
}

// ─── HTML 텍스트 추출 (Cheerio) ─────────────────────────────────
function extractRelevantText(html: string): string {
    const $ = cheerio.load(html);

    // 불필요한 요소 제거
    $('script, style, noscript, img, svg, iframe, nav, header, footer, .ad, .banner, .popup, link, meta').remove();

    // 우선순위 셀렉터: 부동산 관련 텍스트가 있을 수 있는 영역
    const prioritySelectors = [
        '[class*="detail"]',
        '[class*="info"]',
        '[class*="desc"]',
        '[class*="content"]',
        '[class*="article"]',
        '[class*="property"]',
        '[class*="building"]',
        '[class*="price"]',
        '[class*="area"]',
        '[class*="trade"]',
        '[class*="summary"]',
        'main',
        'article',
        '.blind',
        'table',
        'dl',
        'p',
        'li',
        'span',
        'dd',
        'dt',
    ];

    let combinedText = '';

    for (const selector of prioritySelectors) {
        $(selector).each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 10) {
                combinedText += text + '\n';
            }
        });
        if (combinedText.length > MAX_TEXT_LENGTH) break;
    }

    // 우선 셀렉터로 충분히 못 가져왔으면 body 전체 사용
    if (combinedText.length < 200) {
        combinedText = $('body').text();
    }

    return combinedText
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, MAX_TEXT_LENGTH);
}

// ─── URL 변환 유틸리티 ──────────────────────────────────────────
function convertToMobileUrl(url: string): string {
    return url
        .replace('land.naver.com', 'm.land.naver.com')
        .replace('new.land.naver.com', 'm.land.naver.com')
        .replace('fin.land.naver.com', 'm.land.naver.com')
        .replace('www.zigbang.com', 'm.zigbang.com')
        .replace('www.dabang.com', 'm.dabangapp.com')
        .replace('www.dabangapp.com', 'm.dabangapp.com');
}
