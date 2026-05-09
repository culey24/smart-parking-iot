"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const BillingService_1 = require("../services/BillingService");
const ParkingSession_1 = require("../models/ParkingSession");
class PaymentController {
    static async initiateCyclePayment(req, res) {
        try {
            // Yêu cầu Frontend gửi thời gian của chu kỳ
            const { subjectId: subjectId, startDate, endDate } = req.body;
            if (!subjectId || !startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Missing subjectId, startDate or endDate' });
            }
            const unpaidSessionsInCycle = await ParkingSession_1.ParkingSession.find({
                subjectId: subjectId,
                sessionStatus: 'COMPLETED',
                paymentStatus: 'UNPAID',
                endTime: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            });
            if (unpaidSessionsInCycle.length === 0) {
                return res.json({
                    success: true,
                    message: 'No fees need to be paid in this cycle'
                });
            }
            const totalCycleAmount = BillingService_1.BillingService.calculateCycleFee(unpaidSessionsInCycle);
            const mockTransactionId = 'BKPAY_CYCLE_' + Date.now();
            for (const session of unpaidSessionsInCycle) {
                session.paymentStatus = 'PENDING';
                session.invoiceId = mockTransactionId;
                await session.save();
            }
            res.json({
                success: true,
                message: `Created payment request for ${unpaidSessionsInCycle.length} parking sessions in the cycle`,
                data: {
                    transactionId: mockTransactionId,
                    subjectId: subjectId,
                    cycleStart: startDate,
                    cycleEnd: endDate,
                    totalAmount: totalCycleAmount,
                    status: 'PENDING',
                    paymentUrl: `https://mock-bkpay.hcmut.edu.vn/pay?txn=${mockTransactionId}&amount=${totalCycleAmount}`
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async mockBKPayCallback(req, res) {
        try {
            const { transactionId } = req.body;
            if (!transactionId) {
                return res.status(400).json({ success: false, message: 'Missing transactionId' });
            }
            const sessions = await ParkingSession_1.ParkingSession.find({
                invoiceId: transactionId,
                paymentStatus: 'PENDING'
            });
            if (sessions.length === 0) {
                return res.status(404).json({ success: false, message: 'Cannot find any pending sessions for the given transaction ID' });
            }
            await ParkingSession_1.ParkingSession.updateMany({ invoiceId: transactionId, paymentStatus: 'PENDING' }, { $set: { paymentStatus: 'PAID' } });
            res.json({
                success: true,
                message: 'Payment successful',
                data: {
                    transactionId: transactionId,
                    sessionsPaidCount: sessions.length,
                    status: 'PAID'
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const n = parseInt(process.env.HISTORY_VIEW_DAYS_LIMIT) || 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - n);
            // Query Database
            const history = await ParkingSession_1.ParkingSession.find({
                subjectId: userId,
                createdAt: { $gte: cutoffDate }
            }).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: history });
        }
        catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server" });
        }
    }
    static async getHistoryAdmin(req, res) {
        try {
            // Lấy tham số subjectId từ query (nếu có)
            const { startDate, endDate, subjectId } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Missing query parameters: startDate and endDate are required' });
            }
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid date format. Please use a valid ISO date string (e.g. YYYY-MM-DD)' });
            }
            end.setHours(23, 59, 59, 999);
            // Khởi tạo object truy vấn mặc định
            const query = {
                createdAt: { $gte: start, $lte: end }
            };
            // Nếu Admin truyền thêm mã user (subjectId) , thêm vào điều kiện lọc
            if (subjectId) {
                query.subjectId = subjectId;
            }
            // Bỏ biến query vào lệnh find
            const history = await ParkingSession_1.ParkingSession.find(query).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: history });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || "Lỗi server" });
        }
    }
    static async getDebt(req, res) {
        try {
            const subjectId = req.query.subjectId;
            if (!subjectId) {
                return res.status(400).json({ success: false, message: 'Missing query subjectId' });
            }
            const unpaidSessions = await ParkingSession_1.ParkingSession.find({
                subjectId: subjectId,
                sessionStatus: 'COMPLETED',
                paymentStatus: 'UNPAID'
            });
            const totalDebt = unpaidSessions.reduce((sum, session) => sum + (session.fee || 0), 0);
            res.json({
                success: true,
                data: {
                    subjectId: subjectId,
                    totalDebt: totalDebt,
                    unpaidCount: unpaidSessions.length
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.PaymentController = PaymentController;
