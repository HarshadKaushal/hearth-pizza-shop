import { apiBase } from "./money";
import type { Ingredient } from "./types";

export async function fetchIngredients(): Promise<Ingredient[] | null> {
  try {
    const response = await fetch(`${apiBase()}/ingredients`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { ingredients: Ingredient[] };
    return body.ingredients;
  } catch {
    return null;
  }
}
