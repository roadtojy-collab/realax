'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentResult {
    description: string;
    blogContent: string;
    smsContent: string;
    checklist: string;
}

interface ContentDisplayProps {
    content: ContentResult;
}

type Tab = 'description' | 'blog' | 'sms' | 'checklist';

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'description', label: '매물 설명', icon: '🏠' },
    { key: 'blog', label: '블로그/카페', icon: '📝' },
    { key: 'sms', label: '문자/단톡', icon: '💬' },
    { key: 'checklist', label: '검수 체크리스트', icon: '✅' },
];

/**
 * LLM이 줄바꿈 없이 반환한 마크다운을 복원
 * - 실제 \n이 없는 경우 마크다운 블록 요소 앞에 줄바꿈 삽입
 */
function fixMarkdownNewlines(content: string): string {
    return content
        .replace(/\\n/g, '\n')                              // 리터럴 \n → 실제 줄바꿈
        .replace(/([^\n])\s*(#{1,6} )/g, '$1\n\n$2')       // 헤딩 앞 줄바꿈
        .replace(/([^\n])\s*(---+)\s*/g, '$1\n\n$2\n\n')   // HR 앞뒤 줄바꿈
        .replace(/([^\n])\s*(> )/g, '$1\n\n$2')            // 블록쿼트 앞 줄바꿈
        .replace(/([^\n])(\| .+\|)/g, '$1\n$2')            // 표 앞 줄바꿈
        .replace(/\n{3,}/g, '\n\n');                        // 3개 이상 줄바꿈 → 2개로
}

/** SMS "---" 기준 3개 버전 분리 */
function parseSmsVersions(raw: string): { label: string; content: string }[] {
    const parts = raw
        .replace(/\\n/g, '\n')
        .split(/\n?---\n?/)
        .map((s) => s.trim())
        .filter(Boolean);
    const labels = ['초단문 (단톡/문자 1줄)', '표준 (2~4줄)', '상세 (5~9줄)'];
    return parts.map((content, i) => ({ label: labels[i] ?? `버전 ${i + 1}`, content }));
}

function BlogRenderer({ content }: { content: string }) {
    const processed = fixMarkdownNewlines(content);
    return (
        <div className="md-blog">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed}</ReactMarkdown>
        </div>
    );
}

function SmsRenderer({ content }: { content: string }) {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const versions = parseSmsVersions(content);

    const handleCopy = async (text: string, i: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIdx(i);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    if (versions.length <= 1) {
        return <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.8', margin: 0, fontFamily: 'inherit', color: 'var(--text-primary)' }}>{content.replace(/\\n/g, '\n')}</pre>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {versions.map((v, i) => (
                <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)',
                            background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.2)',
                            borderRadius: '5px', padding: '2px 8px',
                        }}>
                            {v.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{v.content.length}자</span>
                            <button onClick={() => handleCopy(v.content, i)} style={{
                                fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                background: copiedIdx === i ? 'rgba(34,211,160,0.1)' : 'rgba(79,142,247,0.1)',
                                border: `1px solid ${copiedIdx === i ? 'rgba(34,211,160,0.3)' : 'rgba(79,142,247,0.3)'}`,
                                borderRadius: '5px', padding: '3px 9px',
                                color: copiedIdx === i ? 'var(--accent-green)' : 'var(--accent-blue)',
                                transition: 'all 0.2s',
                            }}>
                                {copiedIdx === i ? '✓ 복사됨' : '복사'}
                            </button>
                        </div>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.8', margin: 0, fontFamily: 'inherit', color: 'var(--text-primary)' }}>
                        {v.content}
                    </pre>
                </div>
            ))}
        </div>
    );
}

function PlainRenderer({ content }: { content: string }) {
    return (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.9', margin: 0, fontFamily: 'inherit', color: 'var(--text-primary)' }}>
            {content.replace(/\\n/g, '\n')}
        </pre>
    );
}

