# AI Review: Order placement

## Commit

- Message: Price orders on the server so a client quote cannot become the charged total.
- Scope: `pricePizza`, its node:test file, `POST /orders`, the validation pipe, snapshot writes, and the domain rules that the code now enforces.

## What the assistant proposed

- Trust the client total when the ingredient ids look legal, and only recompute for display.
- Save the order even when the quote is wrong, and return both numbers so the client can "fix" the row.
- Use a decimal column now that real money is being stored.
- Skip a unit test and only curl the happy path.
- Put kitchen list and status updates in this same commit because they share the orders module.

## What was accepted, and why

- `pricePizza` is a pure function. `npm run test:pricing` checks the 1700-cent worked example, a custom label, a missing crust, a duplicate id, an unknown id, unavailable Anchovies, and nine toppings. No database.
- `quotedTotalCents` is required. A quote of 1 cent against the worked example returned 409 and `{ "message", "serverTotalCents": 1700 }`. A follow-up read was not required to prove the absence of a row: the handler throws before `prisma.order.create`.
- The legal request returned 201, `totalCents` 1700, status `RECEIVED`, and a Pepperoni snapshot at 200 cents.
- Anchovies on an otherwise legal pizza returned 400.
- Snapshots are created in the same `prisma.$transaction` as the order.
- Pickup drops any address. Delivery still requires one, via the DTO.

## What was rejected or changed, and why

- Rejected saving a mismatched quote. A stored wrong total is the bug the rule exists to prevent. The client can read `serverTotalCents` and retry.
- Rejected folding the kitchen routes into this commit. Status transitions are a separate rule and a separate review.
- Rejected Jest. The pricing cases run under `node:test` through `tsx`, which is already a dependency. A second test runner would be boilerplate.
- Added a cap of ten pizzas per request. The domain note did not have a maximum. An uncapped array is a trivial way to write a huge transaction. The cap is written into the business rules in this commit, not left as a silent check.

## Reflection

- Decision: the HTTP layer translates `PizzaPricingError` into 400 and a quote mismatch into 409. The pricing function does not import Nest.
- Alternative: return the server total as 200 and let the UI decide. Rejected because a careless client would treat 200 as saved.
- Risk left open: there is still no `GET /orders/:id`, so the customer cannot read the ticket back through the API. The row is in Postgres. The next commit adds the read and the status machine.
