import type { PizzaSize } from "./pricing";

export type DraftPizza = {
  key: string;
  size: PizzaSize;
  label: string;
  ingredientIds: string[];
};

const KEY = "hearth-draft";

export function readDraft(): DraftPizza[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as DraftPizza[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeDraft(pizzas: DraftPizza[]) {
  sessionStorage.setItem(KEY, JSON.stringify(pizzas));
}

export function clearDraft() {
  sessionStorage.removeItem(KEY);
}
