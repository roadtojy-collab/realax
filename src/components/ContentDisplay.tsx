'use client';

import { useState } from 'react';

interface ContentResult {
    description: string;
    blogContent: string;
    smsContent: string;
}

interface ContentDisplayProps {
    content: ContentResult;
}

type Tab = 'description' | 'blog' | 'sms';

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'description', label: '매물 설명', icon: '🏠' },
    { key: 'blog', label: '블로그/카페', icon: '📝' },
    { key: 'sms', label: '문자/단톡', icon: '💬' },
];

export default function ContentDisplay({ content }: ContentDisplayProps) {
    const [activeTab, setActiveTab] = useState<Tab>('description');
    const [copied, setCopied] = useState<Tab | null>(null);

    const getContent = (tab: Tab): string => {
        if (tab === 'description') return content.description;
        if (tab === 'blog') return content.blogContent;
        return content.smsContent;
    };

    const handleCopy = async (tab: Tab) => {
        await navigator.clipboard.writeText(getContent(tab));
        setCopied(tab);
        setTimeout(() => setCopied(null), 2000);
    };

    const activeContent = getContent(activeTab);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(34,211,160,0.05) 0%, rgba(79,142,247,0.05) 100%)',
            border: '1px solid rgba(34,211,160,0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
        }}>
            <div style={{
                padding: '20px 24px 0', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-green)', flex: 1 }}>
                    3종 콘텐츠 생성 완료
                </span>
                <div style={{ display: 'flex', gap: '2px', background: 'rgba(13,17,23,0.6)', borderRadius: '10px', padding: '4px' }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '7px 14px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
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

            <div style={{ padding: '20px 24px' }}>
                <div style={{
                    background: 'rgba(13,17,23,0.8)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px',
                    whiteSpace: 'pre-line',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: 'var(--text-primary)',
                    minHeight: '120px',
                }}>
                    {activeContent}
                </div>
                <button
                    onClick={() => handleCopy(activeTab)}
                    style={{
                        marginTop: '12px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: copied === activeTab ? 'rgba(34,211,160,0.1)' : 'rgba(79,142,247,0.1)',
                        border: `1px solid ${copied === activeTab ? 'rgba(34,211,160,0.3)' : 'rgba(79,142,247,0.3)'}`,
                        borderRadius: '8px',
                        padding: '9px 16px',
                        color: copied === activeTab ? 'var(--accent-green)' : 'var(--accent-blue)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginLeft: 'auto',
                    }}
                >
                    {copied === activeTab ? '✓ 복사됨!' : '📋 복사하기'}
                </button>
            </div>
        </div>
    );
}
