import { NextResponse } from 'next/server';
import { generatePropertyContent, type ParsedProperty } from '@/lib/llm';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { propertyData, saveToDb = false } = body as {
            propertyData: ParsedProperty;
            saveToDb?: boolean;
        };

        if (!propertyData) {
            return NextResponse.json({ error: '매물 데이터가 필요합니다.' }, { status: 400 });
        }

        // 3종 콘텐츠 생성
        const content = await generatePropertyContent(propertyData);

        // DB 저장 옵션

        if (saveToDb) {
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
        }


        return NextResponse.json({
            success: true,
            content,
        });
    } catch (error) {
        console.error('[/api/generate] Error:', error);
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        const isKeyMissing = message === 'API_KEY_MISSING';
        return NextResponse.json(
            {
                error: isKeyMissing
                    ? 'API 키가 설정되지 않았습니다. 우측 상단의 "API 키" 버튼에서 키를 입력해주세요.'
                    : '콘텐츠 생성 중 오류가 발생했습니다.',
            },
            { status: isKeyMissing ? 400 : 500 }
        );
    }
}
