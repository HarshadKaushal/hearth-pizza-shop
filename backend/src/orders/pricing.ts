import { IngredientCategory, PizzaSize } from "@prisma/client";

export const SIZE_BASE_CENTS: Record<PizzaSize, number> = {
  SMALL: 800,
  MEDIUM: 1200,
  LARGE: 1600,
};

export const MAX_TOPPINGS = 8;
export const MAX_PIZZAS = 10;

const SIZE_LABEL: Record<PizzaSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export class PizzaPricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PizzaPricingError";
  }
}

export type CatalogIngredient = {
  id: string;
  name: string;
  category: IngredientCategory;
  priceCents: number;
  available: boolean;
};

export type PricedIngredient = {
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  priceCents: number;
};

export type PricedPizza = {
  size: PizzaSize;
  label: string;
  baseCents: number;
  lineTotalCents: number;
  ingredients: PricedIngredient[];
};

export function pricePizza(
  size: PizzaSize,
  label: string | undefined,
  requestedIds: string[],
  catalog: CatalogIngredient[],
): PricedPizza {
  if (new Set(requestedIds).size !== requestedIds.length) {
    throw new PizzaPricingError("Each ingredient can be chosen once per pizza.");
  }

  const byId = new Map(catalog.map((row) => [row.id, row]));
  const chosen: CatalogIngredient[] = [];

  for (const id of requestedIds) {
    const row = byId.get(id);
    if (!row) {
      throw new PizzaPricingError("One of the ingredients is not on the menu.");
    }
    if (!row.available) {
      throw new PizzaPricingError(`${row.name} is unavailable.`);
    }
    chosen.push(row);
  }

  const count = (category: IngredientCategory) =>
    chosen.filter((row) => row.category === category).length;

  if (count(IngredientCategory.CRUST) !== 1) {
    throw new PizzaPricingError("A pizza needs exactly one crust.");
  }
  if (count(IngredientCategory.SAUCE) !== 1) {
    throw new PizzaPricingError("A pizza needs exactly one sauce.");
  }
  if (count(IngredientCategory.CHEESE) !== 1) {
    throw new PizzaPricingError("A pizza needs exactly one cheese.");
  }
  if (count(IngredientCategory.TOPPING) > MAX_TOPPINGS) {
    throw new PizzaPricingError("A pizza can have at most 8 toppings.");
  }

  const ingredients = chosen.map((row) => ({
    ingredientId: row.id,
    name: row.name,
    category: row.category,
    priceCents: row.priceCents,
  }));
  const baseCents = SIZE_BASE_CENTS[size];

  return {
    size,
    label: label?.trim() || `${SIZE_LABEL[size]} pizza`,
    baseCents,
    lineTotalCents: baseCents + ingredients.reduce((sum, row) => sum + row.priceCents, 0),
    ingredients,
  };
}
