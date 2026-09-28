# AI Review: Full Compose stack

## Commit

- Message: Run the shop from Compose so migrate, seed, and both apps start together.
- Scope: Dockerfiles, the API entrypoint, Compose services, the split between `API_URL` and `NEXT_PUBLIC_API_URL`, the quote type that `next build` required, browser-local order time, and the README execution path.

## What the assistant proposed

- Point every fetch at `http://backend:3001`, including browser calls.
- Use a multi-stage image that omits devDependencies, and rewrite the seed as plain SQL so `tsx` was unnecessary.
- Change the committed Postgres host port to 5434 after the local 5432 clash.
- Leave order timestamps formatted on the server.

## What was accepted, and why

- Two base URLs. Server rendering inside the web container uses `API_URL=http://backend:3001`. The browser uses `NEXT_PUBLIC_API_URL=http://localhost:3001`, baked in at image build. The menu HTML from the container included "Off the board," which only happens if the server fetch reached the API.
- The API container runs `prisma migrate deploy` and `prisma db seed` before `node dist/main.js`. The seed upserts, so a restart does not duplicate ingredients. Logs showed the init migration applied and the seed finish, then Nest listening.
- `GET /health` on the published port returned `{"status":"ok","database":"up"}`.
- A browser session on the Compose site built a medium pizza (classic, tomato, mozzarella) at $13.50, checked out as Nia Cole, and opened `/orders/cmul51qek0000qf4x36d44b77` with those snapshots.
- `.gitattributes` forces LF on `*.sh` so the Alpine entrypoint is not a Windows CRLF script.
- Dev dependencies stay in the API image. That is the trade-off that lets the existing TypeScript seed run.

## What was rejected or changed, and why

- Rejected a single internal hostname for the browser. The customer's machine cannot resolve `backend`.
- Rejected publishing Postgres on 5434 in git. This machine already had something on 5432, so the verification run mapped host `5434` and the file was put back to `5432` before the commit. The README already tells a reader to change the host mapping. Containers still use `postgres:5432`.
- `next build` failed on `"cents" in quote` with "Object is possibly undefined." `next dev` had not. The preview result is now a discriminant `{ ok: true, cents } | { ok: false, error }`.
- The confirmation time was 11:02 AM because the container is UTC. Formatting moved to a client component so the customer's zone is used. The image that served the Nia Cole page was built before that component; the source typecheck passed after it.

## Reflection

- Decision: Compose is the documented way to run the shop. Host `npm` remains a second path for the API and the web app, with Postgres still in Docker.
- Alternative: a root npm workspace and one process. Rejected. The assignment asks for a separate frontend, backend, and database, and the history already built them that way.
- Risk left open: `NEXT_PUBLIC_API_URL` is fixed at image build. Changing the API's host port requires a frontend rebuild, which the README says. Accounts, payments, and push updates stay pending.
