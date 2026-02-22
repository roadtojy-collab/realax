import { NextResponse } from 'next/server';
import { generatePropertyContent, type ParsedProperty } from '@/lib/llm';
import { getPrisma } from '@/lib/db';

export async function POST(req: Request) {
    let propertyData: ParsedProperty | null = null;
    let content: any = null;

    try {
        const body = await req.json();
        propertyData = body.propertyData;
        const saveToDb = body.saveToDb || false;

        if (!propertyData) {
            return NextResponse.json({ error: '매물 데이터가 필요합니다.' }, { status: 400 });
        }

        // 3종 콘텐츠 생성
        content = await generatePropertyContent(propertyData);

        // DB 저장 옵션 (Vercel 등 SQLite 미지원 환경에서는 자동 스킵)
        if (saveToDb) {
            try {
                const prisma = getPrisma();
                await prisma.property.create({
                    data: {
                        title: propertyData.title || '제목 없음',
                        dealType: propertyData.deal_type || 'SALE',
                        propertyType: propertyData.property_type || 'APARTMENT',
                        region: propertyData.region,
                        areaM2: propertyData.area_m2,
                        floor: propertyData.floor,
                        deposit: propertyData.deposit,
                        monthlyRent: propertyData.monthly_rent,
                        price: propertyData.price,
                        options: JSON.stringify(propertyData.options),
                        highlights: propertyData.highlights,
                        description: content.description,
                        blogContent: content.blogContent,
                        smsContent: content.smsContent,
                        isAiFilled: true,
                    },
                });
            } catch (dbError) {
                // DB 저장 실패는 무시하고 콘텐츠는 항상 반환 (Vercel SQLite 미지원 대응)
                console.warn('DB 저장 스킵 (SQLite 미지원 환경):', (dbError as Error).message);
            }
        }

        return NextResponse.json({
            success: true,
            content,
        });
    } catch (error) {
        console.error('[/api/generate] Error:', error);

        // 만약 에러가 났더라도 컨텐츠가 이미 생성되었다면 (LLM 성공 후 DB 저장 실패 시)
        // 에러를 무시하고 컨텐츠는 그대로 반환하여 사용자 경험 보호
        if (content && propertyData) {
            console.warn('DB 저장에 실패했으나 컨텐츠는 생성되었습니다. 임시 파일에 저장합니다.');
            try {
                const fs = require('fs');
                const path = require('path');
                const fallbackDir = path.join(process.cwd(), 'backups');
                if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir);
                const filename = `content-${Date.now()}.json`;
                fs.writeFileSync(path.join(fallbackDir, filename), JSON.stringify({ propertyData, content }, null, 2));
            } catch (e) {
                console.error('Fallback saving failed:', e);
            }

            return NextResponse.json({
                success: true,
                content,
                warning: '데이터베이스 연결 문제로 내역이 저장되지 않았습니다. (생성된 내용은 확인 가능합니다.)'
            });
        }

        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        const isKeyMissing = message === 'API_KEY_MISSING';
        return NextResponse.json(
            {
                error: isKeyMissing
                    ? 'API 키가 설정되지 않았습니다. 우측 상단의 "API 키" 버튼에서 키를 입력해주세요.'
                    : `콘텐츠 생성 중 오류가 발생했습니다: ${message}`,
                rawError: error
            },
            { status: isKeyMissing ? 400 : 500 }
        );
    }
}
