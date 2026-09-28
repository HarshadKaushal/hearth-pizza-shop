import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { IngredientCategory, PizzaSize } from "@prisma/client";
import { pricePizza, PizzaPricingError, type CatalogIngredient } from "./pricing";

const menu: CatalogIngredient[] = [
  { id: "crust", name: "Classic hand-tossed", category: IngredientCategory.CRUST, priceCents: 0, available: true },
  { id: "thin", name: "Thin crust", category: IngredientCategory.CRUST, priceCents: 0, available: true },
  { id: "sauce", name: "Tomato", category: IngredientCategory.SAUCE, priceCents: 0, available: true },
  { id: "cheese", name: "Mozzarella", category: IngredientCategory.CHEESE, priceCents: 150, available: true },
  { id: "pepperoni", name: "Pepperoni", category: IngredientCategory.TOPPING, priceCents: 200, available: true },
  { id: "mushroom", name: "Mushrooms", category: IngredientCategory.TOPPING, priceCents: 150, available: true },
  { id: "anchovy", name: "Anchovies", category: IngredientCategory.TOPPING, priceCents: 200, available: false },
];

const legal = ["crust", "sauce", "cheese", "pepperoni", "mushroom"];

describe("pricePizza", () => {
  it("prices the worked example at 1700 cents", () => {
    const pizza = pricePizza(PizzaSize.MEDIUM, undefined, legal, menu);
    assert.equal(pizza.baseCents, 1200);
    assert.equal(pizza.lineTotalCents, 1700);
    assert.equal(pizza.label, "Medium pizza");
    assert.equal(pizza.ingredients[3].name, "Pepperoni");
    assert.equal(pizza.ingredients[3].priceCents, 200);
  });

  it("keeps a custom label", () => {
    const pizza = pricePizza(PizzaSize.SMALL, "  Friday pie  ", legal, menu);
    assert.equal(pizza.label, "Friday pie");
    assert.equal(pizza.lineTotalCents, 1300);
  });

  it("rejects a missing crust, a duplicate, an unknown id, and anchovies", () => {
    assert.throws(() => pricePizza(PizzaSize.MEDIUM, undefined, ["sauce", "cheese"], menu), PizzaPricingError);
    assert.throws(() => pricePizza(PizzaSize.MEDIUM, undefined, [...legal, "crust"], menu), PizzaPricingError);
    assert.throws(() => pricePizza(PizzaSize.MEDIUM, undefined, [...legal, "thin"], menu), PizzaPricingError);
    assert.throws(() => pricePizza(PizzaSize.MEDIUM, undefined, [...legal, "missing"], menu), PizzaPricingError);
    assert.throws(
      () => pricePizza(PizzaSize.MEDIUM, undefined, [...legal, "anchovy"], menu),
      (error: unknown) => error instanceof PizzaPricingError && error.message === "Anchovies is unavailable.",
    );
  });

  it("rejects more than eight toppings", () => {
    const toppings = Array.from({ length: 9 }, (_, index) => ({
      id: `top-${index}`,
      name: `Top ${index}`,
      category: IngredientCategory.TOPPING,
      priceCents: 10,
      available: true,
    }));
    assert.throws(
      () =>
        pricePizza(
          PizzaSize.LARGE,
          undefined,
          ["crust", "sauce", "cheese", ...toppings.map((row) => row.id)],
          [...menu, ...toppings],
        ),
      PizzaPricingError,
    );
  });
});
