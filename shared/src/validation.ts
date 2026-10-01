import { z } from "zod";

export const MAX_TOPPINGS = 8;
export const MAX_PIZZAS = 10;

export const personName = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(80, "Name must be at most 80 characters.");

export const emailAddress = z
  .string()
  .trim()
  .max(120, "Email must be at most 120 characters.")
  .pipe(z.email("Enter an email address like you@example.com."));

export const password = z
  .string()
  .max(72, "Password must be at most 72 characters.")
  .refine((value) => value.trim().length >= 8, "Use at least 8 characters that are not spaces.");

export const phoneNumber = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Enter a 10-digit phone number.");

function requireDeliveryAddress(
  value: { fulfillment: "PICKUP" | "DELIVERY"; address?: string },
  ctx: z.RefinementCtx,
) {
  if (value.fulfillment === "DELIVERY" && (value.address ?? "").length < 5) {
    ctx.addIssue({
      code: "custom",
      path: ["address"],
      message: "Enter a delivery address of at least 5 characters.",
    });
  }
}

const pizzaSchema = z
  .object({
    size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
    label: z.string().trim().max(40, "Pizza name must be at most 40 characters.").optional(),
    ingredientIds: z
      .array(z.string())
      .min(3, "A pizza needs a crust, a sauce, and a cheese.")
      .max(3 + MAX_TOPPINGS, "A pizza can have at most 8 toppings."),
  })
  .strict();

export const checkoutSchema = z
  .object({
    customerName: personName,
    phone: phoneNumber,
    fulfillment: z.enum(["PICKUP", "DELIVERY"]),
    address: z.string().trim().max(200, "Address must be at most 200 characters.").optional(),
    notes: z.string().trim().max(280, "Note must be at most 280 characters.").optional(),
  })
  .superRefine(requireDeliveryAddress);

export const orderSchema = checkoutSchema
  .extend({
    quotedTotalCents: z.number().int().min(0, "Quoted total must be zero or more."),
    pizzas: z
      .array(pizzaSchema)
      .min(1, "Add at least one pizza.")
      .max(MAX_PIZZAS, "An order can have at most ten pizzas."),
  })
  .strict();

export const ingredientCategory = z.enum(["CRUST", "SAUCE", "CHEESE", "TOPPING"], {
  message: "Category must be crust, sauce, cheese, or topping.",
});

export const createIngredientSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be at most 80 characters."),
    description: z
      .string()
      .trim()
      .min(2, "Description must be at least 2 characters.")
      .max(200, "Description must be at most 200 characters."),
    category: ingredientCategory,
    priceCents: z.number().int().min(0, "Price must be zero or more cents."),
    available: z.boolean().default(true),
  })
  .strict();

export const updateIngredientSchema = z
  .object({
    priceCents: z.number().int().min(0, "Price must be zero or more cents.").optional(),
    available: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.priceCents !== undefined || value.available !== undefined, {
    message: "Send a price or an availability change.",
  });

export const signupSchema = z
  .object({
    name: personName,
    email: emailAddress,
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailAddress,
    password,
  })
  .strict();

export const suggestionSchema = z
  .object({
    prompt: z
      .string()
      .trim()
      .min(3, "Tell the builder a little more about the pizza you want.")
      .max(280, "Keep the description under 280 characters."),
  })
  .strict();

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type OrderValues = z.infer<typeof orderSchema>;
export type CreateIngredientValues = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientValues = z.infer<typeof updateIngredientSchema>;
export type SuggestionValues = z.infer<typeof suggestionSchema>;
