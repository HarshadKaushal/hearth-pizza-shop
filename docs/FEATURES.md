# Features

Status words mean the following.

- **Completed** — a customer or the kitchen can do the thing end to end against the running app.
- **Partial** — some of the path works, and the gap is named.
- **Pending** — not built. Listed so the omission is deliberate.

## Completed

- **API process.** `GET /health` reports whether Postgres answers. CORS is limited to `FRONTEND_ORIGIN`.
- **Ingredient catalog.** `GET /ingredients` returns all 23 seeded rows. The page at `/` groups them by category, formats cents as dollars, and labels unavailable items "Off the board." Anchovies render that way.
- **Place an order API.** `POST /orders` requires a logged-in user, a name, a phone, at least one pizza, and a quoted total. The order row stores that user's id. Delivery also requires an address. The saved total is the server total. A mismatch returns 409 and stores nothing. Ingredient name, category, and price are snapshotted. Status starts at `RECEIVED`.
- **Accounts.** `POST /auth/signup` creates a user id and password hash. `POST /auth/login` checks the password. `GET /orders/mine` returns only that user's orders.
- **Kitchen API.** `GET /orders` lists tickets newest first. `GET /orders/:id` returns one. `PATCH /orders/:id/status` follows the status line. Skipping from `RECEIVED` to `READY` returns 409. Unknown ids return 404.

- **Place an order in the browser.** Build, checkout, and `/orders/:id` work together. The worked example stored at 1700 cents. The confirmation page lists each snapshot and the status. After the kitchen marked that ticket preparing, a reload of the confirmation showed Preparing.
- **Kitchen board.** `/kitchen` lists tickets newest first and only offers the next legal statuses. Moving the newest ticket from Received to Preparing updated the board without a second manual refresh. Unknown order ids on the confirmation route return 404.
- **Full Docker stack.** `docker compose up --build` starts Postgres, runs migrations and the seed inside the API container, and serves the site on port 3000. Against that stack, the menu showed Anchovies as off the board, and a browser checkout stored a $13.50 pickup for Nia Cole.

## Partial

Nothing is partial.

## Pending

- **Card payments.** Out of scope. An order is a request to the restaurant, not a charge.
- **Realtime kitchen updates.** Out of scope. The board refreshes on a timer. Push updates are not planned.
