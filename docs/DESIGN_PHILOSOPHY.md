# Design philosophy

Hearth is a small shop system, so the engineering approach is narrow on purpose: one catalog, one ordering path, one price authority.

## The API is the source of price truth

A browser total is a display. It can be stale, rounded wrong, or edited in the request. `POST /orders` loads the current ingredient rows, applies the size base and the add-on rules in `pricePizza`, and writes that result. The storefront may preview a total with the same bases and add-ons, in `frontend/src/lib/pricing.ts`. That file is a copy, not a shared package. If it drifts, the 409 response is the correction: checkout shows `serverTotalCents` and the next submit sends that figure. The design still refuses to persist a total that arrived unchecked from the client.

## Snapshots protect history

Ingredients will change. A mozzarella price can move, or an item can be marked unavailable. An order is a record of a sale, so `OrderPizzaIngredient` stores `name`, `category`, and `priceCents` beside `ingredientId`. The live catalog row stays attached for traceability. `POST /orders` is the only writer of those columns, and it writes them in the same transaction as the order.

## Modules follow the counter, not the framework

Two business capabilities exist: showing what can go on a pizza, and taking an order. Those are `IngredientsModule` and `OrdersModule`. Health is a third module because it is operational, not a shop rule: it only answers whether Postgres accepts `SELECT 1`. NestJS is the framework because a module is an explicit import list. The cost is decorator metadata and a build step.

The storefront is a client of those modules. It formats cents and groups rows into Crusts, Sauces, Cheeses, and Toppings. It does not decide whether an item can be ordered. Unavailable is a field from the API, shown as "Off the board." A later builder may disable that control. It may not offer the item as selectable. If a page allows a selection the API would reject, that is a bug in the page.

## What this design refuses

- Float or decimal money in application code.
- Trusting `total` from the request body.
- Rewriting past orders when the menu changes.
- Accounts, sessions, or roles that the assignment does not ask for.
- A kitchen channel that needs a websocket server. The board polls `GET /orders` every five seconds. The buttons only offer legal next statuses; `PATCH` still rejects anything else.
- Hiding scope. Pending work stays written down in [FEATURES.md](FEATURES.md).

## How the documents stay true

Decisions are written in the commit that makes them. A philosophy paragraph that describes code which is not in that commit is marked as an intention. When the code lands, the paragraph is updated to describe the code that shipped, including a trade-off if the intention moved.
