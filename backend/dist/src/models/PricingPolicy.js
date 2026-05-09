"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingPolicy = void 0;
const mongoose_1 = require("mongoose");
const PricingPolicySchema = new mongoose_1.Schema({
    vehicleType: { type: String, enum: ['MOTORBIKE', 'CAR', 'BICYCLE'], required: true },
    dayRate: { type: Number, required: true },
    nightOrSundayRate: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    effectiveDate: { type: Date, default: Date.now },
}, { timestamps: true });
exports.PricingPolicy = (0, mongoose_1.model)('PricingPolicy', PricingPolicySchema);
