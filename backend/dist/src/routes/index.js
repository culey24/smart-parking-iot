"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const users_routes_1 = __importDefault(require("./users.routes"));
const gate_routes_1 = __importDefault(require("./gate.routes"));
const cards_routes_1 = __importDefault(require("./cards.routes"));
const billing_routes_1 = __importDefault(require("./billing.routes"));
const reconciliation_routes_1 = __importDefault(require("./reconciliation.routes"));
const iot_routes_1 = __importDefault(require("./iot.routes"));
const alerts_routes_1 = __importDefault(require("./alerts.routes"));
// 1. IMPORT ROUTES CỦA TASK 7 VÀO ĐÂY
const admin_routes_1 = __importDefault(require("./admin.routes"));
const reports_routes_1 = __importDefault(require("./reports.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/gates', gate_routes_1.default);
router.use('/cards', cards_routes_1.default);
router.use('/billing', billing_routes_1.default);
router.use('/reconciliation', reconciliation_routes_1.default);
router.use('/iot', iot_routes_1.default);
router.use('/alerts', alerts_routes_1.default);
// 2. CẮM ĐƯỜNG DẪN CỦA TASK 7 VÀO MAIN ROUTER
router.use('/admin', admin_routes_1.default);
router.use('/reports', reports_routes_1.default);
exports.default = router;
