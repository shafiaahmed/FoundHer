"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  prominent?: boolean;
}

export function NavLink({ href, children, prominent = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-lg px-4 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-100 hover:text-violet-900 hover:ring-1 hover:ring-violet-200 hover:shadow-[0_6px_16px_rgba(109,40,217,0.22)] ${
        isActive
          ? "bg-violet-100 font-semibold text-violet-900 ring-1 ring-violet-200"
          : prominent
            ? "bg-violet-700 text-white shadow-sm hover:bg-violet-800"
            : "text-stone-600"
      }`}
    >
      {children}
    </Link>
  );
}
