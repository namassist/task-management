# Task Management System — Backend

REST API for managing tasks, built with **Express.js**, **TypeScript**, **Drizzle ORM**, and **MySQL**.

## Prerequisites

- **Node.js** 20+
- **pnpm** 10.6.5
- **MySQL** 8.0+

## Quick Start

### 1. Install dependencies

From the project root (monorepo):

```bash
pnpm install
```

Or install backend-only:

```bash
pnpm --filter backend install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=mysql://root:password@localhost:3306/task_management_system
FRONTEND_ORIGIN=http://localhost:3000
PORT=3001
```

> `DATABASE_URL` must be a valid `mysql://` URL.
> `FRONTEND_ORIGIN` is used for CORS — set to your frontend URL.

### 3. Create the database

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_management_system;"
```

### 4. Run migrations

Push the schema directly to the database:

```bash
pnpm --filter backend db:push
```

Or generate and run migration files:

```bash
pnpm --filter backend db:generate
pnpm --filter backend db:migrate
```

### 5. (Optional) Seed dummy data

Insert 100 sample tasks for development:

```bash
pnpm --filter backend db:seed
```

### 6. Run tests

```bash
pnpm --filter backend test
```

### 7. Start the development server

From the project root:

```bash
pnpm dev:backend
```

Or from the `backend/` directory:

```bash
pnpm dev
```

Server runs at **http://localhost:3001**.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with tsx (port 3001) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled server from `dist/` |
| `pnpm test` | Run Jest test suite with coverage |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:push` | Push schema directly to database |
| `pnpm db:seed` | Seed 100 dummy tasks |

## Project Structure

```
backend/
├── src/
│   ├── server.ts                 # HTTP server entrypoint + graceful shutdown
│   ├── app.ts                    # Express app factory with middleware stack
│   ├── config/
│   │   └── env.ts                # Zod-validated environment configuration
│   ├── db/
│   │   ├── schema.ts             # Drizzle ORM schema (tasks table)
│   │   ├── index.ts              # MySQL connection pool (mysql2)
│   │   └── seed.ts               # Dummy data seeder (100 tasks)
│   ├── docs/
│   │   └── openapi.ts            # OpenAPI 3.0.3 specification
│   ├── lib/
│   │   ├── http-errors.ts        # Error classes (AppError, NotFoundError, etc.)
│   │   ├── validator.ts          # Zod validation middleware (body/params/query)
│   │   └── logger.ts             # Winston logger
│   ├── middleware/
│   │   ├── cors.ts               # CORS (FRONTEND_ORIGIN allowlist)
│   │   ├── error-handler.ts      # Centralized error handler
│   │   ├── not-found.ts          # 404 handler
│   │   ├── rate-limit.ts         # Rate limiting (mutations only)
│   │   ├── request-id.ts         # X-Request-Id header (UUID)
│   │   └── request-logger.ts     # Request/response logging with duration
│   ├── modules/
│   │   └── tasks/
│   │       ├── tasks.controller.ts   # HTTP request handlers
│   │       ├── tasks.service.ts      # Business logic layer
│   │       ├── tasks.repository.ts   # Data access layer (Drizzle ORM)
│   │       ├── tasks.schemas.ts      # Zod validation schemas
│   │       └── tasks.types.ts        # TypeScript type definitions
│   ├── routes/
│   │   ├── tasks.routes.ts       # Task CRUD routes
│   │   ├── health.ts             # Health check endpoint
│   │   └── docs.ts               # Swagger UI
│   └── types/
│       └── express.d.ts          # Express Request type augmentation
├── tests/
│   ├── setup.ts                  # Test harness (supertest + DB cleanup)
│   └── tasks.test.ts             # 21 integration tests
├── drizzle/                      # Generated migration files
├── drizzle.config.ts             # Drizzle Kit configuration
├── jest.config.js                # Jest configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variable template
└── package.json
```

## Architecture

The backend follows a **layered architecture** pattern:

```
Route → Controller → Service → Repository → Database
```

| Layer | Responsibility |
|-------|---------------|
| **Route** | URL matching, validation middleware wiring |
| **Controller** | Extract HTTP params, delegate to service, send response |
| **Service** | Business logic (existence checks, error handling) |
| **Repository** | Data access (Drizzle ORM queries, row-to-domain mapping) |

