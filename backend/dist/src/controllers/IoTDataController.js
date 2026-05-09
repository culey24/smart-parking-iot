"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoTDataController = void 0;
const Zone_1 = require("../models/Zone");
const InfrastructureAlert_1 = require("../models/InfrastructureAlert");
exports.IoTDataController = {
    webhook: async (req, res, next) => {
        try {
            const { zoneId, status } = req.body;
            if (!zoneId || !status) {
                res.status(400).json({ message: 'zoneId and status are required' });
                return;
            }
            const increment = status === 'ENTRY' ? 1 : status === 'EXIT' ? -1 : 0;
            if (increment !== 0) {
                await Zone_1.Zone.updateOne({ zoneId }, { $inc: { currentUsage: increment } });
            }
            res.status(200).json({ message: 'Webhook processed successfully' });
        }
        catch (error) {
            next(error);
        }
    },
    createAlert: async (req, res, next) => {
        try {
            const { deviceId, alertType, message } = req.body;
            if (!deviceId || !alertType || !message) {
                res.status(400).json({ message: 'deviceId, alertType, and message are required' });
                return;
            }
            const alert = await InfrastructureAlert_1.InfrastructureAlert.create({
                deviceId,
                alertType,
                message: message || "Lỗi thiết bị"
            });
            res.status(201).json({ message: 'Alert created', data: alert });
        }
        catch (error) {
            next(error);
        }
    }
};
