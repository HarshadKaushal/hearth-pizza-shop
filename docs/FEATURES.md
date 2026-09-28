# Features

Status words mean the following.

- **Completed** — a customer or the kitchen can do the thing end to end against the running app.
- **Partial** — some of the path works, and the gap is named.
- **Pending** — not built. Listed so the omission is deliberate.

## Completed

- **API process.** `GET /health` reports whether Postgres answers. CORS is limited to `FRONTEND_ORIGIN`.
- **Ingredient catalog API.** `GET /ingredients` returns all 23 seeded rows, ordered by category then name, including unavailable Anchovies. Money is `priceCents`.
- **Place an order API.** `POST /orders` requires a name, a phone, at least one pizza, and a quoted total. Delivery also requires an address. The saved total is the server total. A mismatch returns 409 and stores nothing. Ingredient name, category, and price are snapshotted. Status starts at `RECEIVED`.
- **Kitchen API.** `GET /orders` lists tickets newest first. `GET /orders/:id` returns one. `PATCH /orders/:id/status` follows the status line. Skipping from `RECEIVED` to `READY` returns 409. Unknown ids return 404.

## Partial

Nothing is partial. There is still no page for the catalog, the builder, confirmation, or the kitchen.

## Pending

- **Ingredient catalog page.** Customers will see each ingredient, its category, its price, and whether it can be ordered. The API returns those fields. Blocked on the storefront.
- **Pizza builder.** A pizza will require one crust, one sauce, and one cheese, and will allow up to eight toppings, with a live price preview. Blocked on the catalog and the pricing rules in code.
- **Place an order.** The API accepts a legal order. The browser checkout does not exist yet.
- **Order confirmation.** The API can return a saved order. The confirmation page does not exist yet.
- **Kitchen board.** The status API works. The restaurant page does not exist yet.
- **Full Docker stack.** One Compose command will run Postgres, the API, and the web app. Blocked on the apps existing.
- **Customer accounts.** Out of scope for this assignment. Not scheduled.
- **Card payments.** Out of scope. An order is a request to the restaurant, not a charge.
- **Realtime kitchen updates.** Out of scope. The board will refresh on a timer if it is built. Push updates are not planned.
