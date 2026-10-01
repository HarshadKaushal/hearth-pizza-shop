import { PizzaSize } from "@prisma/client";
import { CatalogIngredient, PizzaPricingError, pricePizza } from "../orders/pricing";

export const OFF_TOPIC_MESSAGE =
  "I only build pizzas from the Hearth menu. Tell me what you feel like — spicy, crispy, cheesy — and I will fill one pizza.";

export const UNBUILDABLE_MESSAGE =
  "I couldn't build a legal pizza from that. Name a size or a taste, such as spicy, crispy, or mushroomy.";

const SIZES = new Set<string>(Object.values(PizzaSize));

export type ModelSuggestion = {
  refused?: boolean;
  size?: string;
  ingredientIds?: unknown;
};

export type InterpretedSuggestion =
  | { ok: false; message: string }
  | { ok: true; size: PizzaSize; ingredientIds: string[]; label: string };

export function interpretSuggestion(
  model: ModelSuggestion,
  catalog: CatalogIngredient[],
): InterpretedSuggestion {
  if (model.refused === true) {
    return { ok: false, message: OFF_TOPIC_MESSAGE };
  }

  if (!model.size || !SIZES.has(model.size)) {
    return { ok: false, message: UNBUILDABLE_MESSAGE };
  }

  const allowed = new Set(catalog.map((row) => row.id));
  const ingredientIds = Array.isArray(model.ingredientIds)
    ? [...new Set(model.ingredientIds.filter((id): id is string => typeof id === "string" && allowed.has(id)))]
    : [];

  try {
    const priced = pricePizza(model.size as PizzaSize, undefined, ingredientIds, catalog);
    return {
      ok: true,
      size: priced.size,
      ingredientIds: priced.ingredients.map((row) => row.ingredientId),
      label: priced.label,
    };
  } catch (error) {
    if (error instanceof PizzaPricingError) {
      return { ok: false, message: UNBUILDABLE_MESSAGE };
    }
    throw error;
  }
}
