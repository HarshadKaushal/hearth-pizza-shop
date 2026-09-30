import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkoutSchema,
  createIngredientSchema,
  loginSchema,
  orderSchema,
  signupSchema,
  updateIngredientSchema,
} from "./validation";

const pizza = {
  size: "MEDIUM" as const,
  label: "Hahwd",
  ingredientIds: ["crust", "sauce", "cheese"],
};

describe("signup schema", () => {
  it("accepts a trimmed name and a normal email", () => {
    const parsed = signupSchema.parse({
      name: "  Ava Stone  ",
      email: "  Ava@Example.com  ",
      password: "correct-horse",
    });
    assert.equal(parsed.name, "Ava Stone");
    assert.equal(parsed.email, "Ava@Example.com");
  });

  it("rejects a name that is only long enough because of spaces", () => {
    const result = signupSchema.safeParse({
      name: " a",
      email: "ava@example.com",
      password: "correct-horse",
    });
    assert.equal(result.success, false);
  });

  it("rejects an email without a dot in the domain", () => {
    const result = signupSchema.safeParse({
      name: "Ava Stone",
      email: "a@b",
      password: "correct-horse",
    });
    assert.equal(result.success, false);
  });

  it("rejects a password made only of spaces", () => {
    const result = signupSchema.safeParse({
      name: "Ava Stone",
      email: "ava@example.com",
      password: "        ",
    });
    assert.equal(result.success, false);
  });
});

describe("login schema", () => {
  it("rejects a short password", () => {
    const result = loginSchema.safeParse({
      email: "ava@example.com",
      password: "short",
    });
    assert.equal(result.success, false);
  });
});

describe("checkout schema", () => {
  const base = {
    customerName: "Ava Stone",
    phone: "9876543210",
    fulfillment: "PICKUP" as const,
    address: "",
    notes: "",
  };

  it("accepts a 10-digit phone and trims the name", () => {
    const parsed = checkoutSchema.parse({ ...base, customerName: "  Ava Stone  " });
    assert.equal(parsed.customerName, "Ava Stone");
    assert.equal(parsed.phone, "9876543210");
  });

  it("rejects a phone that is not exactly 10 digits", () => {
    for (const phone of ["abcdefggh", "987654321", "98765432101", "98765 43210", "555-010-1234"]) {
      const result = checkoutSchema.safeParse({ ...base, phone });
      assert.equal(result.success, false, phone);
    }
  });

  it("requires a delivery address of at least 5 characters after trim", () => {
    const spaces = checkoutSchema.safeParse({
      ...base,
      fulfillment: "DELIVERY",
      address: "ab   ",
    });
    assert.equal(spaces.success, false);

    const parsed = checkoutSchema.parse({
      ...base,
      fulfillment: "DELIVERY",
      address: "  12 Oak Street  ",
    });
    assert.equal(parsed.address, "12 Oak Street");
  });
});

describe("ingredient schema", () => {
  it("accepts a new topping and rejects an unknown category", () => {
    const parsed = createIngredientSchema.parse({
      name: "Hot honey",
      description: "A spoon of hot honey after the bake.",
      category: "TOPPING",
      priceCents: 100,
    });
    assert.equal(parsed.category, "TOPPING");
    assert.equal(parsed.available, true);

    const category = createIngredientSchema.safeParse({
      name: "Hot honey",
      description: "A spoon of hot honey after the bake.",
      category: "DRIZZLE",
      priceCents: 100,
    });
    assert.equal(category.success, false);
  });

  it("accepts a price or availability change and rejects an empty patch", () => {
    assert.equal(updateIngredientSchema.safeParse({ priceCents: 175 }).success, true);
    assert.equal(updateIngredientSchema.safeParse({ available: false }).success, true);
    assert.equal(updateIngredientSchema.safeParse({}).success, false);
  });
});

describe("order schema", () => {
  it("rejects a direct request whose phone is letters", () => {
    const result = orderSchema.safeParse({
      customerName: "ab",
      phone: "abcdefggh",
      fulfillment: "PICKUP",
      notes: "Bake it",
      quotedTotalCents: 2000,
      pizzas: [pizza],
    });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message ?? "", /10-digit/);
    }
  });

  it("rejects a field that is not part of an order", () => {
    const result = orderSchema.safeParse({
      customerName: "Ava Stone",
      phone: "9876543210",
      fulfillment: "PICKUP",
      quotedTotalCents: 2000,
      pizzas: [pizza],
      extra: true,
    });
    assert.equal(result.success, false);
  });
});
