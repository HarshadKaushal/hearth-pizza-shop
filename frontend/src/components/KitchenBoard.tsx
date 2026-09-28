"use client";

import { useCallback, useEffect, useState } from "react";
import { apiBase, formatCents } from "@/lib/money";
import { NEXT_STATUS, STATUS_LABEL, type OrderStatus, type OrderView } from "@/lib/types";

const ACTION: Record<OrderStatus, string> = {
  RECEIVED: "Received",
  PREPARING: "Start preparing",
  READY: "Mark ready",
  COMPLETED: "Complete",
  CANCELLED: "Cancel",
};

export function KitchenBoard() {
  const [orders, setOrders] = useState<OrderView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase()}/orders`, { cache: "no-store" });
      if (!response.ok) {
        setError("The kitchen list could not be loaded.");
        return;
      }
      const body = (await response.json()) as { orders: OrderView[] };
      setOrders(body.orders);
      setError(null);
    } catch {
      setError("The API is not reachable.");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [load]);

  async function move(order: OrderView, status: OrderStatus) {
    const response = await fetch(`${apiBase()}/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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
      <p className="hint">This board refreshes every five seconds. It does not use a live socket.</p>
      {orders && orders.length === 0 ? <p>No orders yet.</p> : null}
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
    </div>
  );
}
