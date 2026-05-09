"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', AuthController_1.AuthController.login);
router.get('/profile', authMiddleware_1.authMiddleware, AuthController_1.AuthController.getProfile);
exports.default = router;
