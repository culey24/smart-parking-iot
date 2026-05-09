"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IoTDataController_1 = require("../controllers/IoTDataController");
const router = (0, express_1.Router)();
router.post('/', IoTDataController_1.IoTDataController.createAlert);
exports.default = router;
