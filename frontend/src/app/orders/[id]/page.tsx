import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCents } from "@/lib/money";
import { fetchOrder } from "@/lib/orders";
import { SIZE_LABEL } from "@/lib/pricing";
import { STATUS_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) {
    notFound();
  }

  const placed = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(order.createdAt));

  return (
    <div className="page narrow">
      <section className="intro">
        <p className="kicker">Order {order.id.slice(-6)}</p>
        <h1>{order.customerName}, the kitchen has it.</h1>
        <p className="lede">
          {STATUS_LABEL[order.status]} · {order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"} ·{" "}
          {placed}
        </p>
      </section>
      <article className="receipt">
        {order.pizzas.map((pizza) => (
          <section key={pizza.id}>
            <header>
              <h2>{pizza.label}</h2>
              <p>
                {SIZE_LABEL[pizza.size]} base {formatCents(pizza.baseCents)}
              </p>
            </header>
            <ul>
              {pizza.ingredients.map((item) => (
                <li key={`${pizza.id}-${item.name}`}>
                  <span>{item.name}</span>
                  <span>{formatCents(item.priceCents)}</span>
                </li>
              ))}
            </ul>
            <p className="line-total">{formatCents(pizza.lineTotalCents)}</p>
          </section>
        ))}
        <p className="total">{formatCents(order.totalCents)}</p>
        <p>
          {order.phone}
          {order.address ? ` · ${order.address}` : ""}
        </p>
        {order.notes ? <p className="hint">Note: {order.notes}</p> : null}
        <Link href="/build">Build another</Link>
      </article>
    </div>
  );
}
