"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SystemAdminController_1 = require("../controllers/SystemAdminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware"); // <-- Import thêm cái này
const router = (0, express_1.Router)();
// Riêng phần Pricing thì cho cả Admin và Finance đụng vào
const pricingAuth = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(['ADMIN', 'FINANCE_OFFICE'])];
// Phần cấu hình hệ thống (Config) thường chỉ dành cho Admin tổng
const configAuth = [authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(['ADMIN'])];
router.get('/config', configAuth, SystemAdminController_1.SystemAdminController.getAllConfigs);
router.get('/pricing', pricingAuth, SystemAdminController_1.SystemAdminController.getPricing);
router.get('/logs', authMiddleware_1.authMiddleware, SystemAdminController_1.SystemAdminController.getLogs);
router.put('/config', configAuth, SystemAdminController_1.SystemAdminController.updateConfig);
router.put('/pricing', pricingAuth, SystemAdminController_1.SystemAdminController.updatePricing);
exports.default = router;
