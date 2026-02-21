import OpenAI from 'openai';
import { getStoredApiKey } from '@/app/api/settings/route';

function getOpenAI(): OpenAI {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
        throw new Error('API_KEY_MISSING');
    }
    return new OpenAI({ apiKey });
}

export interface ParsedProperty {
    title: string | null;
    deal_type: 'SALE' | 'JEONSE' | 'MONTHLY' | null;
    property_type: 'APARTMENT' | 'OFFICETEL' | 'VILLA' | 'ONEROOM' | 'TWOROOM' | 'SHOP' | null;
    region: string | null;
    area_m2: number | null;
    floor: string | null;
    deposit: number | null;       // 보증금 (만원)
    monthly_rent: number | null;  // 월세 (만원)
    price: number | null;         // 매매가 (만원)
    options: string[];
    highlights: string | null;
}

const SYSTEM_PROMPT = `너는 부동산 매물 정보 추출 전문 AI다.
주어진 텍스트에서 부동산 매물 정보를 추출하여 오직 JSON 형식으로만 응답해라.
JSON을 감싸는 마크다운(\`\`\`json 등)이나 어떠한 부연 설명도 절대 출력하지 마라.
텍스트에서 찾을 수 없는 정보는 절대 지어내지 말고 null (옵션의 경우 빈 배열 [])로 처리해라.

[필수 출력 포맷]
{
  "title": "매물 제목 또는 짧은 요약 (없으면 null)",
  "deal_type": "SALE(매매), JEONSE(전세), MONTHLY(월세) 중 정확히 하나 (없으면 null)",
  "property_type": "APARTMENT(아파트), OFFICETEL(오피스텔), VILLA(빌라/주택), ONEROOM(원룸), TWOROOM(투룸), SHOP(상가) 중 정확히 하나 (없으면 null)",
  "region": "동/읍/면 단위까지의 주소 (없으면 null)",
  "area_m2": 면적 숫자만 (단위 없이, 없으면 null),
  "floor": "층수 문자열 (예: 3층, 고층, 반지하, 없으면 null)",
  "deposit": 보증금 만원 단위 숫자 (없으면 null),
  "monthly_rent": 월세 만원 단위 숫자 (없으면 null),
  "price": 매매가 만원 단위 숫자 (없으면 null),
  "options": ["추출된 옵션 배열, 예: 엘리베이터, 주차, 에어컨, 풀옵션 등"],
  "highlights": "가장 강조되는 장점 1~2개 요약 짧은 문자열 (없으면 null)"
}`;

/**
 * 스크래핑된 텍스트를 LLM으로 파싱하여 정형화된 매물 데이터를 반환합니다.
 * JSON 모드를 강제하여 파싱 에러를 원천 차단합니다.
 */
export async function parsePropertyFromText(text: string): Promise<ParsedProperty> {
    const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini', // 비용 효율적 모델 (gpt-4-turbo 대비 약 20x 저렴)
        response_format: { type: 'json_object' }, // JSON 모드 강제
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: `다음 텍스트에서 매물 데이터를 추출해:\n\n${text}`,
            },
        ],
        temperature: 0.1, // 낮은 온도 = 일관성, 환각 감소
        max_tokens: 500,  // 출력 토큰 제한
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('LLM 응답이 비어있습니다.');

    const parsed = JSON.parse(content) as ParsedProperty;

    // options 기본값 보장
    if (!Array.isArray(parsed.options)) {
        parsed.options = [];
    }

    return parsed;
}

/**
 * 이미지(스크린샷)에서 부동산 매물 정보를 추출합니다.
 * GPT-4o-mini의 Vision 기능을 사용합니다.
 */
export async function parsePropertyFromImage(base64Image: string): Promise<ParsedProperty> {
    // data:image/... prefix가 있으면 제거
    const base64Data = base64Image.includes(',')
        ? base64Image.split(',')[1]
        : base64Image;

    const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: '이 이미지는 부동산 매물 페이지의 스크린샷입니다. 이미지에서 보이는 매물 정보를 추출해주세요.',
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/png;base64,${base64Data}`,
                            detail: 'high',
                        },
                    },
                ],
            },
        ],
        temperature: 0.1,
        max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('LLM 응답이 비어있습니다.');

    const parsed = JSON.parse(content) as ParsedProperty;

    if (!Array.isArray(parsed.options)) {
        parsed.options = [];
    }

    return parsed;
}

/**
 * 파싱된 매물 데이터를 기반으로 3종 콘텐츠를 생성합니다.
 */
export interface GeneratedContent {
    description: string;   // 매물 상세 설명
    blogContent: string;   // 블로그/카페 홍보글
    smsContent: string;    // 문자/단톡 문구
}

export async function generatePropertyContent(property: ParsedProperty): Promise<GeneratedContent> {
    const dealTypeMap: Record<string, string> = {
        SALE: '매매',
        JEONSE: '전세',
        MONTHLY: '월세',
    };
    const propertyTypeMap: Record<string, string> = {
        APARTMENT: '아파트',
        OFFICETEL: '오피스텔',
        VILLA: '빌라/주택',
        ONEROOM: '원룸',
        TWOROOM: '투룸',
        SHOP: '상가',
    };

    const summary = `
물건 유형: ${propertyTypeMap[property.property_type || ''] || '미확인'}
거래 형태: ${dealTypeMap[property.deal_type || ''] || '미확인'}
위치: ${property.region || '미확인'}
면적: ${property.area_m2 ? `${property.area_m2}m²` : '미확인'}
층수: ${property.floor || '미확인'}
옵션: ${property.options.length > 0 ? property.options.join(', ') : '없음'}
핵심 포인트: ${property.highlights || '없음'}
  `.trim();

    const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `너는 숙련된 공인중개사 마케터다. 주어진 매물 정보를 바탕으로 3가지 마케팅 콘텐츠를 생성해라.
반드시 아래 JSON 형식으로만 응답해라. 마크다운이나 설명은 절대 붙이지 마라.
{
  "description": "매물 상세 설명 (전문적이고 신뢰감 있는 문체, 150-200자)",
  "blogContent": "블로그/카페용 홍보글 (친근하고 감성적인 문체, 300-400자, 해시태그 3개 포함)",
  "smsContent": "문자/카카오톡용 짧은 홍보 문구 (핵심만 담은 80자 이내)"
}`,
            },
            {
                role: 'user',
                content: `다음 매물 정보로 콘텐츠를 생성해:\n\n${summary}`,
            },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,  // 적당한 창의성
        max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('콘텐츠 생성에 실패했습니다.');

    return JSON.parse(content) as GeneratedContent;
}
