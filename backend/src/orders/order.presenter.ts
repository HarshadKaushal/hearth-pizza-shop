import { Prisma } from "@prisma/client";

const orderInclude = {
  pizzas: {
    include: { ingredients: true },
    orderBy: { id: "asc" as const },
  },
} satisfies Prisma.OrderInclude;

export type OrderRecord = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export const orderWithPizzas = orderInclude;

export function toOrderResponse(order: OrderRecord) {
  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    fulfillment: order.fulfillment,
    address: order.address,
    notes: order.notes,
    status: order.status,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    pizzas: order.pizzas.map((pizza) => ({
      id: pizza.id,
      size: pizza.size,
      label: pizza.label,
      baseCents: pizza.baseCents,
      lineTotalCents: pizza.lineTotalCents,
      ingredients: pizza.ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        name: item.name,
        category: item.category,
        priceCents: item.priceCents,
      })),
    })),
  };
}

export type OrderResponse = ReturnType<typeof toOrderResponse>;
