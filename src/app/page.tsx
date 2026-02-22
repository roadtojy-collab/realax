'use client';

import { useState } from 'react';
import UrlImporter from '@/components/UrlImporter';
import PropertyForm, { PropertyFormData } from '@/components/PropertyForm';
import ContentDisplay from '@/components/ContentDisplay';
import { ParsedProperty } from '@/lib/llm';

type Step = 'INPUT' | 'VERIFY' | 'GENERATING' | 'DONE';

export default function Home() {
  const [step, setStep] = useState<Step>('INPUT');
  const [isManualMode, setIsManualMode] = useState(false);
  const [aiData, setAiData] = useState<ParsedProperty | null>(null);
  const [isAiFilled, setIsAiFilled] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    description: string; blogContent: string; smsContent: string; checklist: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleDataLoaded = (data: ParsedProperty) => {
    setAiData(data);
    setIsAiFilled(true);
    setStep('VERIFY');
  };

  const handleManualMode = () => {
    setStep('VERIFY');
    setIsAiFilled(false);
    setAiData(null);
  };

  const handleGenerate = async (formData: PropertyFormData) => {
    setStep('GENERATING');
    setGenerateError(null);

    const options = formData.options
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const propertyPayload: ParsedProperty = {
      title: formData.title || null,
      deal_type: (formData.deal_type as ParsedProperty['deal_type']) || null,
      property_type: (formData.property_type as ParsedProperty['property_type']) || null,
      region: formData.region || null,
      area_m2: formData.area_m2 ? Number(formData.area_m2) : null,
      floor: formData.floor || null,
      deposit: formData.deposit ? Number(formData.deposit) : null,
      monthly_rent: formData.monthly_rent ? Number(formData.monthly_rent) : null,
      price: formData.price ? Number(formData.price) : null,
      options,
      highlights: formData.highlights || null,
    };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyData: propertyPayload, saveToDb: true }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || '콘텐츠 생성에 실패했습니다.');
      }

      setGeneratedContent(result.content);
      setStep('DONE');
    } catch (e) {
      setGenerateError((e as Error).message);
      setStep('VERIFY'); // Fallback to verify step on error
    } finally {
      // Step already handled above
    }
  };

  const handleReset = () => {
    setStep('INPUT');
    setIsAiFilled(false);
    setAiData(null);
    setGeneratedContent(null);
    setGenerateError(null);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* 히어로 섹션 */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
          매물 URL 하나로 <br />
          <span style={{ color: 'var(--accent-blue)' }}>
            3종 콘텐츠를 자동 생성
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
          매물 설명 · 블로그/카페 홍보글 · 문자/단톡 문구<br />
          10분이 걸리던 작업을 2분으로 줄여드립니다
        </p>
      </div>

      {/* 메인 카드 */}
      {(step === 'INPUT' || step === 'VERIFY' || step === 'GENERATING') && (
        <div className="glass-card" style={{ padding: '32px' }}>

          {/* 1단계: URL 입력 또는 수동 시작 */}
          {step === 'INPUT' && (
            <>
              <UrlImporter
                onDataLoaded={handleDataLoaded}
                onManualMode={handleManualMode}
              />
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <button
                  onClick={handleManualMode}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  직접 입력하기
                </button>
              </div>
            </>
          )}

          {/* 2단계: 정보 확인 및 수동 보정 */}
          {(step === 'VERIFY' || step === 'GENERATING') && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                  onClick={() => setStep('INPUT')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ← 처음으로 돌아가기
                </button>
                <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  {isAiFilled ? '✨ 정보 분석 완료 (검토 후 생성 버튼을 눌러주세요)' : '✍️ 정보를 직접 입력해 주세요'}
                </div>
              </div>
              <PropertyForm
                initialData={aiData}
                isAiFilled={isAiFilled}
                onGenerate={handleGenerate}
                isGenerating={step === 'GENERATING'}
              />
              {generateError && (
                <p style={{ color: '#f87171', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                  ⚠️ {generateError}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* 결과 표시 */}
      {step === 'DONE' && generatedContent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ContentDisplay content={generatedContent} />
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '12px',
              color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            + 새 매물 등록하기
          </button>
        </div>
      )}
    </div>
  );
}
