# Hearth

Hearth is a single-shop pizza counter. A customer can read the ingredient list and prices, build one or more pizzas, and place a pickup or delivery order. The kitchen can see those orders and move them through a status line.

The API owns prices. The browser may show a preview, but a stored order total is always recomputed on the server.

## Repository map

| Document | What it answers |
| --- | --- |
| [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | How the system is built, which decisions were made, and what each milestone commit introduced |
| [docs/FEATURES.md](docs/FEATURES.md) | What is completed, only partly done, or still pending |
| [docs/DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md) | The engineering approach and the boundaries the code is not allowed to cross |
| [docs/BUSINESS_DOMAIN.md](docs/BUSINESS_DOMAIN.md) | Assumptions, shop rules, and the order of decision logic |
| [docs/ai-reviews/](docs/ai-reviews/) | One review file per commit: what the assistant suggested, what was kept, and what was turned down |

## Prerequisites

- Docker Desktop (Compose v2)
- Node.js 22 or newer and npm, once the API and web app exist in this repo
- Git

Ports used on the host: `5432` (Postgres), later `3001` (API) and `3000` (web).

## What you can run right now

Only the database is in the tree. The API, the storefront, and the full Compose stack are later milestones. Do not expect `npm start` to work yet.

1. From the repository root, start Postgres:

```bash
docker compose up -d postgres
```

2. Wait until it is healthy:

```bash
docker compose ps
```

The `postgres` service should report `healthy`. Connection string for later tools:

```text
postgresql://hearth:hearth@localhost:5432/hearth?schema=public
```

The same values are in [.env.example](.env.example). Copy that file to `.env` when a tool needs it. Do not commit `.env`.

3. Stop the database when you are done:

```bash
docker compose down
```

`docker compose down -v` also deletes the data volume. Use that only when you want an empty database.

## Environment variables

| Name | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | Prisma connection | `postgresql://hearth:hearth@localhost:5432/hearth?schema=public` |
| `FRONTEND_ORIGIN` | Browser origin allowed by API CORS | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API base URL baked into the web app | `http://localhost:3001` |

## Full stack

Not available yet. A later commit adds the NestJS API, the Next.js app, migrations, seed data, and Compose services for both apps. This section will then list the exact commands to migrate, seed, open the shop, and place an order.

## API

No HTTP API yet. Planned routes, owned by the server:

- `GET /health`
- `GET /ingredients`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`

## Troubleshooting

- **Port 5432 already in use.** Another Postgres is bound to that port. Stop it, or change the host port in `docker-compose.yml` and the host in `DATABASE_URL` together.
- **`docker compose` is not recognized.** Install Docker Desktop and confirm `docker compose version` works. The command is `docker compose`, not `docker-compose`.
- **Container stays unhealthy.** Run `docker compose logs postgres`. The usual cause is a volume left behind from a different Postgres image. `docker compose down -v` and start again.
