"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureAlert = void 0;
const mongoose_1 = require("mongoose");
const InfrastructureAlertSchema = new mongoose_1.Schema({
    deviceId: { type: String, required: true },
    alertType: { type: String, enum: ['OFFLINE', 'ERROR', 'WARNING'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
exports.InfrastructureAlert = (0, mongoose_1.model)('InfrastructureAlert', InfrastructureAlertSchema);
