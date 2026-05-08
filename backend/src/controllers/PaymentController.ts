import { Request, Response } from 'express';
import { BillingService } from '../services/BillingService';
import { ParkingSession } from '../models/ParkingSession';

export class PaymentController {
  static async initiateCyclePayment(req: Request, res: Response) {
    try {
      // Yêu cầu Frontend gửi thời gian của chu kỳ
      const { subjectId: subjectId, startDate, endDate } = req.body; 

      if (!subjectId || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Missing subjectId, startDate or endDate' });
      }

      const unpaidSessionsInCycle = await ParkingSession.find({
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
          subjectId: subjectId,
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
      const subjectId = req.query.subjectId as string;
      if (!subjectId) {
        return res.status(400).json({ success: false, message: 'Missing query subjectId' });
      }

      const paidSessions = await ParkingSession.find({
        subjectId: subjectId,
        paymentStatus: 'PAID'
      }).sort({ endTime: -1 });

      res.json({
        success: true,
        data: paidSessions
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDebt(req: Request, res: Response) {
    try {
      const subjectId = req.query.subjectId as string;
      if (!subjectId) {
        return res.status(400).json({ success: false, message: 'Missing query subjectId' });
      }

      const unpaidSessions = await ParkingSession.find({
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
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}