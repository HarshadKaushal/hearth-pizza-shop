# AI Review: Menu suggestion

## Commit

- Message: Let a craving fill the builder without answering anything else.
- Scope: `POST /suggestions`, Gemini Flash on the free tier, the highlighted box on `/build`, and the refusal that stays a fixed sentence.

## What the assistant proposed

- Fine-tune a Gemini model so off-topic questions have no answer.
- Call Gemini from the browser with the free key in the page.
- Add the suggested pizza straight onto the order tray.

## What was accepted, and why

- The free generateContent call stays on the API. `GEMINI_API_KEY` is an environment variable and is not written into the repo.
- The model must return JSON only: refused, size, and ingredient ids. The page never renders other model text. A refusal uses one fixed sentence about building a pizza.
- Unknown ids are dropped. `pricePizza` then has to accept one crust, one sauce, one cheese, and at most eight toppings. The result lights up the existing buttons. The customer edits them and presses Add to the order.
- A missing key or a free-tier HTTP 429 returns 503 and leaves the manual builder working.

## What was rejected or changed, and why

- Rejected a fine-tune. That is a separate training job, and this shop only needs the model to pick from the menu it is given.
- Rejected putting the key in the frontend image. Anyone could read it and spend the free quota.
- Rejected auto-adding to the tray. The tray can remove a pizza, and the editable choices are the buttons on the left.

## Reflection

- Decision: one suggestion endpoint and one box, with the shop rules still in `pricePizza`.
- Risk left open: the instruction can still be ignored by the model. The API then either refuses or fails the pizza check, so a joke or a homework question still does not become a paragraph on the page. The free quota can run out during a busy demo.
