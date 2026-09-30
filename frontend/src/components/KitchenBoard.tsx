"use client";

import { useCallback, useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";
import { apiBase, formatCents } from "@/lib/money";
import { NEXT_STATUS, STATUS_LABEL, type OrderStatus, type OrderView } from "@/lib/types";

const ACTION: Record<OrderStatus, string> = {
  RECEIVED: "Received",
  PREPARING: "Start preparing",
  READY: "Mark ready",
  COMPLETED: "Complete",
  CANCELLED: "Cancel",
};

const PAGE_SIZE = 20;

export function KitchenBoard() {
  const [orders, setOrders] = useState<OrderView[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase()}/orders?page=${page}`, { headers: authHeaders(), cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        setError(response.status === 401 ? "Log in as kitchen staff to open this board." : "This board is for kitchen staff.");
        return false;
      }
      if (!response.ok) {
        setError("The kitchen list could not be loaded.");
        return false;
      }
      const body = (await response.json()) as { orders: OrderView[]; total: number };
      if (body.orders.length === 0 && page > 1) {
        setPage(page - 1);
        return true;
      }
      setOrders(body.orders);
      setTotal(body.total);
      setError(null);
      return true;
    } catch {
      setError("The API is not reachable.");
      return false;
    }
  }, [page]);

  useEffect(() => {
    let stop = false;
    let timer = 0;
    async function tick() {
      const ok = await load();
      if (stop || !ok) {
        return;
      }
      timer = window.setTimeout(() => void tick(), 5000);
    }
    void tick();
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [load]);

  async function move(order: OrderView, status: OrderStatus) {
    const response = await fetch(`${apiBase()}/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setError(typeof body.message === "string" ? body.message : "That status change was refused.");
      return;
    }
    await load();
  }

  if (orders === null && !error) {
    return <p className="hint">Loading tickets…</p>;
  }

  return (
    <div className="kitchen">
      {error ? <p className="notice">{error}</p> : null}
      <p className="hint">In-progress tickets only. This board refreshes every five seconds.</p>
      {orders && orders.length === 0 ? <p>No orders in progress.</p> : null}
      <ul className="tickets">
        {orders?.map((order) => (
          <li key={order.id} className={`ticket-card status-${order.status.toLowerCase()}`}>
            <header>
              <h2>{order.customerName}</h2>
              <p>{STATUS_LABEL[order.status]}</p>
            </header>
            <p>
              {order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"} · {order.phone}
            </p>
            {order.address ? <p>{order.address}</p> : null}
            <ul>
              {order.pizzas.map((pizza) => (
                <li key={pizza.id}>
                  {pizza.label} · {formatCents(pizza.lineTotalCents)}
                </li>
              ))}
            </ul>
            <p className="total">{formatCents(order.totalCents)}</p>
            <div className="choices">
              {NEXT_STATUS[order.status].map((status) => (
                <button key={status} type="button" onClick={() => void move(order, status)}>
                  {ACTION[status]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {total > PAGE_SIZE ? (
        <div className="choices">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Newer
          </button>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>
            Older
          </button>
        </div>
      ) : null}
    </div>
  );
}
