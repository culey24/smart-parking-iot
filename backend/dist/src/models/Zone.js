"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zone = void 0;
const mongoose_1 = require("mongoose");
const ZoneSchema = new mongoose_1.Schema({
    zoneId: { type: String, required: true, unique: true },
    zoneName: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentUsage: { type: Number, default: 0 },
}, { timestamps: true });
exports.Zone = (0, mongoose_1.model)('Zone', ZoneSchema);
