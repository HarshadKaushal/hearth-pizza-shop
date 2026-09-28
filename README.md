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

Postgres, the Prisma schema, the initial migration, and the ingredient seed. The HTTP API and the storefront are later milestones.

1. From the repository root, start Postgres:

```bash
docker compose up -d postgres
```

2. Wait until it is healthy:

```bash
docker compose ps
```

The `postgres` service should report `healthy`.

3. Point Prisma at that database and apply the migration and seed. From `backend/`:

```bash
copy .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

`npm run start` listens on port 3001. `GET http://localhost:3001/health` returns `{"status":"ok","database":"up"}` when Postgres is reachable, and `503` when it is not. Shop routes are not registered yet.

`migrate deploy` applies [backend/prisma/migrations](backend/prisma/migrations). The seed upserts 23 ingredients by name, so running it again updates prices instead of duplicating rows. Anchovies are stored as unavailable.

4. Stop the database when you are done:

```bash
docker compose down
```

`docker compose down -v` also deletes the data volume. Use that only when you want an empty database. After a volume wipe, run `npx prisma migrate deploy` and `npx prisma db seed` again.

## Storefront

From `frontend/`, with the API already running:

```bash
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The menu page reads `GET /ingredients`. Unavailable items are labeled "Off the board."

`/build` lets you pick a size, one crust, one sauce, one cheese, and up to eight toppings. Anchovies cannot be selected. The running total is a preview using the same bases as the API ($8, $12, $16 plus ingredient cents). `/checkout` asks for a name and phone, and an address when delivery is selected, then `POST`s the order with `quotedTotalCents`. A successful response navigates to `/orders/:id`. That page is not built yet, so the browser shows Next's 404 even though the order is stored.

## Environment variables

| Name | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | Prisma connection | `postgresql://hearth:hearth@localhost:5432/hearth?schema=public` |
| `FRONTEND_ORIGIN` | Browser origin allowed by API CORS | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API base URL baked into the web app | `http://localhost:3001` |

## Full stack

Not available yet. A later commit adds the NestJS API, the Next.js app, migrations, seed data, and Compose services for both apps. This section will then list the exact commands to migrate, seed, open the shop, and place an order.

## API

- `GET /health` — database reachability. `200` when Postgres answers, `503` when it does not.
- `GET /ingredients` — every menu row, including unavailable items. `priceCents` is an integer. No dollar strings.
- `POST /orders` — places an order. The server recomputes the total. A quote that does not match returns `409` and `{ "serverTotalCents": <number> }` and writes nothing. Illegal pizzas return `400`.
- `GET /orders` — kitchen list, newest first, with pizzas and ingredient snapshots.
- `GET /orders/:id` — one order, or `404`.
- `PATCH /orders/:id/status` — body `{ "status": "PREPARING" }`. Illegal jumps return `409`. Terminal orders do not move.

Pricing and status checks without the database:

```bash
cd backend
npm test
```

Example body for the medium pizza in the domain notes (`1700` cents). Replace the ids with values from `GET /ingredients`.

```json
{
  "customerName": "Ava Stone",
  "phone": "555-0100",
  "fulfillment": "PICKUP",
  "quotedTotalCents": 1700,
  "pizzas": [
    {
      "size": "MEDIUM",
      "ingredientIds": ["<crust>", "<sauce>", "<cheese>", "<pepperoni>", "<mushrooms>"]
    }
  ]
}
```

```bash
curl -X POST http://localhost:3001/orders -H "Content-Type: application/json" -d @order.json
```

## Troubleshooting

- **Port 5432 already in use.** Another Postgres is bound to that port. Change the host mapping in `docker-compose.yml` (for example `"5433:5432"`) and set `DATABASE_URL` to that same host port. The container port stays `5432`.
- **`docker compose` is not recognized.** Install Docker Desktop and confirm `docker compose version` works. The command is `docker compose`, not `docker-compose`.
- **Container stays unhealthy.** Run `docker compose logs postgres`. The usual cause is a volume left behind from a different Postgres image. `docker compose down -v` and start again.
