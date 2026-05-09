"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gate = void 0;
const mongoose_1 = require("mongoose");
const GateSchema = new mongoose_1.Schema({
    gateId: { type: String, required: true, unique: true },
    gateName: { type: String, required: true },
    gateType: { type: String, enum: ['IN', 'OUT'], required: true },
    location: { type: String },
}, { timestamps: true });
exports.Gate = (0, mongoose_1.model)('Gate', GateSchema);
