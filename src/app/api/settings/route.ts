import { NextResponse } from 'next/server';

// 서버 메모리에 API 키를 저장 (프로세스 단위)
let storedApiKey: string | null = null;

export function getStoredApiKey(): string | null {
    return storedApiKey || process.env.OPENAI_API_KEY || null;
}

export async function GET() {
    const key = getStoredApiKey();
    return NextResponse.json({
        hasKey: !!key,
        // 키의 앞 8자와 뒷 4자만 보여줌 (보안)
        maskedKey: key ? maskKey(key) : null,
        source: storedApiKey ? 'user' : (process.env.OPENAI_API_KEY ? 'env' : 'none'),
    });
}

export async function POST(req: Request) {
    try {
        const { apiKey } = await req.json();

        if (!apiKey || typeof apiKey !== 'string') {
            return NextResponse.json(
                { success: false, error: 'API 키가 필요합니다.' },
                { status: 400 }
            );
        }

        const trimmed = apiKey.trim();

        // 기본 형식 검증
        if (!trimmed.startsWith('sk-')) {
            return NextResponse.json(
                { success: false, error: 'API 키는 "sk-"로 시작해야 합니다.' },
                { status: 400 }
            );
        }

        storedApiKey = trimmed;

        return NextResponse.json({
            success: true,
            maskedKey: maskKey(trimmed),
        });
    } catch {
        return NextResponse.json(
            { success: false, error: '설정 저장 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    storedApiKey = null;
    return NextResponse.json({
        success: true,
        hasKey: !!process.env.OPENAI_API_KEY,
        source: process.env.OPENAI_API_KEY ? 'env' : 'none',
    });
}

function maskKey(key: string): string {
    if (key.length <= 12) return '****';
    return key.slice(0, 8) + '••••' + key.slice(-4);
}
