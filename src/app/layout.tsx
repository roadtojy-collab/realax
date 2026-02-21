import type { Metadata } from 'next';
import './globals.css';


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
            background: 'var(--bg-secondary)',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}>
            <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--accent-blue)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 800, color: 'white',
              }}>R</div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
                Real<span style={{ color: 'var(--accent-blue)' }}>AX</span>
              </span>
              <span style={{
                marginLeft: '8px', fontSize: '11px', fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
              }}>AI 매물 자동화</span>
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

