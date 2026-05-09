# Smart Parking System (IoT-SPMS1) - Docker Runner
# Usage:
#   make up            → Khởi động tất cả services (background)
#   make down          → Dừng và xóa tất cả containers
#   make dev           → Khởi động tất cả services và xem logs
#   make restart       → Restart all services
#   make logs          → Xem logs từ tất cả containers
#   make seed          → Nạp dữ liệu giả vào DB (trong container backend)
#   make test          → Chạy test backend và frontend
#   make test-backend  → Chạy test backend
#   make test-frontend → Chạy test frontend

.PHONY: up down dev restart logs seed test test-backend test-frontend

# ── Màu terminal ──────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

# ── Lifecycle ─────────────────────────────────────────────────────────────────
up:
	@echo "$(CYAN)▶ Starting all services in Docker...$(RESET)"
	docker compose up -d
	@echo "$(CYAN)✓ Backend: http://localhost:8000$(RESET)"
	@echo "$(CYAN)✓ Frontend: http://localhost:5173$(RESET)"

down:
	@echo "$(CYAN)▶ Stopping and removing containers...$(RESET)"
	docker compose down

dev:
	@echo "$(CYAN)▶ Running all services with logs...$(RESET)"
	docker compose up

restart:
	@echo "$(CYAN)▶ Restarting services...$(RESET)"
	docker compose restart

logs:
	docker compose logs -f

# ── Data & Logic ──────────────────────────────────────────────────────────────
seed:
	@echo "$(CYAN)▶ Seeding database inside backend container...$(RESET)"
	docker compose exec backend npm run seed

# ── Testing ───────────────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	@echo "$(CYAN)▶ Running Backend Tests...$(RESET)"
	docker compose exec backend npm test

test-frontend:
	@echo "$(CYAN)▶ Running Frontend Tests (Vitest)...$(RESET)"
	docker compose exec frontend npm run test

test-frontend:
	@echo "$(CYAN)▶ Running Frontend Tests (Vitest)...$(RESET)"
	docker-compose exec frontend npm run test
