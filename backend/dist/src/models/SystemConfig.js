"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfig = void 0;
const mongoose_1 = require("mongoose");
// 2. Nhúng Interface vào Schema
const SystemConfigSchema = new mongoose_1.Schema({
    settingKey: { type: String, required: true, unique: true },
    settingValue: { type: mongoose_1.Schema.Types.Mixed, required: true },
    description: { type: String },
}, { timestamps: true });
// 3. Export Model có gắn kèm Type
exports.SystemConfig = (0, mongoose_1.model)('SystemConfig', SystemConfigSchema);
