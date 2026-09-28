# AI Review: API process

## Commit

- Message: Boot a NestJS process that fails health when Postgres is unreachable.
- Scope: NestJS bootstrap under `backend/src`, Prisma module, `GET /health`, build config, dependency lockfile, and the living-doc edits for this slice.

## What the assistant proposed

- Run `nest new` and commit the generated ESLint, Prettier, Jest, and sample app, then delete the sample.
- Use Express with two route files and skip Nest until the order module made the structure earn its keep.
- Return HTTP 200 from `/health` whenever the Node process is listening, and put the database result in the body only.

## What was accepted, and why

- Hand-written NestJS files: `main.ts`, `AppModule`, a global `PrismaModule`, and `HealthModule`. The diff is the process, not a CLI template.
- CORS already restricted to `FRONTEND_ORIGIN`, defaulting to `http://localhost:3000`, so the later storefront does not require a second security pass.
- `GET /health` runs `SELECT 1`. Failure becomes 503. Compose and a person curling the port get the same answer.
- Verified against the local database: `{"status":"ok","database":"up"}`.

## What was rejected or changed, and why

- Rejected `nest new`. The generated project adds lint, test, and sample code this milestone does not use. Those can be added when there is a test to run.
- Rejected Express for this commit. The design note already chose NestJS so catalog and ordering can be modules. Delaying the framework would make the next two commits a rewrite.
- Rejected a health check that ignores the database. A green process with a dead database would hide the failure mode this endpoint exists to show.

## Reflection

- Decision: Prisma is injected from one global module. Feature modules import nothing extra to reach the database, and there is still a single connection lifecycle.
- Alternative: a new `PrismaClient` inside the health controller. Rejected because the order module would then open a second client.
- Risk left open: `PrismaService` connects on init and will crash the boot if Postgres is down. That is stricter than the 503 path, which only helps when the database drops after startup. Acceptable for a shop API; a retry loop was not added.
