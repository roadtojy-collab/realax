import { NextResponse } from 'next/server';
import { scrapePropertyPage } from '@/lib/scraper';
import { parsePropertyFromText } from '@/lib/llm';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL이 필요합니다.', userMessage: 'URL을 입력해주세요.' },
                { status: 400 }
            );
        }

        // URL 형식 기본 검증
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: '올바른 URL 형식이 아닙니다.', userMessage: '올바른 URL 형식으로 입력해주세요. (예: https://...)' },
                { status: 400 }
            );
        }

        // 1. 스크래핑 실행
        const scrapeResult = await scrapePropertyPage(url);

        if (!scrapeResult.success || !scrapeResult.text) {
            // 구체적인 실패 원인을 사용자에게 전달
            const userMessage = scrapeResult.error
                || '매물 정보를 자동으로 가져올 수 없습니다. 수동으로 입력해주세요.';

            return NextResponse.json(
                {
                    success: false,
                    error: '스크래핑 실패',
                    userMessage,
                    details: scrapeResult.error,
                },
                { status: 422 }
            );
        }

        // 2. LLM 파싱 실행
        const parsedData = await parsePropertyFromText(scrapeResult.text);

        return NextResponse.json({
            success: true,
            data: parsedData,
            sourceTextLength: scrapeResult.text.length,
        });
    } catch (error) {
        console.error('[/api/scrape] Error:', error);

        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        const isKeyMissing = message === 'API_KEY_MISSING';
        const isQuotaError = message.includes('insufficient_quota') || message.includes('quota') || message.includes('exceeded');

        return NextResponse.json(
            {
                success: false,
                error: '처리 중 오류가 발생했습니다.',
                userMessage: isKeyMissing
                    ? 'API 키가 설정되지 않았습니다. 우측 상단의 "API 키" 버튼에서 키를 입력해주세요.'
                    : isQuotaError
                        ? 'OpenAI API 크레딧이 소진되었습니다. 새 API 키를 입력해주세요.'
                        : `서버 처리 중 오류가 발생했습니다. 스크린샷 붙여넣기 또는 수동 입력을 시도해주세요.`,
            },
            { status: 500 }
        );
    }
}
