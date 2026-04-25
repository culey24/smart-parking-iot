# Routes Module
Nơi khai báo các API routes (`router.get`, `router.post`).
Chia thành nhiều file ứng với mỗi Domain/Task:
- `auth.routes.ts` & `users.routes.ts`
- `gate.routes.ts` & `cards.routes.ts`
- `billing.routes.ts` & `reconciliation.routes.ts`
- `iot.routes.ts` & `alerts.routes.ts`
- `dashboard.routes.ts` & `monitoring.routes.ts`
- `admin.routes.ts` (Config, Pricing, Audit)
- `reports.routes.ts`
- `index.ts`: File gom tất cả các router lại và gắn vào app.
