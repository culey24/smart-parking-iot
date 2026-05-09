"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EntryExitController_1 = require("../controllers/EntryExitController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Endpoint for gateway devices or operators to trigger check-in
router.post('/check-in', EntryExitController_1.EntryExitController.checkIn);
// Endpoint cho xe ra
router.post('/check-out', EntryExitController_1.EntryExitController.checkOut);
// Admin open gate manually (Sửa lại: Kẹp authMiddleware và trỏ về Controller)
router.post('/open', authMiddleware_1.authMiddleware, EntryExitController_1.EntryExitController.openGate);
exports.default = router;