## API Reference

### Base URL

```
http://localhost:3001
```

### Interactive Docs

Swagger UI available at **http://localhost:3001/docs**

### Endpoints

#### List tasks

```
GET /tasks
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (min 1) |
| `limit` | number | `10` | Items per page (1–100) |
| `sort_by` | string | `created_at` | Sort field: `created_at`, `due_date`, or `title` |
| `order` | string | `desc` | Sort direction: `asc` or `desc` |
| `status` | string | — | Filter by status: `Pending` or `Completed` (omit for all) |

**Response `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "due_date": "2026-04-15",
      "status": "Pending",
      "created_at": "2026-04-09T09:00:00.000Z",
      "updated_at": null
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Create a task

```
POST /tasks
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | 1–255 characters |
| `description` | string \| null | No | Max 5000 characters (defaults to null) |
| `due_date` | string | Yes | `YYYY-MM-DD` format |
| `status` | string | Yes | `Pending` or `Completed` |

**Response `201`:**

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "due_date": "2026-04-15",
  "status": "Pending",
  "created_at": "2026-04-09T09:30:00.000Z",
  "updated_at": null
}
```

#### Update a task (full)

```
PUT /tasks/:id
```

All fields are required. Same body format as create.

**Response `200`:** Updated task object.

#### Update task status (partial)

```
PATCH /tasks/:id
```

**Request Body:**

```json
{ "status": "Completed" }
```

Only the `status` field is accepted. Any other fields will be rejected.

**Response `200`:** Updated task object.

#### Delete a task

```
DELETE /tasks/:id
```

**Response `200`:**

```json
{ "message": "Task deleted successfully" }
```

#### Health check

```
GET /health
```

**Response `200`:**

```json
{ "status": "ok" }
```

### Error Responses

All errors return JSON:

```json
{ "message": "Error description" }
```

Validation errors include field details:

```json
{
  "message": "Validation error",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| 400 | Invalid request body or validation failure |
| 404 | Task not found or unknown route |
| 429 | Rate limit exceeded (100 mutations/min per IP) |
| 500 | Internal server error |

## Data Model

**Task:**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | Nullable |
| `due_date` | DATE | NOT NULL |
| `status` | ENUM('Pending','Completed') | NOT NULL, DEFAULT 'Pending' |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE |

## Middleware

| Middleware | Purpose |
|-----------|---------|
| Request ID | Assigns UUID to each request (`X-Request-Id` header) |
| Request Logger | Logs method, path, status code, and response time (Winston) |
| JSON Parser | Parses request body (16KB limit) |
| CORS | Allows requests from `FRONTEND_ORIGIN` only |
| Rate Limiter | 100 mutation requests/min per IP (skips GET/HEAD/OPTIONS) |
| Error Handler | Catches all errors and returns consistent JSON responses |
| Not Found | Returns 404 JSON for unmatched routes |

## Testing

21 integration tests covering:

- CRUD happy paths (create, list, update, patch, delete)
- Pagination (default limit, custom limit, page navigation)
- Sorting (by due_date and status, ascending and descending)
- Validation errors (empty fields, invalid formats, unknown fields, missing required fields)
- 404 handling (non-existent task IDs, unknown routes)
- Database verification (task actually removed after delete)

Run tests:

```bash
pnpm test
```

Run with coverage report (output in `coverage/`):

```bash
pnpm test
```

> Tests use the same MySQL database. Each test suite truncates the `tasks` table before running (`beforeEach`) and cleans up after all tests (`afterAll`).

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | MySQL connection string (`mysql://user:pass@host:port/db`) |
| `FRONTEND_ORIGIN` | Yes | — | Allowed origin for CORS (`http://localhost:3000`) |
| `PORT` | No | `3001` | Server port (1–65535) |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 4.21 | HTTP framework |
| TypeScript | 5.8 | Type safety |
| Drizzle ORM | 0.45 | MySQL query builder |
| mysql2 | 3.20 | MySQL driver |
| Zod | 3.24 | Request validation |
| Winston | 3.19 | Structured logging |
| Jest | 30.3 | Testing framework |
| Supertest | 7.2 | HTTP integration testing |
| Biome | 2.4 | Linter & formatter |
