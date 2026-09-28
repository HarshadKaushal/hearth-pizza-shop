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
| Server rejects a mismatched quote | A hidden field or a modified request must not set the charged total. | Applied when orders are implemented |
| Order lines snapshot name and price | A later catalog edit must not rewrite what the customer bought. | Applied with the order schema |

## Milestones

| Commit | What landed | Documents touched |
| --- | --- | --- |
| 1. Repository foundation | Git, ignore rules, Postgres service, these five documents, first AI review | All of them, created |
| 2. Menu schema and seed | Ingredient, order, pizza, and snapshot tables; 23 seeded ingredients | Implementation, features, domain, philosophy, README |
| 3. API process | NestJS bootstrap, global Prisma module, `GET /health` | Implementation, features, philosophy, README |
| 4. Catalog API | `GET /ingredients` returns price, category, and availability for every row | Implementation, features, domain, README |

Later rows are added in the commit that creates them. They are not backfilled.

## Challenges

- **Documentation before behavior.** The first milestone had rules and no code. The risk was writing prices that the seed would later contradict. The domain note kept a formula example and named the cents only after `backend/prisma/seed.ts` existed.
- **Host port 5432 was already taken** on the machine where the migration was generated, by an unrelated Postgres container. The committed Compose file still publishes `5432`, which is the port a clean machine should use. The migration was applied through host port `5433` by overriding `DATABASE_URL` for that session. The README tells a reader to change the host mapping and the URL together. The container port is unchanged, so a future API container can keep using `postgres:5432` on the Compose network.
- **Health has to fail closed.** A process that is up while Postgres is down is not healthy. `GET /health` runs `SELECT 1` and returns 503 if that query throws, instead of always returning 200.

## Trade-offs

- **Docs start incomplete on purpose.** The README says only Postgres runs. Pretending the API exists would make the first commit a lie. Completeness is a property of the last milestone, accuracy is a property of every milestone.
- **Compose contains only Postgres.** Adding API and web services now would commit Dockerfiles for apps that do not exist. Those services arrive with the apps.
- **No auth, payments, or websockets.** Recorded as pending features so the cut is visible. See [FEATURES.md](FEATURES.md).
