# Smart Parking System (IoT-SPMS1) - Local Dev Runner
# Usage:
#   make dev           → Chạy backend + frontend cùng lúc (local)
#   make backend       → Chỉ chạy backend (nodemon)
#   make frontend      → Chỉ chạy frontend (vite)
#   make db            → Chỉ khởi động MongoDB container
#   make seed          → Nạp dữ liệu giả vào DB
#   make test          → Chạy test backend + frontend
#   make test-backend  → Chạy test backend
#   make test-frontend → Chạy test frontend
#   make install       → Cài npm cho cả backend và frontend

.PHONY: dev backend frontend db seed test test-backend test-frontend install lint lint-fix format

# ── Màu terminal ──────────────────────────────────────────────────────────────
CYAN   := \033[0;36m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RESET  := \033[0m

# ── Dev (chạy local, không cần Docker) ────────────────────────────────────────
dev:
	@echo "$(CYAN)▶ Starting Backend + Frontend locally...$(RESET)"
	@echo "$(GREEN)✓ Backend:  http://localhost:8000$(RESET)"
	@echo "$(GREEN)✓ Frontend: http://localhost:5173$(RESET)"
	@trap 'kill 0' EXIT; \
	  cd backend  && npm run dev & \
	  cd frontend && npm run dev & \
	  wait

backend:
	@echo "$(CYAN)▶ Starting Backend (nodemon)...$(RESET)"
	cd backend && npm run dev

frontend:
	@echo "$(CYAN)▶ Starting Frontend (Vite)...$(RESET)"
	cd frontend && npm run dev

# ── MongoDB (chỉ DB chạy trong Docker) ────────────────────────────────────────
db:
	@echo "$(CYAN)▶ Starting MongoDB container only...$(RESET)"
	docker compose up -d mongodb
	@echo "$(GREEN)✓ MongoDB running at localhost:27017$(RESET)"

# ── Install dependencies ───────────────────────────────────────────────────────
install:
	@echo "$(CYAN)▶ Installing backend dependencies...$(RESET)"
	cd backend && npm install
	@echo "$(CYAN)▶ Installing frontend dependencies...$(RESET)"
	cd frontend && npm install

# ── Data & Logic ──────────────────────────────────────────────────────────────
seed:
	@echo "$(CYAN)▶ Seeding database (local)...$(RESET)"
	cd backend && npm run seed

# ── Testing ───────────────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	@echo "$(CYAN)▶ Running Backend Tests (Jest)...$(RESET)"
	cd backend && npm test

test-frontend:
	@echo "$(CYAN)▶ Running Frontend Tests (Vitest)...$(RESET)"
	cd frontend && npm run test

## lint: Run linting on all services
lint:
	@echo "$(CYAN)▶ Running Backend Linting...$(RESET)"
	cd backend && npm run lint
	@echo "$(CYAN)▶ Running Frontend Linting...$(RESET)"
	cd frontend && npm run lint

## lint:fix: Auto-fix linting issues
lint-fix:
	@echo "$(CYAN)▶ Auto-fixing Backend Lint...$(RESET)"
	cd backend && npm run lint:fix || true
	@echo "$(CYAN)▶ Auto-fixing Frontend Lint...$(RESET)"
	cd frontend && npm run lint:fix || true

## format: Run prettier formatting
format:
	@echo "$(CYAN)▶ Formatting Backend...$(RESET)"
	cd backend && npm run format
	@echo "$(CYAN)▶ Formatting Frontend...$(RESET)"
	cd frontend && npm run format