export default function ContentDisplay({ content }: ContentDisplayProps) {
    const [activeTab, setActiveTab] = useState<Tab>('description');
    const [copied, setCopied] = useState<Tab | 'all' | null>(null);

    const getContent = (tab: Tab): string => {
        if (tab === 'description') return content.description;
        if (tab === 'blog') return content.blogContent;
        if (tab === 'sms') return content.smsContent;
        return content.checklist;
    };

    const handleCopy = async (tab: Tab) => {
        await navigator.clipboard.writeText(getContent(tab));
        setCopied(tab);
        setTimeout(() => setCopied(null), 2000);
    };

    const activeContentRaw = getContent(activeTab);

    const renderContent = () => {
        if (activeTab === 'blog') return <BlogRenderer content={activeContentRaw} />;
        if (activeTab === 'sms') return <SmsRenderer content={activeContentRaw} />;
        return <PlainRenderer content={activeContentRaw} />;
    };

    return (
        <>
            <style>{`
                /* 블로그 마크다운 스타일 */
                .md-blog { font-size: 13px; line-height: 1.85; color: var(--text-primary); }

                .md-blog h1 {
                    font-size: 17px; font-weight: 800; color: #e2e8f0;
                    margin: 0 0 14px; padding-bottom: 10px;
                    border-bottom: 2px solid rgba(79,142,247,0.3);
                    line-height: 1.4;
                }
                .md-blog h2 {
                    font-size: 14px; font-weight: 700; color: var(--accent-green);
                    margin: 22px 0 8px; display: flex; align-items: center; gap: 4px;
                }
                .md-blog h3 {
                    font-size: 13px; font-weight: 700; color: #cbd5e1;
                    margin: 14px 0 5px;
                }
                .md-blog p { margin: 0 0 10px; color: #94a3b8; }
                .md-blog ul, .md-blog ol { padding-left: 18px; margin: 0 0 10px; }
                .md-blog li { margin: 3px 0; color: #94a3b8; }
                .md-blog strong { color: #e2e8f0; font-weight: 700; }
                .md-blog em { color: #64748b; font-style: italic; }

                .md-blog blockquote {
                    border-left: 3px solid var(--accent-blue);
                    padding: 8px 14px;
                    margin: 12px 0;
                    background: rgba(79,142,247,0.07);
                    border-radius: 0 8px 8px 0;
                    color: #94a3b8;
                    font-style: italic;
                }
                .md-blog blockquote strong { color: #cbd5e1; }
                .md-blog blockquote em { color: #94a3b8; font-style: normal; }

                .md-blog hr {
                    border: none;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    margin: 18px 0;
                }

                /* 표 */
                .md-blog table {
                    border-collapse: collapse; width: 100%;
                    margin: 10px 0 14px; font-size: 12px;
                }
                .md-blog th {
                    background: rgba(79,142,247,0.12);
                    color: var(--accent-blue); font-weight: 700;
                    padding: 7px 12px; text-align: left;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .md-blog td {
                    padding: 6px 12px;
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #94a3b8;
                }
                .md-blog tr:nth-child(even) td { background: rgba(255,255,255,0.02); }

                .md-blog code {
                    background: rgba(255,255,255,0.08);
                    padding: 1px 5px; border-radius: 4px; font-size: 11px;
                }
                .md-blog a { color: var(--accent-blue); text-decoration: underline; }
            `}</style>

            <div style={{
                background: 'linear-gradient(135deg, rgba(34,211,160,0.05) 0%, rgba(79,142,247,0.05) 100%)',
                border: '1px solid rgba(34,211,160,0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
            }}>
                {/* 헤더 + 탭 */}
                <div style={{
                    padding: '16px 20px 0', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <span style={{ fontSize: '16px' }}>✅</span>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-green)', flex: 1 }}>
                        3종 콘텐츠 생성 완료
                    </span>
                    <div style={{ display: 'flex', gap: '2px', background: 'rgba(13,17,23,0.6)', borderRadius: '10px', padding: '3px' }}>
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '6px 12px', borderRadius: '7px', border: 'none',
                                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                    transition: 'all 0.2s',
                                    background: activeTab === tab.key
                                        ? 'linear-gradient(135deg, #4f8ef7, #6c63ff)'
                                        : 'transparent',
                                    color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 콘텐츠 영역 */}
                <div style={{ padding: '16px 20px' }}>
                    <div style={{
                        background: activeTab === 'blog'
                            ? 'rgba(10,12,18,0.95)'
                            : 'rgba(13,17,23,0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: activeTab === 'blog' ? '20px 24px' : '16px',
                        minHeight: '200px',
                        maxHeight: activeTab === 'sms' ? 'none' : '560px',
                        overflowY: activeTab === 'sms' ? 'visible' : 'auto',
                    }}>
                        {renderContent()}
                    </div>

                    {/* 하단 버튼 */}
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={async () => {
                                const allContent = `[매물 설명]\n${content.description}\n\n[블로그/카페 홍보글]\n${content.blogContent}\n\n[문자/단톡 문구]\n${content.smsContent}`;
                                await navigator.clipboard.writeText(allContent);
                                setCopied('all');
                                setTimeout(() => setCopied(null), 2000);
                            }}
                            style={{
                                background: 'none', border: 'none',
                                color: 'var(--text-secondary)', fontSize: '12px',
                                cursor: 'pointer', textDecoration: 'underline',
                            }}
                        >
                            {copied === 'all' ? '전체 복사 완료!' : '전체 내용 복사하기'}
                        </button>
                        {activeTab !== 'sms' && (
                            <button
                                onClick={() => handleCopy(activeTab)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: copied === activeTab ? 'rgba(34,211,160,0.1)' : 'rgba(79,142,247,0.1)',
                                    border: `1px solid ${copied === activeTab ? 'rgba(34,211,160,0.3)' : 'rgba(79,142,247,0.3)'}`,
                                    borderRadius: '8px', padding: '8px 14px',
                                    color: copied === activeTab ? 'var(--accent-green)' : 'var(--accent-blue)',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                {copied === activeTab ? '✓ 복사됨!' : '📋 현재 탭 복사'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
