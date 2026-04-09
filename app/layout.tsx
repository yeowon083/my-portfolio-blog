import "./globals.css";
import Navbar from "../components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://my-portfolio-blog.vercel.app"),
  title: {
    default: "YEOWON'S PORTFOLIO",
    template: "%s | YEOWON'S PORTFOLIO",
  },
  description:
    "이여원의 프로젝트, 블로그 기록, AI 서비스 기획과 모바일 앱 개발 포트폴리오",
  verification: {
    google: "trEajzB8WnRPqf_QHB2NxtRw5WAyk6qKwR3l9sfmGA4",
  },
    openGraph: {
    title: "YEOWON'S PORTFOLIO",
    description:
      "이여원의 프로젝트, 블로그 기록, AI 서비스 기획과 모바일 앱 개발 포트폴리오",
    siteName: "YEOWON'S PORTFOLIO",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YEOWON'S PORTFOLIO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YEOWON'S PORTFOLIO",
    description:
      "이여원의 프로젝트, 블로그 기록, AI 서비스 기획과 모바일 앱 개발 포트폴리오",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}