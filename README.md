# Mini Bookkeeping Tool

A hierarchical account system with automatic balance aggregation.

## Features

- Nested account hierarchy (parent/child relationships)
- Automatic parent balance calculation (sum of children)
- Balance adjustments cascade up the tree
- Interactive collapsible tree UI

## Tech Stack

**Backend:** Express + TypeScript + SQLite  
**Frontend:** React + Vite + TypeScript

## Quick Start

### Prerequisites

Node.js 18+ and Yarn

### Backend

```bash
cd backend
yarn install
yarn dev  # http://localhost:3001
```

### Frontend

```bash
cd frontend
yarn install
yarn dev  # http://localhost:3000
```

### Tests

```bash
cd backend
yarn test
```

## API

- `GET /api/accounts` - Get account tree
- `POST /api/accounts` - Create account
- `PATCH /api/accounts/:id/balance` - Adjust leaf balance (cascades to parents)

## Architecture

Balance cascade: When a leaf account is adjusted, parent balances are recalculated up to root. All updates wrapped in a transaction.

Code structure:

- `backend/src/routes.ts` - HTTP handlers
- `backend/src/services.ts` - Business logic
- `backend/src/utils.ts` - Tree building
- `frontend/src/components/` - React components

## Development Notes

Built in ~4 hours. Focused on clean code, working cascade logic, and testing core functionality.

### Node Version

This project uses **Node.js 20.19.0** due to `better-sqlite3` build
compatibility. Later Node versions had build issues with native bindings.
Given the 4-hour constraint, downgrading was more pragmatic than
troubleshooting.

Given more time, I would:

- Use a containerized database (PostgreSQL) instead of SQLite
- Or invest time in resolving the native build issues

## What I'd Add With More Time

### Backend

- **Database Layer:** Replace direct `better-sqlite3` queries with Knex or Prisma for schema management, migrations, and cleaner query composition
- **Validation:** Integrate Zod for request bodies and environment variables
- **Error Handling:** More granular error messages and consistent HTTP error responses
- **Documentation:** Auto-generate API docs with Swagger or OpenAPI
- **Testing:** Expand test coverage for edge cases (invalid inputs, concurrent updates)

### Frontend

- **Styling:** Adopt a design system (Tailwind, MUI) for consistency and responsive layout
- **Type Sharing:** Introduce a shared types package (`@common/types`) for frontend–backend contract alignment
- **User Experience:** Add confirmation modals, toasts, and inline validation for balance edits
- **Loading & Error States:** Improve feedback for slow requests and API errors
- **Frontend Testing:** Add Vitest + React Testing Library coverage for key components
- **Realtime Updates:** Use WebSockets for live balance synchronization between clients
