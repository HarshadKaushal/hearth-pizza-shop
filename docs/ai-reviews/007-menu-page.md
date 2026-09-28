# AI Review: Menu page

## Commit

- Message: Show the priced menu in the browser, including what is off the board.
- Scope: Next.js app shell, `/` catalog page, shared format helper, favicon, and the doc edits that mark the catalog visible.

## What the assistant proposed

- Build the pizza customizer in the same commit so the menu page had a call to action.
- Hide unavailable ingredients in the UI even though the API returns them.
- Format prices in the API so the page would not divide by 100.
- Use a component library and a purple gradient layout.

## What was accepted, and why

- A server-rendered menu that fetches `GET /ingredients` with `cache: "no-store"`. A price change is visible on refresh, which matches the catalog contract.
- Anchovies stay on the board with the label "Off the board" and no dollar amount. Verified in the browser: 4 crusts, 4 sauces, 4 cheeses, 11 toppings, Anchovies labeled off the board, gluten-free crust at $2.50.
- Dollars are formatted only in `formatCents`. The JSON remains integer cents.
- Visual system is paper, charcoal, and tomato, with Fraunces for headlines. It is a menu, not a dashboard.
- If the API is down, the page says so instead of rendering an empty menu.
- A generated icon so the browser's favicon request is not a 404.

## What was rejected or changed, and why

- Rejected putting the builder here. The assignment history should show the menu before a customer can spend. The header links only to Menu.
- Rejected filtering Anchovies. The domain note says an off-the-board item stays visible.
- Rejected sharing a UI kit. The page is one layout and a list. A dependency would not clarify the rules.
- Restored a missing blank line before the status section in the domain note. The kitchen commit had joined that heading to rule 11.

## Reflection

- Decision: the page groups by a fixed category order in the client. The API keeps returning a flat list.
- Alternative: four endpoints. Rejected in the catalog commit and not reopened.
- Risk left open: the size bases ($8, $12, $16) are written in the lede as copy. They are not computed from a shared constant yet. The builder commit has to use the same numbers the server uses, or the sentence and the preview will diverge.
