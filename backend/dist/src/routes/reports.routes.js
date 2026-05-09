"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_1 = require("../controllers/ReportController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Báo cáo thì ADMIN và FINANCE_OFFICE đều có thể xem được
const reportAuth = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(['ADMIN', 'FINANCE_OFFICE'])];
router.get('/daily-revenue', reportAuth, ReportController_1.ReportController.getDailyRevenueReport);
exports.default = router;
