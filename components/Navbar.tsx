"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="border-b border-gray-200">
      <nav
        className={`${
          isAdminPage ? "max-w-5xl" : "max-w-3xl"
        } mx-auto flex items-center justify-between px-6 py-5`}
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight transition hover:opacity-70"
      >
          Yeowon
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${
                  isActive
                    ? "text-black font-semibold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
