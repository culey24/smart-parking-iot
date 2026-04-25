# Smart Parking System (IoT-SPMS1) - Dev runner
# Usage:
#   make dev          → Khởi động DB + Backend + Frontend
#   make db           → Chạy MongoDB qua docker-compose
#   make backend      → Chạy riêng Backend (ExpressJS :3000)
#   make frontend     → Chạy riêng Frontend (Vite :5173)
#   make seed         → Nạp dữ liệu giả vào DB
#   make stop-db      → Dừng DB containers
#   make logs-db      → Xem log DB

.PHONY: dev db backend frontend seed stop-db logs-db

# ── Paths ─────────────────────────────────────────────────────────────────────
BACKEND_DIR := backend
FRONTEND_DIR := frontend

# ── Màu terminal ──────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

# ── DB ────────────────────────────────────────────────────────────────────────
db:
	@echo "$(CYAN)▶ Khởi động MongoDB...$(RESET)"
	cd $(BACKEND_DIR) && docker-compose up -d || \
	  (echo "$(CYAN)⚠ DB có thể đang chạy rồi — kiểm tra: docker ps$(RESET)" && true)
	@echo "$(CYAN)✓ DB: mongodb://localhost:27017/smart-parking$(RESET)"

stop-db:
	cd $(BACKEND_DIR) && docker-compose stop

logs-db:
	cd $(BACKEND_DIR) && docker-compose logs -f

seed:
	@echo "$(CYAN)▶ Seeding database...$(RESET)"
	cd $(BACKEND_DIR) && npm run seed

# ── Individual services ───────────────────────────────────────────────────────
backend:
	@echo "$(CYAN)▶ Backend (ExpressJS :3000) — $(BACKEND_DIR)$(RESET)"
	cd $(BACKEND_DIR) && npm run dev

frontend:
	@echo "$(CYAN)▶ web-frontend (Vite :5173) — $(FRONTEND_DIR)$(RESET)"
	cd $(FRONTEND_DIR) && npm run dev

# ── Dev: toàn bộ trong 1 lệnh ─────────────────────────────────────────────────
# Dùng & để chạy song song, trap để dừng sạch khi Ctrl+C
dev: db
	@echo "$(CYAN)▶ Khởi động tất cả services (Backend :3000, Frontend :5173)...$(RESET)"
	@echo "$(CYAN)  Nhấn Ctrl+C để dừng tất cả$(RESET)"
	@trap 'kill 0' SIGINT; \
	  (cd $(BACKEND_DIR) && npm run dev 2>&1 | sed "s/^/[backend] /") & \
	  (cd $(FRONTEND_DIR) && npm run dev 2>&1 | sed "s/^/[frontend] /") & \
	  wait
