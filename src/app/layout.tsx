import Script from "next/script";
import type { Metadata } from "next";
import "../index.css";
import { Providers } from "./providers";
import { getSiteUrl } from "@/lib/siteUrl";

// Google Analytics 측정 ID (GA4)
const GA_MEASUREMENT_ID = "G-16MJ0HBL9T";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  verification: {
    google: "psGY9_z1c545PwXz-lc2GdvNpSaLTCm0tL9CBMLrD70",
  },
  other: {
    "naver-site-verification": "412eb64d8bd9e64399aba96ee41663bef0f1de21",
  },
  title: {
    default: "AutoDiet - AI 식단 자동 생성 시스템",
    template: "%s | AutoDiet",
  },
  description:
    "영양사를 위한 스마트 식단 자동생성 시스템. 클릭 몇 번으로 1주~1달 식단을 자동 생성하고, 영양·알레르기·원가를 자동 검증합니다.",
  icons: {
    // 브라우저 탭 아이콘
    // - PC 브라우저는 favicon 캐시가 매우 강해서 파일명(또는 쿼리)을 바꿔야 갱신이 잘 됩니다.
    // - 사용자가 제공한 ico를 우선 사용하고, 쿼리로 캐시 무효화합니다.
    icon: [{ url: "/final.ico?v=4" }],
    // iOS/카카오 인앱에서 우선 사용되는 경우가 많은 아이콘
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "AutoDiet - AI 식단 자동 생성 시스템",
    description:
      "영양사를 위한 스마트 식단 자동생성 시스템. 클릭 몇 번으로 1주~1달 식단을 자동 생성하고, 영양·알레르기·원가를 자동 검증합니다.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* Google AdSense (확인/연결용) */}
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1380120956106792"
          crossOrigin="anonymous"
        />

        {/* Google tag (gtag.js) - Google Analytics (GA4) */}
        <Script
          async
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script id="ga-gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Google Fonts - Inter + Noto Sans KR */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}










