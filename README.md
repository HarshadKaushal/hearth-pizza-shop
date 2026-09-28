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

- Docker Desktop with Compose v2
- Git

Node.js 22 or newer and npm are required only if you run the API and the web app on the host instead of in Compose.

Ports on the host: `5432` (Postgres), `3001` (API), `3000` (web).

## Run the full stack

From the repository root:

```bash
docker compose up --build
```

The backend container applies the Prisma migrations and runs the seed before it listens. The seed upserts ingredients by name, so starting the stack again does not duplicate the menu. Anchovies are stored as unavailable.

Open http://localhost:3000.

1. Read the menu. Unavailable items say "Off the board."
2. Open Build. Choose a size, one crust, one sauce, one cheese, and any toppings up to eight.
3. Add the pizza and open Checkout. Pickup needs a name and a phone. Delivery also needs an address.
4. Place the order. The confirmation page lists each ingredient at the snapshotted price.
5. Open Kitchen. Move the ticket from Received to Preparing. Reload the confirmation page and the status matches.

Stop the stack with `Ctrl+C`, then:

```bash
docker compose down
```

`docker compose down -v` also deletes the database volume. The next start migrates and seeds again.

## Run on the host

Use this when you want the API and the web app outside Docker and only Postgres in Docker.

1. Start the database:

```bash
docker compose up -d postgres
```

2. From `backend/`:

```bash
copy .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

3. From `frontend/`:

```bash
copy .env.example .env.local
npm install
npm run dev
```

`GET http://localhost:3001/health` returns `{"status":"ok","database":"up"}` when Postgres answers, and `503` when it does not.

Checks that do not need a database:

```bash
cd backend
npm test
```

## Environment variables

Copy [.env.example](.env.example) for notes, [backend/.env.example](backend/.env.example) for the API, and [frontend/.env.example](frontend/.env.example) for the web app. Do not commit `.env` files.

| Name | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | Prisma connection. Inside Compose the host is `postgres`, not `localhost`. | `postgresql://hearth:hearth@localhost:5432/hearth?schema=public` |
| `FRONTEND_ORIGIN` | Browser origin allowed by API CORS | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API base URL used by the browser. It must be an address the user's machine can open. Compose bakes `http://localhost:3001` in at image build time. | `http://localhost:3001` |
| `API_URL` | API base URL used by Next.js when it renders on the server. Compose sets `http://backend:3001`. On the host, leave it unset. | `http://backend:3001` |

The browser cannot resolve the Compose service name `backend`. Server-rendered pages can. That split is why there are two API URL variables.

## API

- `GET /health` — database reachability. `200` when Postgres answers, `503` when it does not.
- `GET /ingredients` — every menu row, including unavailable items. `priceCents` is an integer. No dollar strings.
- `POST /orders` — places an order. The server recomputes the total. A quote that does not match returns `409` and `{ "serverTotalCents": <number> }` and writes nothing. Illegal pizzas return `400`.
- `GET /orders` — kitchen list, newest first, with pizzas and ingredient snapshots.
- `GET /orders/:id` — one order, or `404`.
- `PATCH /orders/:id/status` — body `{ "status": "PREPARING" }`. Illegal jumps return `409`. Terminal orders do not move.

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

- **Port 5432 already in use.** Another Postgres is bound to that port. Change the host mapping in `docker-compose.yml` (for example `"5433:5432"`) and, if you run Prisma on the host, set `DATABASE_URL` to that same host port. The container port stays `5432`. Containers still reach the database at `postgres:5432`.
- **Port 3000 or 3001 already in use.** Stop the host `npm run dev` / `npm run start` processes before `docker compose up`, or you will be talking to the wrong process.
- **`docker compose` is not recognized.** Install Docker Desktop and confirm `docker compose version` works. The command is `docker compose`, not `docker-compose`.
- **The menu says it cannot be loaded.** The web container is rendering on the server. `API_URL` must be `http://backend:3001` inside Compose. The browser calls `NEXT_PUBLIC_API_URL` (`http://localhost:3001`). If you change the API host port, rebuild the frontend image so the baked browser URL matches.
- **Container stays unhealthy.** Run `docker compose logs postgres`. A volume left by a different Postgres image is the usual cause. `docker compose down -v` and start again.
