# AI Review: Catalog API

## Commit

- Message: Expose every ingredient, including unavailable ones, at a single price in cents.
- Scope: `IngredientsModule`, `GET /ingredients`, registration on `AppModule`, and the doc edits that mark the catalog API completed while the page stays pending.

## What the assistant proposed

- Omit unavailable ingredients from the JSON so the client would not have to disable them.
- Add `GET /ingredients/:id` and pagination in the same commit.
- Return a formatted price string such as `"$1.50"` beside the cents.
- Group the JSON into `{ crusts, sauces, cheeses, toppings }` instead of a flat list plus a category field.

## What was accepted, and why

- One list, every row, `category` on each object. The storefront can group for display. The API stays a catalog, not a layout.
- Unavailable Anchovies stay in the payload with `available: false` and `priceCents: 200`. Verified: 4 crusts, 4 sauces, 4 cheeses, 11 toppings.
- Integer cents only. Formatting is a presentation concern and belongs in the page that does not exist yet.
- The service is exported from the module so the order slice can load the same rows without a second query style.

## What was rejected or changed, and why

- Rejected filtering unavailable rows. The domain note says the shop shows what is off the board. A filtered API would force the page to lie or to call a second endpoint.
- Rejected pagination. Twenty-three rows do not need it, and a default page size would hide menu items.
- Rejected a by-id route. Nothing in the order flow fetches one ingredient. Adding it would be an unused contract.
- Rejected nested category objects. A flat list is easier to validate later when the client sends ids back.

## Reflection

- Decision: the catalog response is the contract the builder will use. Fields are id, name, description, category, priceCents, available.
- Alternative: GraphQL or a query parameter `?available=true`. Rejected as extra surface for one menu.
- Risk left open: the endpoint has no cache header. A price change is visible on the next fetch, which is what we want, and it means the page must refetch rather than assume a build-time menu.
