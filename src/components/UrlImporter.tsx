'use client';

import { useState, useRef, useCallback } from 'react';
import { ParsedProperty } from '@/lib/llm';

interface UrlImporterProps {
    onDataLoaded: (data: ParsedProperty) => void;
    onManualMode: () => void;
}

const LOADING_STEPS = [
    '매물 페이지에 접속 중...',
    '핵심 정보를 읽는 중...',
    'AI가 데이터를 분석하는 중...',
    '폼에 자동으로 입력 중...',
];

const IMAGE_LOADING_STEPS = [
    '이미지를 분석하는 중...',
    'AI가 매물 정보를 읽는 중...',
    '데이터를 정리하는 중...',
    '폼에 자동으로 입력 중...',
];

export default function UrlImporter({ onDataLoaded, onManualMode }: UrlImporterProps) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [loadingSteps, setLoadingSteps] = useState(LOADING_STEPS);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pastedImage, setPastedImage] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startLoadingAnimation = (steps: string[]) => {
        setLoadingSteps(steps);
        setLoadingStep(0);
        let step = 0;
        intervalRef.current = setInterval(() => {
            step = (step + 1) % steps.length;
            setLoadingStep(step);
        }, 1800);
    };

    const stopLoadingAnimation = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // ── URL 스크래핑 ──────────────────────────────────
    const handleImport = async () => {
        if (!url.trim()) return;
        setError(null);
        setIsLoading(true);
        setPastedImage(null);
        startLoadingAnimation(LOADING_STEPS);

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim() }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                const msg = result.userMessage || '스크래핑에 실패했습니다.';
                setError(msg);
                stopLoadingAnimation();
                setIsLoading(false);
                return;
            }

            onDataLoaded(result.data);
        } catch {
            setError('서버 연결에 실패했습니다. 네트워크를 확인하거나 수동 입력을 이용해주세요.');
        } finally {
            stopLoadingAnimation();
            setIsLoading(false);
        }
    };

    // ── 이미지 처리 (붙여넣기/드래그/파일선택 공통) ────────
    const processImage = useCallback(async (base64: string) => {
        setPastedImage(base64);
        setError(null);
        setIsLoading(true);
        startLoadingAnimation(IMAGE_LOADING_STEPS);

        try {
            const response = await fetch('/api/parse-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                const msg = result.userMessage || '이미지 분석에 실패했습니다.';
                setError(msg);
                stopLoadingAnimation();
                setIsLoading(false);
                return;
            }

            onDataLoaded(result.data);
        } catch {
            setError('서버 연결에 실패했습니다. 네트워크를 확인해주세요.');
        } finally {
            stopLoadingAnimation();
            setIsLoading(false);
        }
    }, [onDataLoaded]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // ── 클립보드 붙여넣기 (Ctrl+V) ─────────────────────
    const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    const base64 = await fileToBase64(file);
                    processImage(base64);
                }
                return;
            }
        }
    }, [processImage]);

    // ── 드래그 앤 드롭 ──────────────────────────────────
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const base64 = await fileToBase64(file);
                processImage(base64);
            } else {
                setError('이미지 파일만 지원됩니다. (PNG, JPG, WEBP)');
            }
        }
    }, [processImage]);

    // ── 파일 선택 ────────────────────────────────────────
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            processImage(base64);
        }
    }, [processImage]);

    return (
        <div
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                background: isDragging
                    ? 'linear-gradient(135deg, rgba(34,211,160,0.1) 0%, rgba(79,142,247,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(79,142,247,0.05) 0%, rgba(108,99,255,0.05) 100%)',
                border: isDragging
                    ? '2px dashed rgba(34,211,160,0.6)'
                    : '1px solid rgba(79,142,247,0.2)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                transition: 'all 0.2s ease',
            }}
        >
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                    width: '28px', height: '28px',
                    background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                }}>🔗</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                        매물 정보 자동 불러오기
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        URL 입력 또는 매물 페이지 <strong style={{ color: 'var(--accent-blue)' }}>스크린샷을 Ctrl+V</strong>로 붙여넣기
                    </div>
                </div>
            </div>

            {/* URL 입력 */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleImport()}
                    placeholder="https://m.land.naver.com/... 또는 Ctrl+V로 스크린샷 붙여넣기"
                    disabled={isLoading}
                    style={{
                        flex: 1,
                        background: 'rgba(13,17,23,0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-blue)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; }}
                />
                <button
                    onClick={handleImport}
                    disabled={isLoading || !url.trim()}
                    className="btn-primary"
                    style={{ minWidth: '110px', whiteSpace: 'nowrap' }}
                >
                    {isLoading ? '분석 중...' : '✨ 불러오기'}
                </button>
            </div>

            {/* 이미지 드래그/붙여넣기 영역 */}
            {!isLoading && !pastedImage && (
                <div style={{
                    marginTop: '12px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                    <div style={{
                        flex: 1, height: '1px',
                        background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
                    }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>또는</span>
                    <div style={{
                        flex: 1, height: '1px',
                        background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
                    }} />
                </div>
            )}

            {!isLoading && !pastedImage && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        marginTop: '12px',
                        border: '1px dashed rgba(79,142,247,0.3)',
                        borderRadius: '10px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: 'rgba(79,142,247,0.03)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.6)';
                        e.currentTarget.style.background = 'rgba(79,142,247,0.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)';
                        e.currentTarget.style.background = 'rgba(79,142,247,0.03)';
                    }}
                >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        매물 페이지 스크린샷을 여기에 붙여넣기 (Ctrl+V)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        이미지 파일을 드래그하거나 클릭하여 선택할 수도 있습니다
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {/* 붙여넣은 이미지 미리보기 */}
            {pastedImage && !isLoading && (
                <div style={{ marginTop: '12px', position: 'relative' }}>
                    <img
                        src={pastedImage}
                        alt="붙여넣은 스크린샷"
                        style={{
                            maxWidth: '100%', maxHeight: '200px',
                            borderRadius: '8px', border: '1px solid var(--border-color)',
                            objectFit: 'contain',
                        }}
                    />
                    <button
                        onClick={() => setPastedImage(null)}
                        style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: 'rgba(0,0,0,0.7)', border: 'none',
                            borderRadius: '50%', width: '24px', height: '24px',
                            color: 'white', fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >✕</button>
                </div>
            )}

            {/* 로딩 상태 표시 */}
            {isLoading && (
                <div style={{ marginTop: '16px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        color: 'var(--accent-blue)', fontSize: '13px', fontWeight: 500,
                    }}>
                        <div style={{
                            width: '14px', height: '14px',
                            border: '2px solid rgba(79,142,247,0.3)',
                            borderTop: '2px solid var(--accent-blue)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        {loadingSteps[loadingStep]}
                    </div>
                    {/* 스켈레톤 미리보기 */}
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[80, 60, 70, 50].map((w, i) => (
                            <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%`, opacity: 0.6 }} />
                        ))}
                    </div>
                </div>
            )}

            {/* 에러 상태 - Graceful Degradation */}
            {error && !isLoading && (
                <div style={{
                    marginTop: '14px',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#f87171', marginBottom: '6px' }}>
                            {error}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {!pastedImage && (
                                <button
                                    onClick={() => { setError(null); }}
                                    style={{
                                        fontSize: '12px', color: 'var(--accent-blue)', background: 'none',
                                        border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
                                    }}
                                >
                                    📸 스크린샷으로 다시 시도 →
                                </button>
                            )}
                            <button
                                onClick={onManualMode}
                                style={{
                                    fontSize: '12px', color: 'var(--text-secondary)', background: 'none',
                                    border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
                                }}
                            >
                                직접 입력 모드로 전환하기 →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
