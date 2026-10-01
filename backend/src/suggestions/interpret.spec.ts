import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IngredientCategory } from "@prisma/client";
import { CatalogIngredient } from "../orders/pricing";
import { interpretSuggestion, OFF_TOPIC_MESSAGE, UNBUILDABLE_MESSAGE } from "./interpret";

const catalog: CatalogIngredient[] = [
  { id: "thin", name: "Thin", category: IngredientCategory.CRUST, priceCents: 0, available: true },
  { id: "tomato", name: "Tomato", category: IngredientCategory.SAUCE, priceCents: 0, available: true },
  { id: "mozz", name: "Mozzarella", category: IngredientCategory.CHEESE, priceCents: 150, available: true },
  { id: "jal", name: "Jalapeños", category: IngredientCategory.TOPPING, priceCents: 100, available: true },
];

describe("interpretSuggestion", () => {
  it("returns the fixed pizza-only line and no ingredients when the model refuses", () => {
    const result = interpretSuggestion(
      { refused: true, size: "LARGE", ingredientIds: ["thin", "tomato", "mozz"] },
      catalog,
    );
    assert.deepEqual(result, { ok: false, message: OFF_TOPIC_MESSAGE });
  });

  it("keeps a legal pizza and drops an id that is not on the menu", () => {
    const result = interpretSuggestion(
      { refused: false, size: "SMALL", ingredientIds: ["thin", "tomato", "mozz", "truffle", "jal"] },
      catalog,
    );
    assert.deepEqual(result, {
      ok: true,
      size: "SMALL",
      ingredientIds: ["thin", "tomato", "mozz", "jal"],
      label: "Small pizza",
    });
  });

  it("does not fill a pizza that is missing a required category", () => {
    const result = interpretSuggestion(
      { refused: false, size: "MEDIUM", ingredientIds: ["jal"] },
      catalog,
    );
    assert.deepEqual(result, { ok: false, message: UNBUILDABLE_MESSAGE });
  });
});
