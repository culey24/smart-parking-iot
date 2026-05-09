"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationController = void 0;
class ReconciliationController {
    static async getRequests(req, res) {
        // Mock data
        res.json({
            success: true,
            data: [
                { requestId: 'R1', date: new Date(), spmsTotal: 100000, bkpayTotal: 95000, status: 'PENDING' }
            ]
        });
    }
    static async resolveRequest(req, res) {
        res.json({ success: true, message: `Request ${req.params.id} resolved.` });
    }
    static async getSessionData(req, res) {
        res.json({ success: true, data: { sessionId: req.params.sessionId, spmsFee: 5000, bkpayFee: 5000 } });
    }
}
exports.ReconciliationController = ReconciliationController;
