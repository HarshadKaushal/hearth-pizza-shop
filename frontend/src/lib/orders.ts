import { apiBase } from "./money";
import type { OrderView } from "./types";

export async function fetchOrder(id: string): Promise<OrderView | null> {
  try {
    const response = await fetch(`${apiBase()}/orders/${id}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as OrderView;
  } catch {
    return null;
  }
}
