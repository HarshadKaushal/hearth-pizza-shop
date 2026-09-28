# Features

Status words mean the following.

- **Completed** — a customer or the kitchen can do the thing end to end against the running app.
- **Partial** — some of the path works, and the gap is named.
- **Pending** — not built. Listed so the omission is deliberate.

## Completed

Nothing is completed. The database container can be started, and that is infrastructure, not a shop feature.

## Partial

- **Menu data.** Postgres holds 4 crusts, 4 sauces, 4 cheeses, and 11 toppings, with prices in cents. Anchovies are seeded `available = false`. There is no HTTP route and no page, so a customer still cannot see the menu.
- **API process.** `GET /health` reports whether Postgres answers. CORS is limited to `FRONTEND_ORIGIN`. No catalog or order routes exist, so the shop still cannot be used.

## Pending

- **Ingredient catalog.** Customers will see each ingredient, its category, its price, and whether it can be ordered. The rows exist. Blocked on the API and the catalog page.
- **Pizza builder.** A pizza will require one crust, one sauce, and one cheese, and will allow up to eight toppings, with a live price preview. Blocked on the catalog and the pricing rules in code.
- **Place an order.** Pickup or delivery, with name and phone, and an address when the order is for delivery. The server stores the recomputed total. Blocked on the order API.
- **Order confirmation.** The customer can open the saved order and read the itemized total. Blocked on place-an-order.
- **Kitchen board.** The restaurant can list orders and move status from received through completed, or cancel. Blocked on the status API and the kitchen page.
- **Full Docker stack.** One Compose command will run Postgres, the API, and the web app. Blocked on the apps existing.
- **Customer accounts.** Out of scope for this assignment. Not scheduled.
- **Card payments.** Out of scope. An order is a request to the restaurant, not a charge.
- **Realtime kitchen updates.** Out of scope. The board will refresh on a timer if it is built. Push updates are not planned.
