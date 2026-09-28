export type IngredientCategory = "CRUST" | "SAUCE" | "CHEESE" | "TOPPING";

export type Ingredient = {
  id: string;
  name: string;
  description: string;
  category: IngredientCategory;
  priceCents: number;
  available: boolean;
};

export const CATEGORY_ORDER: IngredientCategory[] = ["CRUST", "SAUCE", "CHEESE", "TOPPING"];

export const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  CRUST: "Crusts",
  SAUCE: "Sauces",
  CHEESE: "Cheeses",
  TOPPING: "Toppings",
};
