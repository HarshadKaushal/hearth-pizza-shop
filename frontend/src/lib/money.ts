export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}
