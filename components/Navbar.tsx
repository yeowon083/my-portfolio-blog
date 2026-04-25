"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-neutral-950 transition-all duration-200 hover:text-neutral-600"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md border-[1.5px] border-neutral-950 transition-all duration-200 group-hover:border-neutral-600">
            <span className="h-1.5 w-1.5 rounded-sm bg-neutral-950 transition-all duration-200 group-hover:bg-neutral-600" />
          </span>
          Yeowon
        </Link>

        <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-neutral-100 bg-neutral-50 p-1 text-xs font-medium shadow-[0_1px_4px_rgba(0,0,0,0.05)] sm:text-sm">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 transition-all duration-200 sm:px-4 ${
                  isActive
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
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
