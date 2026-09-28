# Features

Status words mean the following.

- **Completed** — a customer or the kitchen can do the thing end to end against the running app.
- **Partial** — some of the path works, and the gap is named.
- **Pending** — not built. Listed so the omission is deliberate.

## Completed

- **API process.** `GET /health` reports whether Postgres answers. CORS is limited to `FRONTEND_ORIGIN`.
- **Ingredient catalog.** `GET /ingredients` returns all 23 seeded rows. The page at `/` groups them by category, formats cents as dollars, and labels unavailable items "Off the board." Anchovies render that way.
- **Place an order API.** `POST /orders` requires a name, a phone, at least one pizza, and a quoted total. Delivery also requires an address. The saved total is the server total. A mismatch returns 409 and stores nothing. Ingredient name, category, and price are snapshotted. Status starts at `RECEIVED`.
- **Kitchen API.** `GET /orders` lists tickets newest first. `GET /orders/:id` returns one. `PATCH /orders/:id/status` follows the status line. Skipping from `RECEIVED` to `READY` returns 409. Unknown ids return 404.

## Partial

- **Place an order in the browser.** `/build` enforces one crust, one sauce, one cheese, and disables Anchovies and a ninth topping. A medium pizza with classic crust, tomato, mozzarella, pepperoni, and mushrooms previewed at $17.00, was added to the order, and checkout stored it as `RECEIVED` with `totalCents` 1700. After success the app navigates to `/orders/:id`, and that route is still a 404.

## Pending

- **Order confirmation.** The API can return a saved order, and checkout redirects there. The page does not exist yet, so the customer sees a 404.
- **Kitchen board.** The status API works. The restaurant page does not exist yet.
- **Full Docker stack.** One Compose command will run Postgres, the API, and the web app. The apps run on the host. Dockerfiles are not written yet.
- **Customer accounts.** Out of scope for this assignment. Not scheduled.
- **Card payments.** Out of scope. An order is a request to the restaurant, not a charge.
- **Realtime kitchen updates.** Out of scope. The board will refresh on a timer if it is built. Push updates are not planned.
