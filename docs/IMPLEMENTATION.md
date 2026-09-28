# Implementation

## Approach

Hearth is built in vertical slices, and each slice is its own commit. A slice includes the code, the edits to these living documents, and one AI review file. The history is the implementation record. A single commit that drops in the finished app would hide the decisions.

The running system will be three processes: a Next.js storefront, a NestJS API, and PostgreSQL. Prisma is the only database access path. Docker Compose is the supported way to get a database, and later the supported way to run the whole stack.

Money is integer cents. The pricing function will live on the server and will be the only writer of `totalCents`. The storefront may preview a total with the same formula so the screen is not blank, but `POST /orders` recomputes and refuses a quote that does not match.

## Technical decisions

| Decision | Why | Commit |
| --- | --- | --- |
| NestJS rather than a single Express file | Catalog and ordering are separate modules with their own validation. The extra boilerplate is accepted so the folder layout matches the domain. | Planned for the API scaffold |
| PostgreSQL 16 via Compose | The assignment requires PostgreSQL and Docker. Compose gives a health check the later API container can wait on. | This milestone |
| Prisma | Required ORM. The schema is the contract for ingredients, orders, and price snapshots. | Next milestone |
| Integer cents | Floating currency drifts. A $1.50 topping is `150`, not `1.5`. | Decided now, applied when the schema lands |
| No customer accounts | The assignment asks to view ingredients, customize a pizza, and place an order. A name and phone on the order are enough. | Decided now |
| Server rejects a mismatched quote | A hidden field or a modified request must not set the charged total. | Applied when orders are implemented |
| Order lines snapshot name and price | A later catalog edit must not rewrite what the customer bought. | Applied with the order schema |

## Milestones

| Commit | What landed | Documents touched |
| --- | --- | --- |
| 1. Repository foundation | Git, ignore rules, Postgres service, these five documents, first AI review | All of them, created |

Later rows are added in the commit that creates them. They are not backfilled.

## Challenges

None in code yet. The process challenge this milestone is aimed at: documentation written after the code reads like a summary, and the assignment asks for a trail. The documents therefore exist before the feature code, and they stay editable.

## Trade-offs

- **Docs start incomplete on purpose.** The README says only Postgres runs. Pretending the API exists would make the first commit a lie. Completeness is a property of the last milestone, accuracy is a property of every milestone.
- **Compose contains only Postgres.** Adding API and web services now would commit Dockerfiles for apps that do not exist. Those services arrive with the apps.
- **No auth, payments, or websockets.** Recorded as pending features so the cut is visible. See [FEATURES.md](FEATURES.md).
