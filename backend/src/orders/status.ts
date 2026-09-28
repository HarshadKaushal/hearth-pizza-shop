import { OrderStatus } from "@prisma/client";

const ALLOWED: Record<OrderStatus, readonly OrderStatus[]> = {
  RECEIVED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export class StatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatusTransitionError";
  }
}

export function assertStatusTransition(from: OrderStatus, to: OrderStatus) {
  if (!ALLOWED[from].includes(to)) {
    throw new StatusTransitionError(`Cannot move an order from ${from} to ${to}.`);
  }
}
