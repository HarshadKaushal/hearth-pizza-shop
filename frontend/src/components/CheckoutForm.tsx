"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { clearDraft, readDraft } from "@/lib/draft";
import { authHeaders, getToken } from "@/lib/auth";
import { apiBase, formatCents } from "@/lib/money";
import { MAX_PIZZAS, quotePizza, SIZE_LABEL } from "@/lib/pricing";
import type { Ingredient } from "@/lib/types";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation";

export function CheckoutForm({ ingredients }: { ingredients: Ingredient[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ReturnType<typeof readDraft>>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverQuote, setServerQuote] = useState<number | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      fulfillment: "PICKUP",
      address: "",
      notes: "",
    },
  });
  const fulfillment = watch("fulfillment");

  useEffect(() => {
    setDraft(readDraft());
    setHydrated(true);
    const token = getToken();
    setSignedIn(Boolean(token));
    if (!token) {
      return;
    }
    void fetch(`${apiBase()}/auth/me`, { headers: authHeaders(), cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }
        const body = (await response.json()) as { user?: { name?: string } };
        if (body.user?.name && !getValues("customerName").trim()) {
          setValue("customerName", body.user.name);
        }
      })
      .catch(() => undefined);
  }, [getValues, setValue]);

  const lines = useMemo(
    () =>
      draft.map((pizza) => {
        const priced = quotePizza(pizza.size, pizza.ingredientIds, ingredients);
        return {
          pizza,
          cents: priced.ok ? priced.cents : null,
          problem: priced.ok ? null : priced.error,
        };
      }),
    [draft, ingredients],
  );
  const total = lines.reduce((sum, line) => sum + (line.cents ?? 0), 0);
  const ready = lines.length > 0 && lines.every((line) => line.cents !== null) && draft.length <= MAX_PIZZAS;
  const quotedTotal = serverQuote ?? total;

  useEffect(() => {
    setServerQuote((current) => (current === null ? current : null));
  }, [total]);

  const onSubmit = handleSubmit(async (values) => {
    if (!ready) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          customerName: values.customerName,
          phone: values.phone,
          fulfillment: values.fulfillment,
          address: values.fulfillment === "DELIVERY" ? values.address : undefined,
          notes: values.notes || undefined,
          quotedTotalCents: quotedTotal,
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
      if (response.status === 401) {
        setError("Log in before placing an order.");
        return;
      }
      if (response.status === 409 && typeof body.serverTotalCents === "number") {
        setServerQuote(body.serverTotalCents);
        setError(
          `The menu total is ${formatCents(body.serverTotalCents)}. Place the order again to accept that price.`,
        );
        return;
      }
      if (!response.ok || !body.id) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        setError(message || "The order was not accepted.");
        return;
      }
      clearDraft();
      router.push(`/orders/${body.id}`);
    } catch {
      setError("The counter could not be reached. Check that the API is running.");
    }
  });

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
    <form className="checkout" noValidate onSubmit={onSubmit}>
      <section>
        <h2>Your pizzas</h2>
        <ul className="ticket">
          {lines.map(({ pizza, cents, problem }) => (
            <li key={pizza.key}>
              <div>
                <strong>{pizza.label}</strong>
                <span>{SIZE_LABEL[pizza.size]}</span>
              </div>
              <span>{cents === null ? problem : formatCents(cents)}</span>
            </li>
          ))}
        </ul>
        <p className="total">{formatCents(quotedTotal)}</p>
        <p className="hint">This preview is checked again when the order is placed.</p>
        {draft.length > MAX_PIZZAS ? (
          <p className="notice">An order can have at most ten pizzas. Remove one before placing it.</p>
        ) : null}
      </section>

      <section className="details">
        <label className="field">
          Name
          <input
            maxLength={80}
            aria-invalid={Boolean(errors.customerName)}
            {...register("customerName")}
          />
          {errors.customerName ? (
            <span className="field-error" role="alert">
              {errors.customerName.message}
            </span>
          ) : null}
        </label>
        <label className="field">
          Phone
          <input
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          {errors.phone ? (
            <span className="field-error" role="alert">
              {errors.phone.message}
            </span>
          ) : null}
        </label>
        <fieldset>
          <legend>How do you want it?</legend>
          <div className="choices">
            <button
              type="button"
              aria-pressed={fulfillment === "PICKUP"}
              onClick={() => setValue("fulfillment", "PICKUP")}
            >
              Pickup
            </button>
            <button
              type="button"
              aria-pressed={fulfillment === "DELIVERY"}
              onClick={() => setValue("fulfillment", "DELIVERY")}
            >
              Delivery
            </button>
          </div>
        </fieldset>
        {fulfillment === "DELIVERY" ? (
          <label className="field">
            Address
            <input maxLength={200} aria-invalid={Boolean(errors.address)} {...register("address")} />
            {errors.address ? (
              <span className="field-error" role="alert">
                {errors.address.message}
              </span>
            ) : null}
          </label>
        ) : null}
        <label className="field">
          Note for the kitchen
          <input maxLength={280} aria-invalid={Boolean(errors.notes)} {...register("notes")} />
          {errors.notes ? (
            <span className="field-error" role="alert">
              {errors.notes.message}
            </span>
          ) : null}
        </label>
        {error ? <p className="notice">{error}</p> : null}
        <button className="primary" type="submit" disabled={!ready || isSubmitting || !signedIn}>
          {isSubmitting ? "Sending…" : signedIn ? `Place order · ${formatCents(quotedTotal)}` : "Log in to place this order"}
        </button>
        {!signedIn ? (
          <p className="hint">
            <Link href="/login?next=/checkout">Log in</Link> or <Link href="/signup?next=/checkout">sign up</Link> so this
            order is saved to your account.
          </p>
        ) : null}
      </section>
    </form>
  );
}
