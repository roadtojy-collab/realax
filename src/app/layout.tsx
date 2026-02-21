import type { Metadata } from 'next';
import './globals.css';
import ApiKeySettings from '@/components/ApiKeySettings';

export const metadata: Metadata = {
  title: 'RealAX - 부동산 AI 콘텐츠 자동화',
  description: 'URL 하나로 매물 설명, 블로그 홍보글, 문자 문구를 자동 생성하는 공인중개사 전용 AI 도구',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <header style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(to right, rgba(13,17,23,0.95), rgba(22,27,34,0.95))',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 800, color: 'white',
                }}>R</div>
                <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
                  Real<span style={{ color: 'var(--accent-blue)' }}>AX</span>
                </span>
                <span style={{
                  marginLeft: '8px', fontSize: '11px', fontWeight: 600,
                  background: 'linear-gradient(135deg, #4f8ef7, #22d3a0)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.05em',
                }}>AI 매물 자동화</span>
                <ApiKeySettings />
              </div>
            </div>
          </header>
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

