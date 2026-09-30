"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authHeaders, clearToken, getToken, type SessionUser } from "@/lib/auth";
import { apiBase, formatCents } from "@/lib/money";
import type { OrderView } from "@/lib/types";

export function AccountBoard() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [orders, setOrders] = useState<OrderView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setError("missing");
      return;
    }
    void (async () => {
      try {
        const [meResponse, ordersResponse] = await Promise.all([
          fetch(`${apiBase()}/auth/me`, { headers: authHeaders(), cache: "no-store" }),
          fetch(`${apiBase()}/orders/mine`, { headers: authHeaders(), cache: "no-store" }),
        ]);
        if (meResponse.status === 401 || ordersResponse.status === 401) {
          clearToken();
          setError("missing");
          return;
        }
        if (!meResponse.ok || !ordersResponse.ok) {
          setError("The account could not be loaded.");
          return;
        }
        const me = (await meResponse.json()) as { user: SessionUser };
        const body = (await ordersResponse.json()) as { orders: OrderView[] };
        setUser(me.user);
        setOrders(body.orders);
      } catch {
        setError("The counter could not be reached. Check that the API is running.");
      }
    })();
  }, []);

  if (error === "missing") {
    return (
      <p className="notice">
        <Link href="/login?next=/account">Log in</Link> or <Link href="/signup?next=/account">create an account</Link> to
        see your pizzas.
      </p>
    );
  }
  if (error) {
    return <p className="notice">{error}</p>;
  }
  if (!user || !orders) {
    return <p className="hint">Loading your orders…</p>;
  }

  return (
    <div className="account">
      <p className="hint">
        Signed in as {user.name} ({user.email}). User id {user.id}.
      </p>
      {orders.length === 0 ? (
        <p className="notice">
          No orders yet. <Link href="/build">Build a pizza</Link>.
        </p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id}>
              <div>
                <Link href={`/orders/${order.id}`}>
                  <strong>{order.pizzas.map((pizza) => pizza.label).join(", ")}</strong>
                </Link>
                <span>
                  {order.status} · {formatCents(order.totalCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
