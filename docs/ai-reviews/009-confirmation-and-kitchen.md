# AI Review: Confirmation and kitchen board

## Commit

- Message: Show the saved ticket and let the kitchen advance it on a timer.
- Scope: `/orders/[id]`, `/kitchen`, the five-second refresh, header link, and the feature notes that close the 404 gap.

## What the assistant proposed

- Open a websocket from the kitchen page in this commit.
- Let the board offer every status and rely on the API to reject the illegal ones.
- Render the confirmation from the checkout response only, with no second fetch, so a refresh would lose the ticket.

## What was accepted, and why

- Confirmation is a server render of `GET /orders/:id`. Refresh shows the current status. A missing id returns the framework 404. Checked: the Ava Stone ticket rendered itemized snapshots at $17.00, and `/orders/missing-order` returned 404.
- The kitchen list is client-side and refetches every five seconds. The page says that, so nobody expects push updates.
- Buttons come from the same transition map as the domain note (`NEXT_STATUS`). A Received ticket offered Start preparing and Cancel. After the click it offered Mark ready and Cancel, and the confirmation page then read Preparing.
- Polling stays in the pending list only as "realtime." The board itself is completed.

## What was rejected or changed, and why

- Rejected websockets again. The feature note has said they are out of scope since the first commit. A timer is the trade-off recorded in the philosophy note.
- Rejected showing illegal buttons in a disabled state. A disabled Ready on a Received ticket invites a click that the server would 409. Offering only the legal next step matches the rule.
- Rejected keeping the confirmation out of the history until Docker. The previous commit's 404 was an explicit gap. This commit closes it.

## Reflection

- Decision: the status map is duplicated in the web app the same way pricing is. The API remains the enforcement. A wrong button label cannot complete an order the server would refuse.
- Alternative: hide the kitchen route behind a shared secret header. Rejected. Accounts are still pending, and a fake secret would look like auth without being one.
- Risk left open: five seconds of staleness, and no login on the kitchen page. Both are written down. Neither is treated as finished security.
