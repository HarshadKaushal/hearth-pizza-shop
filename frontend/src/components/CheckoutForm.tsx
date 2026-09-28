"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearDraft, readDraft } from "@/lib/draft";
import { apiBase, formatCents } from "@/lib/money";
import { quotePizza, SIZE_LABEL } from "@/lib/pricing";
import type { Ingredient } from "@/lib/types";

type Fulfillment = "PICKUP" | "DELIVERY";

export function CheckoutForm({ ingredients }: { ingredients: Ingredient[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ReturnType<typeof readDraft>>([]);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("PICKUP");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serverQuote, setServerQuote] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setDraft(readDraft());
    setHydrated(true);
  }, []);

  const lines = useMemo(
    () =>
      draft.map((pizza) => {
        const priced = quotePizza(pizza.size, pizza.ingredientIds, ingredients);
        return { pizza, cents: priced.ok ? priced.cents : null };
      }),
    [draft, ingredients],
  );
  const total = lines.reduce((sum, line) => sum + (line.cents ?? 0), 0);
  const ready = lines.length > 0 && lines.every((line) => line.cents !== null);

  async function placeOrder(quotedTotalCents: number) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          fulfillment,
          address: fulfillment === "DELIVERY" ? address.trim() : undefined,
          notes: notes.trim() || undefined,
          quotedTotalCents,
          pizzas: draft.map((pizza) => ({
            size: pizza.size,
            label: pizza.label,
            ingredientIds: pizza.ingredientIds,
          })),
        }),
      });
      const body = (await response.json()) as {
        id?: string;
        message?: string | string[];
        serverTotalCents?: number;
      };
      if (response.status === 409 && typeof body.serverTotalCents === "number") {
        setServerQuote(body.serverTotalCents);
        setError(
          `The menu total is ${formatCents(body.serverTotalCents)}. Place the order again to accept that price.`,
        );
        setPending(false);
        return;
      }
      if (!response.ok || !body.id) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        setError(message || "The order was not accepted.");
        setPending(false);
        return;
      }
      clearDraft();
      router.push(`/orders/${body.id}`);
    } catch {
      setError("The counter could not be reached. Check that the API is running.");
      setPending(false);
    }
  }

  const quotedTotal = serverQuote ?? total;

  if (!hydrated) {
    return <p className="hint">Loading the order…</p>;
  }

  if (draft.length === 0) {
    return (
      <p className="notice">
        There is nothing to send. <Link href="/build">Build a pizza</Link> first.
      </p>
    );
  }

  return (
    <form
      className="checkout"
      onSubmit={(event) => {
        event.preventDefault();
        if (!ready || pending) {
          return;
        }
        void placeOrder(quotedTotal);
      }}
    >
      <section>
        <h2>Your pizzas</h2>
        <ul className="ticket">
          {lines.map(({ pizza, cents }) => (
            <li key={pizza.key}>
              <div>
                <strong>{pizza.label}</strong>
                <span>{SIZE_LABEL[pizza.size]}</span>
              </div>
              <span>{cents === null ? "Unavailable now" : formatCents(cents)}</span>
            </li>
          ))}
        </ul>
        <p className="total">{formatCents(quotedTotal)}</p>
        <p className="hint">This preview is checked again when the order is placed.</p>
      </section>

      <section className="details">
        <label className="field">
          Name
          <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          Phone
          <input required minLength={7} maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <fieldset>
          <legend>How do you want it?</legend>
          <div className="choices">
            <button type="button" aria-pressed={fulfillment === "PICKUP"} onClick={() => setFulfillment("PICKUP")}>
              Pickup
            </button>
            <button type="button" aria-pressed={fulfillment === "DELIVERY"} onClick={() => setFulfillment("DELIVERY")}>
              Delivery
            </button>
          </div>
        </fieldset>
        {fulfillment === "DELIVERY" ? (
          <label className="field">
            Address
            <input
              required
              minLength={5}
              maxLength={200}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </label>
        ) : null}
        <label className="field">
          Note for the kitchen
          <input maxLength={280} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        {error ? <p className="notice">{error}</p> : null}
        <button className="primary" type="submit" disabled={!ready || pending}>
          {pending ? "Sending…" : `Place order · ${formatCents(quotedTotal)}`}
        </button>
      </section>
    </form>
  );
}
