import { Metadata } from "next"

export const metadata: Metadata = {
  title: "みつもりくん - AI・システム開発相見積もりプラットフォーム | 最適な開発会社を無料マッチング",
  description:
    "AIが最適な開発会社を自動マッチング。複数の見積もりを比較し、最適な開発パートナーを見つけましょう。完全無料・最短1分で登録。",
  keywords: [
    "相見積もり",
    "開発会社",
    "AI開発",
    "システム開発",
    "見積もり比較",
    "開発パートナー",
    "マッチング",
    "無料",
  ],
  openGraph: {
    title: "みつもりくん - AI・システム開発相見積もりプラットフォーム",
    description: "AIが最適な開発会社を自動マッチング。完全無料で複数の見積もりを比較できます。",
    url: "https://mitsumorikun.com/lp",
    siteName: "みつもりくん",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "みつもりくん - AI開発会社マッチングプラットフォーム",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "みつもりくん - AI・システム開発相見積もりプラットフォーム",
    description: "AIが最適な開発会社を自動マッチング。完全無料で複数の見積もりを比較できます。",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://mitsumorikun.com/lp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function LPLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "みつもりくん",
            url: "https://mitsumorikun.com",
            description: "AI・システム開発に特化した相見積もりプラットフォーム",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://mitsumorikun.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "みつもりくん",
            url: "https://mitsumorikun.com",
            logo: "https://mitsumorikun.com/logo.png",
            description: "AI・システム開発に特化した相見積もりプラットフォーム",
            contactPoint: {
              "@type": "ContactPoint",
              email: "support@mitsumorikun.com",
              contactType: "Customer Service",
              availableLanguage: ["Japanese"],
            },
            sameAs: [
              "https://twitter.com/mitsumorikun",
              "https://facebook.com/mitsumorikun",
              "https://linkedin.com/company/mitsumorikun",
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
