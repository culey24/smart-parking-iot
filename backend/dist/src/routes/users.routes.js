"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// Lấy danh sách users (Chỉ ADMIN)
router.get('/', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(['ADMIN']), async (req, res) => {
    try {
        const users = await User_1.User.find();
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Update user role
router.put('/:userId/role', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)(['ADMIN']), async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User_1.User.findOneAndUpdate({ userId: req.params.userId }, { role }, { new: true });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
