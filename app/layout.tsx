import "./globals.css";
import Navbar from "../components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://yeowon.dev"),
  title: {
    default: "YEOWON'S PORTFOLIO",
    template: "%s | YEOWON'S PORTFOLIO",
  },
  description:
    "이여원의 포트폴리오",
  verification: {
    google: "5QZM0-YAk_y6z2DvJxmyqBOWObiKFOY9_vyE5EBQGyc",
  },
    openGraph: {
    title: "YEOWON'S PORTFOLIO",
    description:
      "이여원의 포트폴리오",
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
      "이여원의 포트폴리오",
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
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        <script dangerouslySetInnerHTML={{ __html: 'history.scrollRestoration="manual"' }} />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
