# AI Review: Accounts

## Commit

- Message: Tie each new order to a user id created at signup.
- Scope: `User` table and migration, password hash and login token, `Order.userId`, signup and login pages, account order list, checkout requiring a token.

## What the assistant proposed

- Require an account before the first menu view.
- Store the password in the `User` table so login can compare the typed text directly.
- Put the user id in `localStorage` and send that id as the only proof of who is ordering.
- Make `Order.userId` required and delete older orders that have no account.

## What was accepted, and why

- Signup creates a `User` row with a generated id and a scrypt password hash. Login checks that hash and returns a signed token. The browser stores the token, not the password.
- `POST /orders` requires the token and writes `userId`. `GET /orders/mine` returns only that user's orders. The kitchen list stays open so staff can still see every ticket.
- `userId` is nullable so orders placed before accounts existed remain valid and simply do not appear on an account page.
- Login and signup share one form component. Checkout blocks place-order until a token is present.

## What was rejected or changed, and why

- Rejected storing the raw password. A database read would then reveal every account.
- Rejected trusting a user id sent by the browser without a signature. The token is checked on the server before an order is saved.
- Rejected a required `userId` migration. Existing rows would have failed `migrate deploy`.

## Reflection

- Decision: one account feature in this commit, with the review file beside it, instead of splitting signup, login, and the foreign key after the fact.
- Risk left open: the kitchen status route is still unauthenticated, and a stolen token can place orders until it expires. Acceptable for this shop; accounts were added so a customer can see their own pizzas.
