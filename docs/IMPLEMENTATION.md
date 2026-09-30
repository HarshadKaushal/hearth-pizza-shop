# Implementation

## Approach

Hearth is built in vertical slices, and each slice is its own commit. A slice includes the code, the edits to these living documents, and one AI review file. The history is the implementation record. A single commit that drops in the finished app would hide the decisions.

The running system will be three processes: a Next.js storefront, a NestJS API, and PostgreSQL. Prisma is the only database access path. Docker Compose is the supported way to get a database, and later the supported way to run the whole stack.

Money is integer cents. The pricing function will live on the server and will be the only writer of `totalCents`. The storefront may preview a total with the same formula so the screen is not blank, but `POST /orders` recomputes and refuses a quote that does not match.

## Technical decisions

| Decision | Why | Commit |
| --- | --- | --- |
| NestJS rather than a single Express file | Catalog and ordering need separate modules. The files were written by hand instead of `nest new`, so this commit contains only the process, the Prisma module, and health. The boilerplate cost is the decorators and `reflect-metadata`. | API scaffold |
| PostgreSQL 16 via Compose | The assignment requires PostgreSQL and Docker. Compose gives a health check the later API container can wait on. | This milestone |
| Prisma 6 with migrations in git | Required ORM. `migrate deploy` is what a later container will run; `migrate dev` was used once to create the SQL. Seed stays in `package.json#prisma` because that is the Prisma 6 mechanism. A `prisma.config.ts` file is a Prisma 7 change and was not started. | Schema milestone |
| Integer cents | Floating currency drifts. A $1.50 topping is `150`, not `1.5`. | Decided now, applied when the schema lands |
| No customer accounts | The assignment asks to view ingredients, customize a pizza, and place an order. A name and phone on the order are enough. | Decided now |
| Server rejects a mismatched quote | A hidden field or a modified request must not set the charged total. `POST /orders` returns 409 with `serverTotalCents` and does not insert a row. | Order placement |
| Order lines snapshot name and price | A later catalog edit must not rewrite what the customer bought. `OrderPizzaIngredient` copies name, category, and price inside the same transaction as the order. | Order placement |

## Milestones

| Commit | What landed | Documents touched |
| --- | --- | --- |
| 1. Repository foundation | Git, ignore rules, Postgres service, these five documents, first AI review | All of them, created |
| 2. Menu schema and seed | Ingredient, order, pizza, and snapshot tables; 23 seeded ingredients | Implementation, features, domain, philosophy, README |
| 3. API process | NestJS bootstrap, global Prisma module, `GET /health` | Implementation, features, philosophy, README |
| 4. Catalog API | `GET /ingredients` returns price, category, and availability for every row | Implementation, features, domain, README |
| 5. Order placement | Server prices each pizza, rejects a bad quote, stores snapshots | Implementation, features, domain, philosophy, README |
| 6. Kitchen API | List, fetch, and move status only along the allowed line | Implementation, features, domain, README |
| 7. Menu page | Next.js shell renders the catalog, including unavailable items | Implementation, features, philosophy, README |
| 8. Builder and checkout | Preview total in the browser; only a matching quote is stored | Implementation, features, philosophy, README |
| 9. Confirmation and kitchen | The customer can read the ticket; the kitchen can move status | Implementation, features, philosophy, README |
| 10. Full Compose stack | Postgres, API, and web run from one Compose file. Migrations and seed run on API start. | Implementation, features, README |
| 11. Backend tsconfig | Drop `"baseUrl": "./"` so TypeScript 6 stops warning when no `paths` are used | Implementation |
| 12. Accounts | User table, password hash, order `userId` foreign key, login pages, my orders | Implementation, features, domain, README |

Later rows are added in the commit that creates them. They are not backfilled.

## Challenges

- **Documentation before behavior.** The first milestone had rules and no code. The risk was writing prices that the seed would later contradict. The domain note kept a formula example and named the cents only after `backend/prisma/seed.ts` existed.
- **Host port 5432 was already taken** on the machine where the migration was generated, by an unrelated Postgres container. The committed Compose file still publishes `5432`, which is the port a clean machine should use. The migration was applied through host port `5433` by overriding `DATABASE_URL` for that session. The README tells a reader to change the host mapping and the URL together. The container port is unchanged, so a future API container can keep using `postgres:5432` on the Compose network.
- **Health has to fail closed.** A process that is up while Postgres is down is not healthy. `GET /health` runs `SELECT 1` and returns 503 if that query throws, instead of always returning 200.
- **Two layers reject a bad pizza.** The DTO refuses an empty order, a missing delivery address, and more than 11 ingredient ids. `pricePizza` then refuses the shop rules (one crust, one sauce, one cheese, duplicates, unavailable rows). A request can fail in either layer. The pricing function is covered by `npm test` without a database; the HTTP path was checked with a real medium pizza at 1700 cents, a 409 on a quote of 1 cent, and a 400 when Anchovies were included.
- **Status updates can race.** Two kitchen clicks can both read `RECEIVED`. The write is `updateMany` where the id and the previously read status still match. If the count is not 1, the API returns 409 and asks for a refresh instead of overwriting a newer status.
- **`next dev` accepted a quote check that `next build` rejected.** `"cents" in quote` did not narrow for the production typecheck, which reported the other branch as possibly undefined. The preview result is now `{ ok: true, cents } | { ok: false, error }`. Dev mode had already been used to place an order, so this only showed up when the frontend image ran `next build`.
- **The browser and the Next.js server need different API hosts.** Inside Compose, server rendering calls `http://backend:3001` via `API_URL`. The browser calls `http://localhost:3001` via `NEXT_PUBLIC_API_URL`, which is fixed when the image is built. One URL cannot serve both.
- **The container clock is UTC.** Formatting the order time during server render showed 11:02 AM for an order placed in the afternoon locally. The confirmation page now formats that timestamp in the browser.
- **TypeScript 6 deprecates `baseUrl` alone.** `"baseUrl": "./"` with no `paths` map emitted TS5101/TS5102 on `tsc --noEmit`. Backend imports are already relative, so the option was removed instead of adding a dummy path map.

## Trade-offs

- **Docs start incomplete on purpose.** The README says only what the current commit can run. Pretending a later page exists would make the commit a lie.
- **Compose runs the database, the API, and the web app.** The API image applies migrations and the idempotent seed before it listens. Dev dependencies stay in that image so `tsx` can run the seed. A smaller production image was not split out.
- **The browser previews a total with a copy of the formula.** `frontend/src/lib/pricing.ts` repeats the size bases and the one-of-each rules so the tray is not blank. It is not imported by the API. `POST /orders` still recomputes. A mismatch returns 409, and the checkout button retries with `serverTotalCents`. The cost is two copies that can drift. The server copy is the one that charges.
- **No auth, payments, or websockets.** Recorded as pending features. See [FEATURES.md](FEATURES.md).
