import { NextResponse } from 'next/server';
import { parsePropertyFromImage } from '@/lib/llm';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image || typeof image !== 'string') {
            return NextResponse.json(
                { success: false, error: '이미지 데이터가 필요합니다.', userMessage: '이미지를 붙여넣기 하거나 파일을 선택해주세요.' },
                { status: 400 }
            );
        }

        // base64 크기 제한 (약 10MB)
        if (image.length > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: '이미지가 너무 큽니다.', userMessage: '이미지 크기가 너무 큽니다. 작은 스크린샷으로 다시 시도해주세요.' },
                { status: 413 }
            );
        }

        // GPT-4o-mini Vision으로 파싱
        const parsedData = await parsePropertyFromImage(image);

        return NextResponse.json({
            success: true,
            data: parsedData,
        });
    } catch (error) {
        console.error('[/api/parse-image] Error:', error);

        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        const isKeyMissing = message === 'API_KEY_MISSING';
        const isQuotaError = message.includes('insufficient_quota') || message.includes('quota');

        return NextResponse.json(
            {
                success: false,
                error: message,
                userMessage: isKeyMissing
                    ? 'API 키가 설정되지 않았습니다. 우측 상단의 "API 키" 버튼에서 키를 입력해주세요.'
                    : isQuotaError
                        ? 'OpenAI API 크레딧이 소진되었습니다. 새 API 키를 입력해주세요.'
                        : `이미지 분석 중 오류가 발생했습니다: ${message}`,
            },
            { status: 500 }
        );
    }
}
