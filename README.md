# Centralized Exchange (CEX) 

centralized exchange where the backend and engine communicate through Redis queues.

The backend does **not** perform order matching. It only accepts HTTP requests, sends commands to the engine through Redis, waits for the engine response, and returns the result to the client.

The engine owns the in-memory exchange state:

- balances
- order books
- orders
- fills

## Architecture

```txt
Frontend / API Client
        |
        v
Backend API (Express, port 3000)
        |
        v
Redis queue: backend-to-engine-broker
        |
        v
Engine process
        |
        v
Backend-specific response queue
        |
        v
Backend API Response
```

Every backend process creates its own response queue:

```ts
const RESPONSE_QUEUE = `response-queue-${BACKEND_QUEUE_ID}`;
```

Every message sent from the backend to the engine includes:

- `correlationId`
- `responseQueue`
- `type`
- `payload`

The engine must reply to `message.responseQueue` and include the same `correlationId`.

## Tech Stack

- TypeScript
- Bun
- Express
- Redis
- Prisma/Postgres
- JWT
- Zod

## Existing Code

### Backend

The backend is mostly complete. You should understand the flow, but you do not need to rewrite it.

Important files:

```txt
backend/src/index.ts
backend/src/routes/
backend/src/controllers/
backend/src/store/pending-responses.ts
backend/src/types/
backend/src/utils/engine-client.ts
backend/src/utils/auth.ts
backend/src/db.ts
```

### Engine

The engine has the Redis flow boilerplate and type definitions, but the exchange logic is intentionally incomplete.

Important files:

```txt
engine/src/index.ts
engine/src/store/exchange-store.ts
engine/src/utils/env.ts
```

## Redis Message Format

Backend to engine:

```ts
interface EngineRequest {
  correlationId: string;
  responseQueue: string;
  type:
    | "create_order"
    | "get_depth"
    | "get_user_balance"
    | "get_order"
    | "cancel_order";
  payload: Record<string, unknown>;
}
```

Engine to backend:

```ts
interface EngineResponse {
  correlationId: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}
```

## Required API Endpoints

### DB-only endpoints

These are implemented in the backend and directly use Postgres through Prisma.

#### `POST /signup`

Creates a user.

Body:

```json
{
  "username": "alice",
  "password": "password123"
}
```

#### `POST /signin`

Signs in a user and returns a JWT.


Body:

```json
{
  "username": "alice",
  "password": "password123"
}
```

### Engine-backed endpoints

All of these require:

```txt
Authorization: Bearer <jwt-token>
```

#### `POST /order`

Sends `create_order` to the engine.

Body:

```json
{
  "type": "limit",
  "side": "buy",
  "symbol": "BTC",
  "price": 100,
  "qty": 10
}
```

#### `GET /depth/:symbol`

Sends `get_depth` to the engine.

#### `GET /balance`

Sends `get_user_balance` to the engine.

#### `GET /order/:orderId`

Sends `get_order` to the engine.

#### `DELETE /order/:orderId`

Sends `cancel_order` to the engine.

