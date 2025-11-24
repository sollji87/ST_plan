import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SERGIO TACCHINI 중장기 사업계획 네비게이터",
  description: "3년간의 사업계획 시뮬레이션 도구",
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
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

