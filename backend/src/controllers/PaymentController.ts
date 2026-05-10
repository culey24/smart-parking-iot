import { Request, Response } from 'express';
import { BillingService } from '../services/BillingService';
import { ParkingSession } from '../models/ParkingSession';

export class PaymentController {
  static async initiateCyclePayment(req: Request, res: Response) {
    try {
      // Yêu cầu Frontend gửi thời gian của chu kỳ
      const { subjectID, startDate, endDate } = req.body;

      if (!subjectID || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Missing subjectID, startDate or endDate' });
      }

      const unpaidSessionsInCycle = await ParkingSession.find({
        subjectID: subjectID,
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

      const totalCycleAmount = BillingService.calculateCycleFee(unpaidSessionsInCycle);
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
          subjectID: subjectID,
          cycleStart: startDate,
          cycleEnd: endDate,
          totalAmount: totalCycleAmount,
          status: 'PENDING',
          paymentUrl: `https://mock-bkpay.hcmut.edu.vn/pay?txn=${mockTransactionId}&amount=${totalCycleAmount}`
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async mockBKPayCallback(req: Request, res: Response) {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ success: false, message: 'Missing transactionId' });
      }

      const sessions = await ParkingSession.find({
        invoiceId: transactionId,
        paymentStatus: 'PENDING'
      });

      if (sessions.length === 0) {
        return res.status(404).json({ success: false, message: 'Cannot find any pending sessions for the given transaction ID' });
      }

      await ParkingSession.updateMany(
        { invoiceId: transactionId, paymentStatus: 'PENDING' },
        { $set: { paymentStatus: 'PAID' } }
      );

      res.json({
        success: true,
        message: 'Payment successful',
        data: {
          transactionId: transactionId,
          sessionsPaidCount: sessions.length,
          status: 'PAID'
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const n = parseInt(process.env.HISTORY_VIEW_DAYS_LIMIT as string) || 30;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - n);

      // Query Database
      const history = await ParkingSession.find({
        subjectID: userId,
        createdAt: { $gte: cutoffDate }
      }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  static async getHistoryAdmin(req: Request, res: Response) {
    try {
      // Lấy tham số subjectID từ query (nếu có)
      const { startDate, endDate, subjectID } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Missing query parameters: startDate and endDate are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format. Please use a valid ISO date string (e.g. YYYY-MM-DD)' });
      }

      end.setHours(23, 59, 59, 999);

      // Khởi tạo object truy vấn mặc định
      const query: any = {
        createdAt: { $gte: start, $lte: end }
      };

      // Nếu Admin truyền thêm mã user (subjectID) , thêm vào điều kiện lọc
      if (subjectID) {
        query.subjectID = subjectID;
      }

      // Bỏ biến query vào lệnh find
      const history = await ParkingSession.find(query).sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Lỗi server" });
    }
  }


  static async getDebt(req: Request, res: Response) {
    try {
      const subjectID = req.query.subjectID as string;
      if (!subjectID) {
        return res.status(400).json({ success: false, message: 'Missing query subjectID' });
      }

      const unpaidSessions = await ParkingSession.find({
        subjectID: subjectID,
        sessionStatus: 'COMPLETED',
        paymentStatus: 'UNPAID'
      });

      const totalDebt = unpaidSessions.reduce((sum, session) => sum + (session.fee || 0), 0);

      res.json({
        success: true,
        data: {
          subjectID: subjectID,
          totalDebt: totalDebt,
          unpaidCount: unpaidSessions.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}