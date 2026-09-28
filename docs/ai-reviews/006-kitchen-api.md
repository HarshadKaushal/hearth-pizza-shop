# AI Review: Kitchen API

## Commit

- Message: Let the kitchen move an order only along the status line.
- Scope: `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `assertStatusTransition` and its tests, and the domain note for those moves.

## What the assistant proposed

- Accept any status value the client sends, and let the kitchen page disable illegal buttons later.
- Push updates over a websocket in this commit.
- Use `order.update` after the in-memory check and ignore a concurrent click.

## What was accepted, and why

- The allowed map lives in `status.ts` and is tested without a database: the forward line, cancellation before completion, a skipped step, and both terminal states.
- HTTP checks against the order saved in the previous milestone: listing it, 409 on `RECEIVED` → `READY`, 200 on `RECEIVED` → `PREPARING`, and 404 for an unknown id.
- The write is conditional on the status that was read. A lost race returns 409 instead of clobbering the newer value.
- Same presenter as `POST /orders`, so the list, the ticket, and the create response share one shape.

## What was rejected or changed, and why

- Rejected a free-form status column. The business rules already named the line. A page-only restriction would not bind `curl`.
- Rejected websockets. The feature list keeps realtime updates pending. A list endpoint is enough for a board that refreshes.
- Rejected a separate kitchen module. These routes are the order after it has been placed, not a new domain. A second module would split one transaction model across folders for little gain.

## Reflection

- Decision: illegal transitions are 409, the same status family as a mismatched quote. Both mean "the server will not apply this change."
- Alternative: 400 for a bad transition. Rejected so validation failures (a nonsense enum) stay 400 and rule failures stay 409.
- Risk left open: the status route is not authenticated. The domain note already calls that a trusted-network limit. Accounts remain pending.
