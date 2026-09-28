"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Menu" },
  { href: "/build", label: "Build" },
  { href: "/kitchen", label: "Kitchen" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        <span className="coal" aria-hidden="true" />
        Hearth
      </Link>
      <p className="tagline">Neighborhood pizza, priced in the open.</p>
      <nav>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
