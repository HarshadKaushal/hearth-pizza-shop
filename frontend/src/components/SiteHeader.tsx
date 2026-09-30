"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/auth";

const LINKS = [
  { href: "/", label: "Menu" },
  { href: "/build", label: "Build" },
  { href: "/kitchen", label: "Kitchen" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(getToken()));
  }, [pathname]);

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
        {signedIn ? (
          <>
            <Link href="/account" aria-current={pathname === "/account" ? "page" : undefined}>
              My orders
            </Link>
            <button
              type="button"
              className="nav-button"
              onClick={() => {
                clearToken();
                setSignedIn(false);
                router.push("/");
                router.refresh();
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>
              Log in
            </Link>
            <Link href="/signup" aria-current={pathname === "/signup" ? "page" : undefined}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
