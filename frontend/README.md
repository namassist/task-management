# Task Management System — Frontend

Kanban board interface for managing tasks, built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Prerequisites

- **Node.js** 20+
- **pnpm** 10.6.5
- Backend running at `http://localhost:3001`

## Quick Start

### 1. Install dependencies

From the project root (monorepo):

```bash
pnpm install
```

Or install frontend-only:

```bash
pnpm --filter frontend install
```

### 2. Configure environment

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

> Set this to your backend URL. Defaults to `http://localhost:3001` if not configured.

### 3. Start the development server

From the project root:

```bash
pnpm dev:frontend
```

Or from the `frontend/` directory:

```bash
pnpm dev
```

App runs at **http://localhost:3000**.

### 4. Build for production

```bash
pnpm --filter frontend build
```

Output in `dist/`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server (port 3000) |
| `pnpm build` | Type-check + build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Run Biome linter with auto-fix |
| `pnpm format` | Format code with Biome |

## Project Structure

```
frontend/
├── index.html                            # HTML entry point
├── vite.config.ts                        # Vite config (port 3000, path alias @/)
├── tsconfig.json                         # TypeScript strict + bundler mode
├── .env.example                          # Environment variable template
├── src/
│   ├── main.tsx                          # React root mount
│   ├── App.tsx                           # Root component
│   ├── index.css                         # Tailwind 4 + Catppuccin Frappé theme
│   ├── api/
│   │   └── tasks.ts                      # API client — all HTTP calls to backend
│   ├── store/
│   │   └── task-store.ts                 # Zustand store with persist middleware
│   ├── types/
│   │   └── task.ts                       # TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts                      # cn() helper (clsx + tailwind-merge)
│   └── components/
│       ├── board/                        # Core feature components
│       │   ├── KanbanBoard.tsx           # Main board — view modes, DnD, state orchestration
│       │   ├── KanbanColumn.tsx          # Single column — infinite scroll, drag & drop
│       │   └── TaskCard.tsx              # Individual card — inline rename, actions
│       ├── forms/
│       │   └── TaskFormDialog.tsx        # Create/Edit dialog with validation
│       ├── common/
│       │   ├── ConfirmDialog.tsx         # Reusable confirmation dialog
│       │   └── EmptyState.tsx            # Empty column placeholder
│       └── ui/                           # Reusable UI primitives (shadcn-style)
│           ├── button.tsx                # Button with 6 variants + 4 sizes
│           ├── card.tsx                  # Card, CardHeader, CardTitle, etc.
│           ├── badge.tsx                 # Badge component
│           ├── dialog.tsx                # Radix Dialog (overlay, content, header, footer)
│           ├── input.tsx                 # Styled input
│           ├── label.tsx                 # Radix Label
│           ├── select.tsx                # Radix Select (trigger, content, item, etc.)
│           └── textarea.tsx              # Styled textarea
```

## Architecture

### Component Hierarchy

```
App
 └── KanbanBoard
      ├── Toolbar (Create button, view mode toggle, sort menu, status filter)
      ├── DragDropContext
      │    ├── Single mode → KanbanColumn "All Tasks" (no drag)
      │    └── Multiple mode → KanbanColumn "Pending" + KanbanColumn "Completed"
      │         └── TaskCard[] (Draggable)
      └── TaskFormDialog (create/edit)
```

### State Management

Zustand store with `persist` middleware (saves `viewMode` to localStorage):

| State | Description |
|-------|-------------|
| `viewMode` | `'multiple'` or `'single'` — persisted |
| `single` | Tasks + pagination + loading state for single list mode |
| `pendingColumn` | Tasks + pagination + loading state for Pending column |
| `completedColumn` | Tasks + pagination + loading state for Completed column |
| `error` | Global error message |

### Data Flow

```
User Action → Component → Zustand Store → API Client → Backend
                                                         │
Component ← React re-render ← Store updates ← Response ←┘
```

## Features

### View Modes

Toggle between two modes via icon buttons in the toolbar:

| Mode | Description |
|------|-------------|
| **Multiple** (default) | Two columns — Pending and Completed. Each column has its own API source (filtered by `status`). Supports drag & drop between columns. Infinite scroll per column. |
| **Single** | One list with all tasks. Filter by status (All / Pending / Completed). No drag & drop. Infinite scroll. |

### Sorting

Server-side sorting applies to both modes via global sort menu:

| Option | Sort By | Order |
|--------|---------|-------|
| Newest | `created_at` | `desc` |
| Oldest | `created_at` | `asc` |
| Due Date (Newest) | `due_date` | `desc` |
| Due Date (Oldest) | `due_date` | `asc` |
| Title (A-Z) | `title` | `asc` |

### Task CRUD

| Operation | Trigger |
|-----------|---------|
| **Create** | "Create Task" button → opens full form dialog (title, description, due date, status) |
| **Edit** | Pencil icon on card → opens form dialog pre-filled with task data |
| **Inline rename** | Click task title → edit inline → Enter/blur to save, Escape to cancel |
| **Toggle status** | Complete/Reopen button on card (or drag to other column in multiple mode) |
| **Delete** | Trash icon on card |

### Drag & Drop (Multiple mode only)

- Drag tasks between Pending ↔ Completed columns
- Dragged task moves to top of destination column
- Visual feedback: card rotates and scales, destination column highlights
- Grip icon (⠿) as drag handle

### Infinite Scroll

Both modes use `IntersectionObserver` to detect when user scrolls near the bottom and automatically fetch the next page (20 tasks per page).

### Form Validation (TaskFormDialog)

| Field | Rules |
|-------|-------|
| Title | Required, 1–255 characters |
| Description | Optional, max 5000 characters |
| Due Date | Required, cannot be in the past |
| Status | Required — Pending or Completed |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:3001` | Backend API base URL |

## Design System

| Aspect | Detail |
|--------|--------|
| Theme | Catppuccin Frappé (dark) |
| Colors | 26 CSS custom properties (`--ctp-*`) |
| Typography | Space Grotesk (system fallback: Avenir Next, Segoe UI) |
| Radius | Consistent 20–28px border-radius throughout |
| Shadows | 4 levels: app, column, card, card-hover |
| Background | Radial gradients with mesh overlay |
| Glassmorphism | `backdrop-filter: blur()` on panels and dialogs |
| Scrollbar | Custom styled (webkit) |
| Accessibility | Focus rings (`ring-ctp-mauve`), `prefers-reduced-motion` support, `aria-label` on interactive elements |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI library |
| TypeScript | 5.6 | Type safety |
| Vite | 5.4 | Build tool + dev server |
| Tailwind CSS | 4.0 | Utility-first styling |
| Zustand | 4.5 | State management + persist |
| @hello-pangea/dnd | 18.0 | Drag and drop |
| Radix UI | — | Accessible primitives (Dialog, Select, Label) |
| Lucide React | 1.7 | Icon library |
| class-variance-authority | 0.7 | Component variant system |
| clsx + tailwind-merge | — | Conditional class merging |
| Biome | 2.4 | Linter & formatter |
