"use client";

import { createIngredientSchema, updateIngredientSchema } from "@hearth/shared";
import { FormEvent, useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";
import { apiBase } from "@/lib/money";
import { CATEGORY_LABEL, CATEGORY_ORDER, type Ingredient, type IngredientCategory } from "@/lib/types";

const EMPTY = {
  name: "",
  description: "",
  category: "TOPPING" as IngredientCategory,
  priceCents: "",
};

export function KitchenMenu() {
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    const response = await fetch(`${apiBase()}/ingredients`, { cache: "no-store" });
    if (!response.ok) {
      setError("The menu could not be loaded.");
      return;
    }
    const body = (await response.json()) as { ingredients: Ingredient[] };
    setIngredients(body.ingredients);
    setPrices(Object.fromEntries(body.ingredients.map((item) => [item.id, String(item.priceCents)])));
  }

  useEffect(() => {
    void load().catch(() => setError("The API is not reachable."));
  }, []);

  async function addIngredient(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = createIngredientSchema.safeParse({
      name: draft.name,
      description: draft.description,
      category: draft.category,
      priceCents: Number(draft.priceCents),
      available: true,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "That ingredient was not accepted.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`${apiBase()}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(parsed.data),
      });
      const body = (await response.json()) as { message?: string | string[] };
      if (!response.ok) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        setError(message || "That ingredient was not accepted.");
        return;
      }
      setDraft(EMPTY);
      await load();
    } catch {
      setError("The API is not reachable.");
    } finally {
      setPending(false);
    }
  }

  async function save(item: Ingredient, patch: { priceCents?: number; available?: boolean }) {
    setError(null);
    const parsed = updateIngredientSchema.safeParse(patch);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "That change was not accepted.");
      return;
    }
    const response = await fetch(`${apiBase()}/ingredients/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(parsed.data),
    });
    const body = (await response.json()) as { message?: string | string[] };
    if (!response.ok) {
      const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
      setError(message || "That change was not accepted.");
      return;
    }
    await load();
  }

  return (
    <section className="menu-editor">
      <h2>The board</h2>
      <p className="hint">Prices are integer cents. A new item uses one of the four categories already on the menu.</p>
      {error ? <p className="notice">{error}</p> : null}
      <form className="menu-add" onSubmit={(event) => void addIngredient(event)}>
        <label className="field">
          Name
          <input value={draft.name} maxLength={80} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <label className="field">
          Description
          <input
            value={draft.description}
            maxLength={200}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </label>
        <label className="field">
          Category
          <select
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as IngredientCategory })}
          >
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Price in cents
          <input
            inputMode="numeric"
            value={draft.priceCents}
            onChange={(event) => setDraft({ ...draft, priceCents: event.target.value })}
          />
        </label>
        <button className="primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add ingredient"}
        </button>
      </form>
      <ul className="menu-rows">
        {ingredients?.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{CATEGORY_LABEL[item.category]}</span>
            </div>
            <label className="field">
              Cents
              <input
                inputMode="numeric"
                value={prices[item.id] ?? ""}
                onChange={(event) => setPrices({ ...prices, [item.id]: event.target.value })}
              />
            </label>
            <button
              type="button"
              onClick={() => void save(item, { priceCents: Number(prices[item.id]) })}
            >
              Save price
            </button>
            <button type="button" onClick={() => void save(item, { available: !item.available })}>
              {item.available ? "Mark off the board" : "Mark available"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
