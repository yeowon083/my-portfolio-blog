import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Yeowon Portfolio Blog",
  description: "AI와 데이터를 활용한 프로젝트와 기술 기록",
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