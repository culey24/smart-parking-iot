"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporaryCard = void 0;
const mongoose_1 = require("mongoose");
const TemporaryCardSchema = new mongoose_1.Schema({
    cardId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['AVAILABLE', 'IN_USE', 'LOST'], default: 'AVAILABLE' },
    lastAssignedTo: { type: String }, // Plate number or Session ID
}, { timestamps: true });
exports.TemporaryCard = (0, mongoose_1.model)('TemporaryCard', TemporaryCardSchema);
