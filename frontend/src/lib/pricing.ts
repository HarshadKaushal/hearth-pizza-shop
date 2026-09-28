import type { Ingredient, IngredientCategory } from "./types";

export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

export const SIZE_BASE_CENTS: Record<PizzaSize, number> = {
  SMALL: 800,
  MEDIUM: 1200,
  LARGE: 1600,
};

export const SIZE_LABEL: Record<PizzaSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export const MAX_TOPPINGS = 8;

const REQUIRED: IngredientCategory[] = ["CRUST", "SAUCE", "CHEESE"];

export type PizzaQuote = { ok: true; cents: number } | { ok: false; error: string };

export function quotePizza(
  size: PizzaSize,
  ingredientIds: string[],
  catalog: Ingredient[],
): PizzaQuote {
  if (new Set(ingredientIds).size !== ingredientIds.length) {
    return { ok: false, error: "Each ingredient can be chosen once." };
  }

  const byId = new Map(catalog.map((item) => [item.id, item]));
  const chosen = [];
  for (const id of ingredientIds) {
    const item = byId.get(id);
    if (!item) {
      return { ok: false, error: "One of the ingredients is not on the menu." };
    }
    if (!item.available) {
      return { ok: false, error: `${item.name} is off the board.` };
    }
    chosen.push(item);
  }

  for (const category of REQUIRED) {
    const count = chosen.filter((item) => item.category === category).length;
    if (count !== 1) {
      return { ok: false, error: "Choose one crust, one sauce, and one cheese." };
    }
  }

  const toppings = chosen.filter((item) => item.category === "TOPPING");
  if (toppings.length > MAX_TOPPINGS) {
    return { ok: false, error: "Eight toppings is the limit." };
  }

  const cents =
    SIZE_BASE_CENTS[size] + chosen.reduce((sum, item) => sum + item.priceCents, 0);
  return { ok: true, cents };
}
