"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const swagger_1 = require("./config/swagger");
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/reports', reports_routes_1.default);
// Admin API routes
app.use('/api/admin', admin_routes_1.default);
// 2. Khởi chạy giao diện Swagger (nên để trước các route chính)
(0, swagger_1.setupSwagger)(app);
// Main API routes
app.use('/api', routes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
