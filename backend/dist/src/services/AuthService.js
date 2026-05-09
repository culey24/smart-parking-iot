"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
class AuthService {
    static async login(userId) {
        // Giả lập SSO login: Nếu userId tồn tại trong DB, cấp token.
        const user = await User_1.User.findOne({ userId });
        if (!user) {
            throw new Error('User not found');
        }
        const payload = {
            userId: user.userId,
            role: user.role,
            fullName: user.fullName
        };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return { token, user };
    }
}
exports.AuthService = AuthService;
