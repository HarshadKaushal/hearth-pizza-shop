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

- **Place an order in the browser.** Build, checkout, and `/orders/:id` work together. The worked example stored at 1700 cents. The confirmation page lists each snapshot and the status. After the kitchen marked that ticket preparing, a reload of the confirmation showed Preparing.
- **Kitchen board.** `/kitchen` lists tickets newest first and only offers the next legal statuses. Moving the newest ticket from Received to Preparing updated the board without a second manual refresh. Unknown order ids on the confirmation route return 404.

## Partial

Nothing is partial.

## Pending
- **Full Docker stack.** One Compose command will run Postgres, the API, and the web app. The apps run on the host. Dockerfiles are not written yet.
- **Customer accounts.** Out of scope for this assignment. Not scheduled.
- **Card payments.** Out of scope. An order is a request to the restaurant, not a charge.
- **Realtime kitchen updates.** Out of scope. The board refreshes on a timer. Push updates are not planned.
