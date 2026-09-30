"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authHeaders, clearToken, getToken, type SessionUser } from "@/lib/auth";
import { apiBase } from "@/lib/money";

const LINKS = [
  { href: "/", label: "Menu" },
  { href: "/build", label: "Build" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<SessionUser["role"] | null>(null);

  useEffect(() => {
    const token = getToken();
    setSignedIn(Boolean(token));
    if (!token) {
      setRole(null);
      return;
    }
    void fetch(`${apiBase()}/auth/me`, { headers: authHeaders(), cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setRole(null);
          return;
        }
        const body = (await response.json()) as { user?: SessionUser };
        setRole(body.user?.role ?? null);
      })
      .catch(() => setRole(null));
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
        {role === "KITCHEN" ? (
          <Link href="/kitchen" aria-current={pathname === "/kitchen" ? "page" : undefined}>
            Kitchen
          </Link>
        ) : null}
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
