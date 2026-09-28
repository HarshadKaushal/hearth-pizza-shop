# AI Review: Menu schema and seed

## Commit

- Message: Store the menu and order shape in Postgres before any HTTP route.
- Scope: `backend/prisma/schema.prisma`, the init migration, `backend/prisma/seed.ts`, `backend/package.json`, `backend/package-lock.json`, `backend/.env.example`, and edits to the living docs.

## What the assistant proposed

- Generate the NestJS app in the same commit so the schema had a caller immediately.
- Use decimal columns for prices so the database type "looked like" money.
- Mark Anchovies available and hide the unavailable state until the UI existed.
- Move the seed command to `prisma.config.ts` because Prisma 6.19 warns that `package.json#prisma` is deprecated.
- Change the committed host port from 5432 to 5433 after the local port clash.

## What was accepted, and why

- Schema first, with order and snapshot tables even though no route writes them. Adding those tables later would be a second migration for a shape the domain note already fixed. One migration matches one decision.
- Integer `priceCents`. The domain rule was already cents.
- Anchovies seeded unavailable. The catalog has to be able to show an off-the-board item, and the seed is the fixture for that case.
- Upsert by unique ingredient name so `prisma db seed` is safe to repeat.
- Prisma 6, not the Prisma 8 release candidate. The warning about `package.json#prisma` describes a Prisma 7 removal. Staying on the Prisma 6 seed hook avoids a config-file migration in the middle of the schema commit.

## What was rejected or changed, and why

- Rejected bundling the NestJS bootstrap here. The API scaffold is a separate milestone so the history shows the schema before the server.
- Rejected republishing Compose on 5433. Another local Postgres already owned 5432, which the README already treats as a host-specific problem. The migration was applied with `DATABASE_URL` pointed at host port 5433. The file in git still maps `5432:5432` for a clean machine. A future container will use the Compose DNS name, not the host port.
- Rejected dropping the order tables "until orders exist." The snapshot columns are the design, and an empty table is cheaper than a later rewrite of the domain note.

## Reflection

- Decision: the seed file is the price list the domain doc quotes. If a price changes, both files change in the same commit.
- Alternative: a SQL seed inside the migration. Rejected because Prisma's seed reruns without editing migration history, and migrations should stay immutable.
- Risk left open: nothing stops an application from inserting an order that skips the snapshot columns. The order service has to be the only writer, and that service does not exist yet.
