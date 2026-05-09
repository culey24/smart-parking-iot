"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    schoolCardId: { type: Number, unique: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'OPERATOR', 'USER', 'FINANCE_OFFICE'], default: 'USER' },
    email: { type: String, required: true, unique: true },
    userStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', UserSchema);
