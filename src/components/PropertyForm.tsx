'use client';

import { useState } from 'react';
import { ParsedProperty } from '@/lib/llm';
import { DEAL_TYPE_MAP, PROPERTY_TYPE_MAP, formatPrice } from '@/lib/utils';

interface PropertyFormProps {
    initialData?: ParsedProperty | null;
    isAiFilled?: boolean;
    onGenerate: (data: PropertyFormData) => void;
    isGenerating: boolean;
}

export interface PropertyFormData {
    title: string;
    deal_type: string;
    property_type: string;
    region: string;
    area_m2: string;
    floor: string;
    deposit: string;
    monthly_rent: string;
    price: string;
    options: string;
    highlights: string;
}

const fieldStyle = (isAi: boolean) => ({
    width: '100%',
    background: isAi ? 'var(--ai-fill-bg)' : 'rgba(13,17,23,0.8)',
    border: `1px solid ${isAi ? 'var(--ai-fill-border)' : 'var(--border-color)'}`,
    borderRadius: '10px',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
});

function Field({
    label, name, type = 'text', value, onChange, isAi, placeholder = '', hint
}: {
    label: string; name: string; type?: string; value: string;
    onChange: (v: string) => void; isAi: boolean; placeholder?: string; hint?: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {label}
                {isAi && (
                    <span style={{ fontSize: '10px', background: 'rgba(79,142,247,0.15)', color: 'var(--accent-blue)', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                        AI 자동입력
                    </span>
                )}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={isAi ? 'ai-filled' : ''}
                style={fieldStyle(isAi)}
                onFocus={(e) => { if (!isAi) e.target.style.borderColor = 'var(--accent-blue)'; }}
                onBlur={(e) => { if (!isAi) e.target.style.borderColor = 'var(--border-color)'; }}
            />
            {hint && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{hint}</span>}
        </div>
    );
}

function SelectField({
    label, name, value, onChange, isAi, options
}: {
    label: string; name: string; value: string;
    onChange: (v: string) => void; isAi: boolean;
    options: { value: string; label: string }[];
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {label}
                {isAi && (
                    <span style={{ fontSize: '10px', background: 'rgba(79,142,247,0.15)', color: 'var(--accent-blue)', padding: '1px 6px', borderRadius: '4px' }}>
                        AI 자동입력
                    </span>
                )}
            </label>
            <select
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={isAi ? 'ai-filled' : ''}
                style={{ ...fieldStyle(isAi), appearance: 'none', cursor: 'pointer' }}
            >
                <option value="">선택하세요</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

export default function PropertyForm({ initialData, isAiFilled = false, onGenerate, isGenerating }: PropertyFormProps) {
    const [form, setForm] = useState<PropertyFormData>({
        title: initialData?.title || '',
        deal_type: initialData?.deal_type || '',
        property_type: initialData?.property_type || '',
        region: initialData?.region || '',
        area_m2: initialData?.area_m2?.toString() || '',
        floor: initialData?.floor || '',
        deposit: initialData?.deposit?.toString() || '',
        monthly_rent: initialData?.monthly_rent?.toString() || '',
        price: initialData?.price?.toString() || '',
        options: initialData?.options?.join(', ') || '',
        highlights: initialData?.highlights || '',
    });

    const set = (field: keyof PropertyFormData) => (val: string) =>
        setForm((prev) => ({ ...prev, [field]: val }));

    const ai = (field: keyof PropertyFormData) =>
        isAiFilled && !!initialData && initialData[field as keyof ParsedProperty] !== null &&
        initialData[field as keyof ParsedProperty] !== undefined &&
        form[field] !== '';

    return (
        <div>
            {isAiFilled && (
                <div style={{
                    background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.2)',
                    borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
                    display: 'flex', gap: '10px', alignItems: 'center',
                }}>
                    <span style={{ fontSize: '16px' }}>✨</span>
                    <span style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 500 }}>
                        AI가 매물 정보를 자동으로 채웠습니다. 파란색 필드를 검토하고 수정하세요.
                    </span>
                </div>
            )}

            <div style={{ display: 'grid', gap: '18px' }}>
                <Field label="매물 제목" name="title" value={form.title} onChange={set('title')}
                    isAi={ai('title')} placeholder="예: 역세권 신축 오피스텔 풀옵션" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <SelectField
                        label="거래 형태" name="deal_type" value={form.deal_type} onChange={set('deal_type')}
                        isAi={ai('deal_type')}
                        options={Object.entries(DEAL_TYPE_MAP).map(([v, l]) => ({ value: v, label: l }))}
                    />
                    <SelectField
                        label="매물 유형" name="property_type" value={form.property_type} onChange={set('property_type')}
                        isAi={ai('property_type')}
                        options={Object.entries(PROPERTY_TYPE_MAP).map(([v, l]) => ({ value: v, label: l }))}
                    />
                </div>

                <Field label="주소" name="region" value={form.region} onChange={set('region')}
                    isAi={ai('region')} placeholder="예: 서울시 강남구 역삼동" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <Field label="면적 (m²)" name="area_m2" type="number" value={form.area_m2}
                        onChange={set('area_m2')} isAi={ai('area_m2')} placeholder="예: 33" />
                    <Field label="층수" name="floor" value={form.floor} onChange={set('floor')}
                        isAi={ai('floor')} placeholder="예: 3층, 고층, 반지하" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <Field label="보증금 (만원)" name="deposit" type="number" value={form.deposit}
                        onChange={set('deposit')} isAi={ai('deposit')} placeholder="예: 1000"
                        hint={form.deposit ? formatPrice(Number(form.deposit)) : ''} />
                    <Field label="월세 (만원)" name="monthly_rent" type="number" value={form.monthly_rent}
                        onChange={set('monthly_rent')} isAi={ai('monthly_rent')} placeholder="예: 80" />
                    <Field label="매매가 (만원)" name="price" type="number" value={form.price}
                        onChange={set('price')} isAi={ai('price')} placeholder="예: 50000"
                        hint={form.price ? formatPrice(Number(form.price)) : ''} />
                </div>

                <Field label="옵션 (쉼표로 구분)" name="options" value={form.options}
                    onChange={set('options')} isAi={ai('options')} placeholder="예: 에어컨, 세탁기, 냉장고, 풀옵션" />

                <Field label="핵심 장점" name="highlights" value={form.highlights}
                    onChange={set('highlights')} isAi={ai('highlights')} placeholder="예: 역 도보 2분, 신축 풀옵션" />
            </div>

            {/* 면책 조항 */}
            {isAiFilled && (
                <div style={{
                    marginTop: '20px', padding: '12px 16px',
                    background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.25)',
                    borderRadius: '10px',
                }}>
                    <p style={{ fontSize: '12px', color: '#fbbf24', margin: 0, textAlign: 'center' }}>
                        ⚠️ AI가 불러온 정보입니다. 등록 전 반드시 정확성을 확인해 주세요.
                    </p>
                </div>
            )}

            <button
                onClick={() => onGenerate(form)}
                disabled={isGenerating || !form.deal_type || !form.property_type}
                className="btn-primary"
                style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: '16px', borderRadius: '12px' }}
            >
                {isGenerating ? '🤖 콘텐츠 생성 중...' : '🚀 콘텐츠 3종 자동 생성'}
            </button>
        </div>
    );
}
