"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CardController_1 = require("../controllers/CardController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Endpoint tra cứu thẻ
router.get('/lookup', CardController_1.CardController.lookup);
// Endpoint vô hiệu hóa thẻ (Cần có quyền Admin/Operator)
router.put('/:id/disable', authMiddleware_1.authMiddleware, CardController_1.CardController.disableCard);
exports.default = router;
