"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
class AuthController {
    static async login(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'userId is required' });
            }
            const result = await AuthService_1.AuthService.login(userId);
            return res.json({ success: true, data: result });
        }
        catch (error) {
            return res.status(401).json({ success: false, message: error.message });
            // can be improved by delegating to errorHandler?
        }
    }
    static async getProfile(req, res) {
        // req.user được gán từ authMiddleware
        return res.json({ success: true, data: req.user });
    }
}
exports.AuthController = AuthController;
