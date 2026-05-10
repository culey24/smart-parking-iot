# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Smart Parking IoT — full-stack system with Express/TS/MongoDB backend and React/Vite/Tailwind frontend. Runs via `docker-compose`.

## Commands

```bash
# Docker (root)
make up              # start all services (background)
make dev             # start all services with logs
make down            # stop all
make seed            # seed DB with test data

# Backend (cd backend)
npm run dev          # nodemon dev server :8000
npm run seed         # seed DB (one-shot)
npm test             # jest tests
npm run test:cov     # jest + coverage

# Frontend (cd frontend)
npm run dev          # vite dev server :5173
npm test             # vitest run
npm run test:watch   # vitest watch
```

**Docker volumes hide node_modules** — always rebuild after adding deps:
```bash
docker-compose up --build <service>
```

## Architecture

### Backend
- Express 5 + TypeScript + Mongoose (MongoDB)
- Route files in `src/routes/` — each domain has its own router
- Controllers in `src/controllers/` — thin, delegate to services
- Services in `src/services/` — business logic
- Models in `src/models/` — Mongoose schemas
- Middlewares: `authMiddleware` (JWT), `roleMiddleware` (RBAC), `errorHandler`, `requestLogger` (pino)
- CORS configured for `http://localhost:5173` and `http://frontend:5173` (Docker)
- Backend role values: `ADMIN`, `OPERATOR`, `USER`, `FINANCE_OFFICE`
- Auth: `POST /api/auth/login` accepts `{ schoolCardId }`, returns JWT + user
- IoT simulator background tasks: slots flip every 15s, devices every 45s, alerts generated every 2min

### Frontend
- React 18 + Vite + Tailwind v4 + Shadcn/ui
- Auth: `AuthContext.tsx` — `login(cardId)` calls real backend, maps backend roles to `LEARNER|FACULTY|OPERATOR|ADMIN|IT_TEAM|FINANCE|SUPER`
- API: `src/config/api.ts` — `apiFetch()` uses `VITE_API_URL` env (defaults to `http://localhost:8000`)
- Pages in `src/pages/`, components in `src/components/`, types in `src/types/`

### Key Patterns
- Backend responses: `{ success: boolean, data?, message? }` — not all controllers follow this consistently, watch for inconsistencies
- `authMiddleware` bypasses OPTIONS preflight — required for CORS
- `roleMiddleware` also bypasses OPTIONS defensively
- Logger: pino with pino-pretty in dev, logs every request + auth failures + errors