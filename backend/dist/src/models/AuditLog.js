"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const AuditLogSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    action: { type: String, required: true },
    targetResource: { type: String },
    details: { type: mongoose_1.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
exports.AuditLog = (0, mongoose_1.model)('AuditLog', AuditLogSchema);
