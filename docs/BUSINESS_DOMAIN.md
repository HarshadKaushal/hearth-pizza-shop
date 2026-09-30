# Business and domain notes

Shop name: **Hearth**. One location. The currency is US dollars, stored as cents.

## Assumptions

- There is one menu for everyone. No lunch pricing, no loyalty, no coupons.
- The customer signs up with an email and password. The API stores a generated user id and a password hash, never the password. Logging in returns a token the browser keeps.
- A new order stores that user id on the order row. Orders placed before accounts existed have a null user id and do not appear on anyone's account page.
- "Place an order with the restaurant" means the kitchen receives a durable order. It does not mean a payment is captured.
- Staff using the kitchen board are on a trusted network. The status endpoint is not behind a customer login.
- Ingredient prices are per pizza, added once. They are not multiplied by size. Size changes only the base.
- Unavailable means the shop cannot put that ingredient on a new pizza. It does not delete old orders that used it.

## Business rules

1. A pizza has a size: small, medium, or large.
2. Base prices: small 800 cents, medium 1200 cents, large 1600 cents.
3. A pizza includes exactly one crust, exactly one sauce, and exactly one cheese.
4. Toppings are optional. More than eight toppings is refused. Each ingredient id may appear once per pizza.
5. Every selected ingredient must exist and be available.
6. Pizza price = size base + the sum of the selected ingredient prices.
7. An order contains at least one pizza and at most ten. Order total = the sum of pizza prices. Ten is an operational cap so one request cannot insert an unbounded ticket.
8. Pickup requires a customer name and a phone number. An address sent with pickup is ignored and stored as null.
9. Delivery requires a name, a phone number, and a street address.
10. The request includes `quotedTotalCents`. It must equal the server total. On mismatch the API returns 409 with `serverTotalCents` and inserts nothing.
11. A new order starts as `RECEIVED`.

## Status decision logic

`PATCH /orders/:id/status` loads the current status, calls `assertStatusTransition`, then updates only if that status is still current.

- `RECEIVED` may become `PREPARING` or `CANCELLED`.
- `PREPARING` may become `READY` or `CANCELLED`.
- `READY` may become `COMPLETED` or `CANCELLED`.
- `COMPLETED` and `CANCELLED` are terminal. A request to move them returns 409.
- Skipping a step, such as `RECEIVED` to `READY`, returns 409.
- If the row changed between the read and the write, the update matches zero rows and the API returns 409.

## Decision logic

This is the order `POST /orders` follows.

1. Reject the body if the name or phone is missing, if there is no pizza, if there are more than ten pizzas, or if delivery has no address.
2. Load the referenced ingredients in one query.
3. Reject unknown ids, unavailable rows, a repeated id, a count other than one for crust, sauce, or cheese, and a topping count above eight.
4. Compute each pizza total from the size base and the stored prices, then sum the order.
5. If `quotedTotalCents` differs, respond 409 with `serverTotalCents`. Do not save a partial order.
6. Insert the order, each pizza, and each ingredient snapshot (id, name, category, price) in one transaction. Pickup stores a null address.
7. Set status to `RECEIVED` and return the saved order.

Catalog reads do not use this path. `GET /ingredients` returns every ingredient, including unavailable ones, ordered by category then name. Hiding unavailable rows would make an off-the-board item look like it was never on the menu.

## Seed prices

These cents are the rows in [backend/prisma/seed.ts](../backend/prisma/seed.ts). Crusts: Thin 0, Classic hand-tossed 0, Thick pan 100, Gluten-free 250. Sauces: Tomato 0, Basil pesto 100, BBQ 50, Garlic white 75. Cheeses: Mozzarella 150, Cheddar 150, Parmesan 175, Vegan mozzarella 200. Toppings: Pepperoni 200, Mushrooms 150, Black olives 125, Red onion 100, Bell peppers 100, Jalapeños 100, Pineapple 125, Roasted chicken 250, Bacon 225, Fresh basil 75, Anchovies 200 and unavailable.

## Worked example

Medium base 1200. Classic hand-tossed 0, Tomato 0, Mozzarella 150, Pepperoni 200, Mushrooms 150.

Medium pizza = 1200 + 0 + 0 + 150 + 200 + 150 = 1700 cents ($17.00).

That selection is legal: one crust, one sauce, one cheese, two toppings, all available. Adding Anchovies is not legal while that row is unavailable, even though the price is stored.
