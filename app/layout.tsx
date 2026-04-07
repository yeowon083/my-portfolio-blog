import "./globals.css";
import Link from "next/link";

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
        <header className="border-b border-gray-200">
          <nav className="max-w-4xl mx-auto flex items-center justify-between px-2 py-5">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight transition hover:opacity-70"
            >
              Yeowon
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="transition hover:text-black">
                Home
              </Link>
              <Link href="/about" className="transition hover:text-black">
                About
              </Link>
              <Link href="/projects" className="transition hover:text-black">
                Projects
              </Link>
              <Link href="/blog" className="transition hover:text-black">
                Blog
              </Link>
            </div>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}