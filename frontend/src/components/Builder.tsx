"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readDraft, writeDraft, type DraftPizza } from "@/lib/draft";
import { formatCents } from "@/lib/money";
import {
  MAX_PIZZAS,
  MAX_TOPPINGS,
  quotePizza,
  SIZE_BASE_CENTS,
  SIZE_LABEL,
  type PizzaSize,
} from "@/lib/pricing";
import { CATEGORY_LABEL, CATEGORY_ORDER, type Ingredient, type IngredientCategory } from "@/lib/types";

const SIZES: PizzaSize[] = ["SMALL", "MEDIUM", "LARGE"];

export function Builder({ ingredients }: { ingredients: Ingredient[] }) {
  const [size, setSize] = useState<PizzaSize>("MEDIUM");
  const [label, setLabel] = useState("");
  const [crust, setCrust] = useState<string | null>(null);
  const [sauce, setSauce] = useState<string | null>(null);
  const [cheese, setCheese] = useState<string | null>(null);
  const [toppings, setToppings] = useState<string[]>([]);
  const [draft, setDraft] = useState<DraftPizza[]>([]);

  useEffect(() => {
    setDraft(readDraft());
  }, []);

  const selected = [crust, sauce, cheese, ...toppings].filter((id): id is string => Boolean(id));
  const quote = quotePizza(size, selected, ingredients);
  const draftTotal = draft.reduce((sum, pizza) => {
    const priced = quotePizza(pizza.size, pizza.ingredientIds, ingredients);
    return sum + (priced.ok ? priced.cents : 0);
  }, 0);

  const byCategory = useMemo(() => {
    const grouped = new Map<IngredientCategory, Ingredient[]>();
    for (const category of CATEGORY_ORDER) {
      grouped.set(
        category,
        ingredients.filter((item) => item.category === category),
      );
    }
    return grouped;
  }, [ingredients]);

  function toggleTopping(id: string) {
    setToppings((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= MAX_TOPPINGS) {
        return current;
      }
      return [...current, id];
    });
  }

  function addPizza() {
    if (!quote.ok || draft.length >= MAX_PIZZAS) {
      return;
    }
    const next = [
      ...draft,
      {
        key: crypto.randomUUID(),
        size,
        label: label.trim() || `${SIZE_LABEL[size]} pizza`,
        ingredientIds: selected,
      },
    ];
    setDraft(next);
    writeDraft(next);
    setLabel("");
    setToppings([]);
  }

  function removePizza(key: string) {
    const next = draft.filter((pizza) => pizza.key !== key);
    setDraft(next);
    writeDraft(next);
  }

  return (
    <div className="builder">
      <section className="builder-main">
        <fieldset>
          <legend>Size</legend>
          <div className="choices">
            {SIZES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                onClick={() => setSize(option)}
              >
                {SIZE_LABEL[option]}
                <span>{formatCents(SIZE_BASE_CENTS[option])} base</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field">
          Name this pizza
          <input
            value={label}
            maxLength={40}
            placeholder="Optional"
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>

        {(["CRUST", "SAUCE", "CHEESE"] as const).map((category) => (
          <fieldset key={category}>
            <legend>{CATEGORY_LABEL[category]}</legend>
            <div className="choices">
              {byCategory.get(category)?.map((item) => {
                const current = category === "CRUST" ? crust : category === "SAUCE" ? sauce : cheese;
                const choose =
                  category === "CRUST" ? setCrust : category === "SAUCE" ? setSauce : setCheese;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={current === item.id}
                    disabled={!item.available}
                    onClick={() => choose(item.id)}
                  >
                    {item.name}
                    <span>{item.available ? formatCents(item.priceCents) : "Off the board"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset>
          <legend>Toppings ({toppings.length}/{MAX_TOPPINGS})</legend>
          <div className="choices">
            {byCategory.get("TOPPING")?.map((item) => {
              const on = toppings.includes(item.id);
              const blocked = !item.available || (!on && toppings.length >= MAX_TOPPINGS);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  disabled={blocked}
                  onClick={() => toggleTopping(item.id)}
                >
                  {item.name}
                  <span>{item.available ? formatCents(item.priceCents) : "Off the board"}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      <aside className="tray">
        <p className="kicker">This pizza</p>
        <p className="total">{quote.ok ? formatCents(quote.cents) : "Choose the base"}</p>
        {!quote.ok ? <p className="hint">{quote.error}</p> : null}
        <button type="button" className="primary" disabled={!quote.ok || draft.length >= MAX_PIZZAS} onClick={addPizza}>
          Add to the order
        </button>
        {draft.length >= MAX_PIZZAS ? <p className="hint">Ten pizzas is the limit.</p> : null}

        <h2>Order</h2>
        {draft.length === 0 ? <p className="hint">No pizzas yet.</p> : null}
        <ul className="ticket">
          {draft.map((pizza) => {
            const priced = quotePizza(pizza.size, pizza.ingredientIds, ingredients);
            return (
              <li key={pizza.key}>
                <div>
                  <strong>{pizza.label}</strong>
                  <span>{SIZE_LABEL[pizza.size]}</span>
                </div>
                <div>
                  <span>{priced.ok ? formatCents(priced.cents) : "—"}</span>
                  <button type="button" onClick={() => removePizza(pizza.key)}>
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="total">{formatCents(draftTotal)}</p>
        {draft.length > 0 ? (
          <Link className="primary linkish" href="/checkout">
            Checkout
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
