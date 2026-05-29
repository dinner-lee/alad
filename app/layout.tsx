import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Pretendard Variable (한글 가변 폰트)
// weight 옵션을 지정하지 않으면 WebKit 기반 브라우저에서 굵기가 잘못 렌더링될 수 있어 명시.
const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'ALAD · xAPI 기반 맞춤형 학습 분석 지표 플랫폼',
  description:
    '교사가 재구성한 교육과정에 맞춰 LRS의 xAPI 학습 로그를 의미 있는 학습 지표로 변환해 주는 학습분석 플랫폼 프로토타입.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={pretendard.className}>{children}</body>
    </html>
  );
}
