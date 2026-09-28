# Design philosophy

Hearth is a small shop system, so the engineering approach is narrow on purpose: one catalog, one ordering path, one price authority.

## The API is the source of price truth

A browser total is a display. It can be stale, rounded wrong, or edited in the request. The order endpoint loads the current ingredient rows, applies the size base and the add-on rules, and writes that result. If the client sends a quote, the quote must equal the server result or the order is refused. The design refuses to persist a total that arrived from the client.

## Snapshots protect history

Ingredients will change. A mozzarella price can move, or an item can be marked unavailable. An order is a record of a sale, so `OrderPizzaIngredient` stores `name`, `category`, and `priceCents` beside `ingredientId`. The live catalog row stays attached for traceability. Nothing writes those snapshot columns yet; the order endpoint is the only place that will.

## Modules follow the counter, not the framework

Two business capabilities exist: showing what can go on a pizza, and taking an order. Those will become two backend modules. Health is already a third module because it is operational, not a shop rule: it only answers whether Postgres accepts `SELECT 1`. The storefront will be a client of the business modules. It does not invent a third set of rules. If the page allows a selection the API would reject, that is a bug in the page.

NestJS is the framework because a module is an explicit import list. An Express app could do the same with folders, and was the smaller alternative. The cost accepted here is decorator metadata and a build step, in exchange for a layout a later reader can map onto catalog and ordering without hunting through one file.

## What this design refuses

- Float or decimal money in application code.
- Trusting `total` from the request body.
- Rewriting past orders when the menu changes.
- Accounts, sessions, or roles that the assignment does not ask for.
- A kitchen channel that needs a websocket server before a list and a status update exist.
- Hiding scope. Pending work stays written down in [FEATURES.md](FEATURES.md).

## How the documents stay true

Decisions are written in the commit that makes them. A philosophy paragraph that describes code which is not in that commit is marked as an intention. When the code lands, the paragraph is updated to describe the code that shipped, including a trade-off if the intention moved.
