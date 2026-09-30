# AI Review: Shared checks and kitchen role

## Commit

- Message: Share form and API checks in one schema, and let only kitchen staff run the board.
- Scope: `@hearth/shared` Zod schemas, 10-digit phone, kitchen role and seed login, ingredient create and price or availability edits, in-progress kitchen pages, order indexes, ten-pizza cap, checkout quote reset.

## What the assistant proposed

- Keep class-validator on the API and add Zod only in the browser, so the same limits would exist twice.
- Replace the `PizzaSize` enum with a table so the kitchen page could add Extra Large.
- Let a kitchen user type any category string, including ones the pizza rules do not know.
- Choose the kitchen account with an environment email list, or only by editing Postgres.

## What was accepted, and why

- Signup, login, orders, and ingredient writes use one Zod schema in `@hearth/shared`. The form runs it before `fetch`. Nest runs it on the body. A direct request cannot skip the phone, name, or category checks.
- Phone is exactly 10 digits. `abcdefg` returns 400 and stores nothing.
- Sizes stay `SMALL`, `MEDIUM`, and `LARGE`. Ingredient category stays the four enums. The add form only offers those four, and any other word is 400 before Prisma.
- One seeded user, `kitchen@hearth.test`, has role `KITCHEN`. Signup always creates `CUSTOMER`. The token carries the role. Kitchen routes return 403 for a customer.
- The kitchen page can change `priceCents`, set `available`, and add a crust, sauce, cheese, or topping. Old orders keep their snapshots.
- `GET /orders` returns Received, Preparing, and Ready, 20 per page. Completed and cancelled tickets stay off the five-second poll.
- Indexes on `(status, createdAt)`, `orderId`, and `orderPizzaId`. `userId` already had one.
- The builder refuses an 11th pizza. Checkout drops a stored server total when the preview total changes.

## What was rejected or changed, and why

- Rejected a second copy of the rules only in the browser. The PowerShell order with phone `abcdefggh` was accepted with 201 until the API used the same schema.
- Rejected a size table. The kitchen work is price, availability, and new items in the existing categories, not a new size.
- Rejected free-text categories. A new category would not fit "one crust, one sauce, one cheese."
- Rejected promoting kitchen by env email or by a manual SQL update. A seed login is enough to open the board.
- Status updates stay on the class-validator DTO. That body is one enum and was not part of the shared form schemas.

## Reflection

- Decision: one commit for the shared schema, the role, the menu edits, and the kitchen list limits. Splitting them after the files already overlapped would invent a history the tree did not have.
- Risk left open: `JWT_SECRET` is the visible local string `hearth-dev-secret`. Anyone who can read the repo can sign a token. Fine for this demo. A deployed API needs a random secret that is not in git. Log out still does not revoke a copied token before `exp`.
