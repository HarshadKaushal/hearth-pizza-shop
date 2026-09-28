# Features

Status words mean the following.

- **Completed** — a customer or the kitchen can do the thing end to end against the running app.
- **Partial** — some of the path works, and the gap is named.
- **Pending** — not built. Listed so the omission is deliberate.

## Completed

- **API process.** `GET /health` reports whether Postgres answers. CORS is limited to `FRONTEND_ORIGIN`.
- **Ingredient catalog API.** `GET /ingredients` returns all 23 seeded rows, ordered by category then name, including unavailable Anchovies. Money is `priceCents`.

## Partial

Nothing is partial. The catalog still has no page, so a customer cannot see these rows without calling the API.

## Pending

- **Ingredient catalog page.** Customers will see each ingredient, its category, its price, and whether it can be ordered. The API returns those fields. Blocked on the storefront.
- **Pizza builder.** A pizza will require one crust, one sauce, and one cheese, and will allow up to eight toppings, with a live price preview. Blocked on the catalog and the pricing rules in code.
- **Place an order.** Pickup or delivery, with name and phone, and an address when the order is for delivery. The server stores the recomputed total. Blocked on the order API.
- **Order confirmation.** The customer can open the saved order and read the itemized total. Blocked on place-an-order.
- **Kitchen board.** The restaurant can list orders and move status from received through completed, or cancel. Blocked on the status API and the kitchen page.
- **Full Docker stack.** One Compose command will run Postgres, the API, and the web app. Blocked on the apps existing.
- **Customer accounts.** Out of scope for this assignment. Not scheduled.
- **Card payments.** Out of scope. An order is a request to the restaurant, not a charge.
- **Realtime kitchen updates.** Out of scope. The board will refresh on a timer if it is built. Push updates are not planned.
