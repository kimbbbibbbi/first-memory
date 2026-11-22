import type { Metadata, Viewport } from "next";
import { Gowun_Batang, Gowun_Dodum } from "next/font/google";
import "./globals.css";

// 제목·질문·기억 본문용 글꼴
const gowunBatang = Gowun_Batang({
  variable: "--font-gowun-batang",
  weight: ["400", "700"],
  subsets: ["latin"],
});

// 안내·버튼·태그용 글꼴
const gowunDodum = Gowun_Dodum({
  variable: "--font-gowun-dodum",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "첫 기억", template: "%s | 첫 기억" },
  description: "가장 첫 기억부터, 질문을 따라 어린 시절을 기록해요.",
};

export const viewport: Viewport = {
  themeColor: "#faf6ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${gowunBatang.variable} ${gowunDodum.variable} antialiased`}
    >
      <body className="bg-paper font-dodum text-ink">
        {/* 휴대폰 화면처럼 가운데 정렬한 폭 430px 이하 틀 */}
        <div className="relative mx-auto flex min-h-dvh max-w-app flex-col bg-paper">
          {children}
        </div>
      </body>
    </html>
  );
}
