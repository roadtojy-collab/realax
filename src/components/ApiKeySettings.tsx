'use client';

import { useState, useEffect, useRef } from 'react';

export default function ApiKeySettings() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<{
        hasKey: boolean;
        maskedKey: string | null;
        source: 'user' | 'env' | 'none';
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // 상태 조회
    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setStatus(data);
        } catch {
            // 무시
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // 모달 바깥 클릭 시 닫기
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setMessage(null);
                setApiKey('');
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setMessage(null);
                setApiKey('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen]);

    const handleSave = async () => {
        if (!apiKey.trim()) return;
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKey.trim() }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setMessage({ type: 'error', text: data.error || '저장 실패' });
                return;
            }

            setMessage({ type: 'success', text: 'API 키가 저장되었습니다!' });
            setApiKey('');
            await fetchStatus();
        } catch {
            setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            await fetch('/api/settings', { method: 'DELETE' });
            setMessage({ type: 'success', text: '사용자 API 키가 제거되었습니다.' });
            await fetchStatus();
        } catch {
            setMessage({ type: 'error', text: '제거 실패' });
        } finally {
            setIsLoading(false);
        }
    };

    const statusColor = status?.hasKey
        ? '#22d3a0'
        : '#f87171';

    const statusLabel = !status
        ? ''
        : status.source === 'user'
            ? '사용자 키 사용중'
            : status.source === 'env'
                ? '환경변수 키 사용중'
                : '키 미설정';

    return (
        <>
            {/* 설정 버튼 (헤더에 표시) */}
            <button
                onClick={() => setIsOpen(true)}
                title="API 키 설정"
                style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    marginLeft: 'auto',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-blue)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }}
            >
                {/* Key 아이콘 */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    API 키
                    <span style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: statusColor,
                        display: 'inline-block',
                    }} />
                </span>
            </button>

            {/* 모달 오버레이 */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    animation: 'fadeIn 0.2s ease',
                }}>
                    <div
                        ref={modalRef}
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '28px',
                            width: '100%',
                            maxWidth: '440px',
                            margin: '0 16px',
                            animation: 'slideUp 0.25s ease',
                        }}
                    >
                        {/* 헤더 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                                🔑 API 키 설정
                            </h2>
                            <button
                                onClick={() => { setIsOpen(false); setMessage(null); setApiKey(''); }}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                                    fontSize: '20px', cursor: 'pointer', padding: '4px',
                                }}
                            >×</button>
                        </div>

                        {/* 현재 상태 */}
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            marginBottom: '16px',
                            fontSize: '13px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>상태</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor, fontWeight: 600 }}>
                                    <span style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: statusColor, display: 'inline-block',
                                    }} />
                                    {statusLabel}
                                </span>
                            </div>
                            {status?.maskedKey && (
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>키</span>
                                    <code style={{
                                        fontSize: '12px', color: 'var(--text-primary)',
                                        background: 'rgba(79,142,247,0.1)',
                                        padding: '2px 8px', borderRadius: '4px',
                                    }}>{status.maskedKey}</code>
                                </div>
                            )}
                        </div>

                        {/* 입력 */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{
                                display: 'block', fontSize: '12px', fontWeight: 600,
                                color: 'var(--text-secondary)', marginBottom: '6px',
                            }}>
                                새 OpenAI API 키
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* 메시지 */}
                        {message && (
                            <div style={{
                                fontSize: '13px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                background: message.type === 'success'
                                    ? 'rgba(34,211,160,0.1)'
                                    : 'rgba(248,113,113,0.1)',
                                color: message.type === 'success' ? '#22d3a0' : '#f87171',
                                border: `1px solid ${message.type === 'success' ? 'rgba(34,211,160,0.3)' : 'rgba(248,113,113,0.3)'}`,
                            }}>
                                {message.type === 'success' ? '✓' : '⚠'} {message.text}
                            </div>
                        )}

                        {/* 버튼 */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleSave}
                                disabled={!apiKey.trim() || isLoading}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    fontSize: '13px',
                                    opacity: !apiKey.trim() || isLoading ? 0.5 : 1,
                                }}
                            >
                                {isLoading ? '저장 중...' : '저장'}
                            </button>
                            {status?.source === 'user' && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    style={{
                                        padding: '10px 16px',
                                        fontSize: '13px',
                                        background: 'none',
                                        border: '1px solid rgba(248,113,113,0.3)',
                                        borderRadius: '10px',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'none';
                                    }}
                                >
                                    제거
                                </button>
                            )}
                        </div>

                        {/* 안내문 */}
                        <p style={{
                            margin: '16px 0 0', fontSize: '11px', color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                        }}>
                            💡 API 키는 서버 메모리에만 저장되며, 서버 재시작 시 초기화됩니다.
                            <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent-blue)', marginLeft: '4px' }}
                            >
                                키 발급받기 →
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
