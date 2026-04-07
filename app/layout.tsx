import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { headers } from "next/headers";

export const metadata = {
  title: "Yeowon Portfolio Blog",
  description: "AI와 데이터를 활용한 프로젝트와 기술 기록",
};

function NavLink({
  href,
  children,
  currentPath,
}: {
  href: string;
  children: ReactNode;
  currentPath: string;
}) {
  const isActive =
    href === "/"
      ? currentPath === "/"
      : currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`transition ${
        isActive
          ? "text-black font-semibold"
          : "text-gray-600 hover:text-black"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headersList = await headers();
  const currentPath =
    headersList.get("x-pathname") ||
    headersList.get("x-invoke-path") ||
    "/";

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

            <div className="flex items-center gap-6 text-sm font-medium">
              <NavLink href="/" currentPath={currentPath}>
                Home
              </NavLink>
              <NavLink href="/about" currentPath={currentPath}>
                About
              </NavLink>
              <NavLink href="/projects" currentPath={currentPath}>
                Projects
              </NavLink>
              <NavLink href="/blog" currentPath={currentPath}>
                Blog
              </NavLink>
            </div>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}