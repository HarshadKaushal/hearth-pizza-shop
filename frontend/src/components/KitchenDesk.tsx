"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authHeaders, getToken, type SessionUser } from "@/lib/auth";
import { apiBase } from "@/lib/money";
import { KitchenBoard } from "./KitchenBoard";
import { KitchenMenu } from "./KitchenMenu";

export function KitchenDesk() {
  const [role, setRole] = useState<SessionUser["role"] | "loading" | "missing">("loading");

  useEffect(() => {
    if (!getToken()) {
      setRole("missing");
      return;
    }
    void fetch(`${apiBase()}/auth/me`, { headers: authHeaders(), cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setRole("missing");
          return;
        }
        const body = (await response.json()) as { user?: SessionUser };
        setRole(body.user?.role ?? "missing");
      })
      .catch(() => setRole("missing"));
  }, []);

  if (role === "loading") {
    return <p className="hint">Loading the kitchen…</p>;
  }

  if (role !== "KITCHEN") {
    return (
      <p className="notice">
        This board is for kitchen staff. <Link href="/login?next=/kitchen">Log in</Link> with the kitchen account.
      </p>
    );
  }

  return (
    <>
      <KitchenBoard />
      <KitchenMenu />
    </>
  );
}
