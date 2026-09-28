# AI Review: Builder and checkout

## Commit

- Message: Preview the pizza price in the browser and let only a matching quote be stored.
- Scope: `/build`, `/checkout`, the client pricing copy, the session draft, header links, and the docs that call the missing confirmation page a gap.

## What the assistant proposed

- Add `POST /orders/preview` so the browser would not duplicate the formula.
- Trust the preview and omit `quotedTotalCents` once the UI looked right.
- Render the confirmation page in this commit so checkout would not land on a 404.
- Read `sessionStorage` inside `useState` so the tray appeared on the first paint.

## What was accepted, and why

- A duplicated `quotePizza` in the web app. A preview endpoint would be a second contract to keep identical. The existing `POST` already returns the authoritative total. The duplication and the 409 retry are written in the implementation and philosophy notes.
- Checkout sends `quotedTotalCents` from that preview. A browser run of the worked example showed $17.00, posted, and `GET /orders/:id` returned `totalCents` 1700, status `RECEIVED`, customer Ava Stone.
- Anchovies render disabled. The add button stays disabled until crust, sauce, and cheese are chosen. Toppings clear after add; the required choices stay so a second pizza is faster.
- Draft storage loads in `useEffect`, not during render, so server HTML and the first client render both start empty.

## What was rejected or changed, and why

- Rejected a preview endpoint. It would move the same rules to a third place (handler, pure function, client) instead of two.
- Rejected building `/orders/:id` here. Confirmation and the kitchen board are the next slice. The feature note says the successful order currently ends on a 404. That is the honest status, not a hidden bug.
- Rejected hydrating the draft during `useState`. The server has no `sessionStorage`, so the first client render would disagree with the HTML.
- The Next.js issue overlay during browser testing was `data-cursor-ref` attributes injected by the automation browser. Those attributes are not in the app. No code change for that warning.

## Reflection

- Decision: a 409 stores `serverTotalCents` in component state and the next click submits that number. The line items still show the preview; the button shows the accepted total.
- Alternative: automatically resubmit on 409. Rejected because the customer should see the price change before a second send.
- Risk left open: the two pricing copies can drift without a failing test on the client. The server tests remain the charge rules. A later shared package was not added.
