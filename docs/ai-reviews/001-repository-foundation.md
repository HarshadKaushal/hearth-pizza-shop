# AI Review: Repository foundation

## Commit

- Message: Record the shop rules and database service before feature code.
- Scope: `.gitignore`, `docker-compose.yml` (Postgres only), `.env.example`, `README.md`, `docs/IMPLEMENTATION.md`, `docs/FEATURES.md`, `docs/DESIGN_PHILOSOPHY.md`, `docs/BUSINESS_DOMAIN.md`, and this review.

## What the assistant proposed

- Generate the NestJS and Next.js apps immediately, then write documentation once the code settled.
- Put all four domain documents and every AI review into a final commit so the wording could match the finished behavior.
- Use Express for a smaller first diff.

## What was accepted, and why

- A docs-and-database first commit. The assignment asks the history to show the development process. Rules for crusts, sauces, cheese, topping limits, cents, and status moves are knowable before a controller exists, so they belong in this commit.
- Postgres 16 in Compose with a health check and a named volume, and no API service yet. Committing a Dockerfile for an app that is not in the tree would fake progress.
- NestJS remains the planned API, recorded as a decision rather than implemented here. One concern per commit.
- Pending features written explicitly: accounts, payments, realtime updates.

## What was rejected or changed, and why

- Rejected a last-commit documentation dump. A review file has to sit inside the commit it describes. Adding reviews afterward breaks the one-to-one check.
- Rejected scaffolding both applications in this commit. That would be a bulk commit and would skip the schema milestone.
- Rejected inventing seed prices in the domain doc as if they were already data. The worked example is labeled as a formula illustration until the seed commit sets real cents.

## Reflection

- Decision: treat the five documents as living files that start honest and get edited, not as a closing essay.
- Alternative: a one-page README and empty doc stubs. Rejected because the assignment asks for approach, rules, and feature status, which can be stated now.
- Risk left open: later code can drift from these rules. Each feature commit has to edit the document that owns the rule it implements, or the drift becomes the record.
