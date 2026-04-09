# Task Management System

Full-stack task management application with a **Node.js/Express** backend and **React** frontend, stored in a pnpm monorepo.

## Prerequisites

- **Node.js** 20+
- **pnpm** 10.6.5
- **MySQL** 8.0+

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd tasks-management-system
pnpm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your MySQL credentials:

```env
DATABASE_URL=mysql://root:password@localhost:3306/task_management_system
FRONTEND_ORIGIN=http://localhost:3000
PORT=3001
```

`frontend/.env` works with defaults:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Create database and run migrations

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_management_system;"
pnpm --filter backend db:push
```

### 4. (Optional) Seed sample data

```bash
pnpm --filter backend db:seed
```

### 5. Run tests

```bash
pnpm --filter backend test
```

### 6. Start development servers

```bash
pnpm dev:backend
pnpm dev:frontend
```

- Backend: **http://localhost:3001**
- Frontend: **http://localhost:3000**
- Swagger UI: **http://localhost:3001/docs**

## Project Structure

```
tasks-management-system/
├── package.json              # Root workspace scripts
├── pnpm-workspace.yaml       # pnpm monorepo config
├── biome.json                # Shared linter/formatter config
├── .editorconfig             # Editor formatting rules
├── .gitignore
├── api-docs.json             # OpenAPI 3.0.3 specification (JSON)
├── backend/                  # Express + TypeScript REST API
│   ├── src/
│   │   ├── server.ts         # HTTP server + graceful shutdown
│   │   ├── app.ts            # Express app + middleware stack
│   │   ├── config/env.ts     # Zod-validated env config
│   │   ├── db/               # Drizzle ORM schema, connection, seeder
│   │   ├── docs/openapi.ts   # OpenAPI spec (TypeScript object)
│   │   ├── lib/              # Error classes, validation, logger
│   │   ├── middleware/       # CORS, rate-limit, error handler, etc.
│   │   ├── modules/tasks/    # Controller → Service → Repository
│   │   └── routes/           # Route definitions
│   ├── tests/                # Jest + Supertest integration tests
│   ├── drizzle/              # Generated migration files
│   └── README.md             # Backend documentation
└── frontend/                 # React + TypeScript + Vite
    ├── src/
    │   ├── api/tasks.ts      # API client
    │   ├── store/            # Zustand state management
    │   ├── components/
    │   │   ├── board/        # KanbanBoard, KanbanColumn, TaskCard
    │   │   ├── forms/        # TaskFormDialog
    │   │   ├── common/       # EmptyState, ConfirmDialog
    │   │   └── ui/           # Reusable primitives (shadcn-style)
    │   └── types/task.ts     # TypeScript interfaces
    └── README.md             # Frontend documentation
```

## Workspace Scripts

### From project root

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies (both packages) |
| `pnpm dev:backend` | Start backend dev server (port 3001) |
| `pnpm dev:frontend` | Start frontend dev server (port 3000) |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Check and auto-fix with Biome |
| `pnpm format` | Format code with Biome |

### Backend commands

| Command | Description |
|---------|-------------|
| `pnpm --filter backend dev` | Start dev server |
| `pnpm --filter backend build` | Compile TypeScript to `dist/` |
| `pnpm --filter backend start` | Run compiled server |
| `pnpm --filter backend test` | Run Jest test suite (30 tests) |
| `pnpm --filter backend db:generate` | Generate Drizzle migration files |
| `pnpm --filter backend db:migrate` | Run pending migrations |
| `pnpm --filter backend db:push` | Push schema to database |
| `pnpm --filter backend db:seed` | Seed 100 sample tasks |

### Frontend commands

| Command | Description |
|---------|-------------|
| `pnpm --filter frontend dev` | Start Vite dev server |
| `pnpm --filter frontend build` | Type-check + production build |
| `pnpm --filter frontend preview` | Preview production build |

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Express 4.21 | HTTP framework |
| TypeScript 5.8 | Type safety |
| Drizzle ORM 0.45 | MySQL query builder |
| mysql2 | MySQL driver |
| Zod 3.24 | Request validation |
| Winston 3.19 | Structured logging |
| Jest 30 + Supertest 7 | Integration testing |
| Biome 2.4 | Linter & formatter |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18.3 | UI library |
| TypeScript 5.6 | Type safety |
| Vite 5.4 | Build tool + dev server |
| Tailwind CSS 4.0 | Utility-first styling |
| Zustand 4.5 | State management + persist |
| @hello-pangea/dnd 18.0 | Drag and drop |
| Radix UI | Accessible primitives |
| Lucide React 1.7 | Icon library |

## API Reference

Base URL: `http://localhost:3001`

Interactive docs: **http://localhost:3001/docs**

Full OpenAPI spec: `api-docs.json` in project root.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List tasks (paginated, sortable, filterable) |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Full update a task |
| `PATCH` | `/tasks/:id` | Update task status only |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/health` | Health check |

### GET /tasks — Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (min 1) |
| `limit` | number | `10` | Items per page (1–100) |
| `sort_by` | string | `created_at` | `created_at`, `due_date`, or `title` |
| `order` | string | `desc` | `asc` or `desc` |
| `status` | string | — | `Pending` or `Completed` (omit for all) |

### Task Object

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "due_date": "2026-04-15",
  "status": "Pending",
  "created_at": "2026-04-09T09:00:00.000Z",
  "updated_at": null
}
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | MySQL connection string |
| `FRONTEND_ORIGIN` | Yes | — | CORS allowed origin |
| `PORT` | No | `3001` | Server port |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:3001` | Backend API URL |
