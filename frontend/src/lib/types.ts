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

export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";
export type OrderStatus = "RECEIVED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

export type OrderView = {
  id: string;
  customerName: string;
  phone: string;
  fulfillment: "PICKUP" | "DELIVERY";
  address: string | null;
  notes: string | null;
  status: OrderStatus;
  totalCents: number;
  createdAt: string;
  pizzas: {
    id: string;
    size: PizzaSize;
    label: string;
    baseCents: number;
    lineTotalCents: number;
    ingredients: {
      name: string;
      category: IngredientCategory;
      priceCents: number;
    }[];
  }[];
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Received",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
