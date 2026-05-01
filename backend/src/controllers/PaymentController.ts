import { Request, Response } from 'express';
import { BillingService } from '../services/BillingService';
import { ParkingSession } from '../models/ParkingSession';

export class PaymentController {
  
  // 1. API tính tiền cho một lượt gửi xe (Vẫn giữ để hệ thống gọi lúc xe chạy ra cổng)
  static async calculateSessionFee(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await ParkingSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Cannot find parking session' });
      }

      const endTime = session.endTime || new Date();
      const fee = await BillingService.calculateSingleSessionFee(endTime, session.vehicleType);

      res.json({
        success: true,
        data: {
          sessionId: session._id,
          startTime: session.startTime,
          endTime: endTime,
          totalFee: fee,
          currency: 'VND'
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async initiateCyclePayment(req: Request, res: Response) {
    try {
      // Yêu cầu Frontend gửi lên khoảng thời gian của chu kỳ để chốt sổ
      const { subjectID, startDate, endDate } = req.body; 

      if (!subjectID || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Thiếu subjectID, startDate hoặc endDate' });
      }

      // Lọc CHÍNH XÁC các phiên đỗ xe nằm trong chu kỳ này
      const unpaidSessionsInCycle = await ParkingSession.find({
        subjectID: subjectID,
        sessionStatus: 'COMPLETED',
        paymentStatus: 'UNPAID',
        endTime: { 
          $gte: new Date(startDate), // Lớn hơn hoặc bằng ngày bắt đầu chu kỳ
          $lte: new Date(endDate)    // Nhỏ hơn hoặc bằng ngày kết thúc chu kỳ
        }
      });

      if (unpaidSessionsInCycle.length === 0) {
        return res.json({ 
          success: true, 
          message: 'Không có khoản phí nào cần thanh toán trong chu kỳ này' 
        });
      }

      // Tính tổng tiền cần thanh toán cho RIÊNG chu kỳ này
      let totalCycleAmount = 0;
      const mockTransactionId = 'BKPAY_CYCLE_' + Date.now();

      for (const session of unpaidSessionsInCycle) {
        totalCycleAmount += session.fee || 0; 
        
        // Đánh dấu các session NÀY là đang chờ thanh toán
        session.paymentStatus = 'PENDING';
        session.invoiceId = mockTransactionId; 
        
        await session.save();
      }

      res.json({
        success: true,
        message: `Đã tạo yêu cầu thanh toán cho ${unpaidSessionsInCycle.length} lượt đỗ xe trong chu kỳ`,
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

  // 3. BƯỚC 2: API Giả lập Webhook/Callback từ BKPay (Thanh toán thành công)
  static async mockBKPayCallback(req: Request, res: Response) {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        return res.status(400).json({ success: false, message: 'Thiếu transactionId' });
      }

      const sessions = await ParkingSession.find({
        invoiceId: transactionId,
        paymentStatus: 'PENDING'
      });

      if (sessions.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch nào đang chờ thanh toán' });
      }

      // Cập nhật ĐỒNG LOẠT tất cả các session này sang trạng thái ĐÃ THANH TOÁN
      await ParkingSession.updateMany(
        { invoiceId: transactionId, paymentStatus: 'PENDING' },
        { $set: { paymentStatus: 'PAID' } }
      );

      res.json({
        success: true,
        message: 'Xác nhận thanh toán thành công (Mock Callback)',
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
      const subjectID = req.query.subjectID as string;
      if (!subjectID) {
        return res.status(400).json({ success: false, message: 'Thiếu query subjectID' });
      }

      const paidSessions = await ParkingSession.find({
        subjectID: subjectID,
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

  // 5. CẬP NHẬT THÊM: Tính tổng nợ thật từ DB
  static async getDebt(req: Request, res: Response) {
    try {
      const subjectID = req.query.subjectID as string;
      if (!subjectID) {
        return res.status(400).json({ success: false, message: 'Thiếu query subjectID' });
      }

      // Lấy tất cả các xe đã ra khỏi bãi nhưng chưa thanh toán
      const unpaidSessions = await ParkingSession.find({
        subjectID: subjectID,
        sessionStatus: 'COMPLETED',
        paymentStatus: 'UNPAID'
      });

      // Cộng dồn trường 'fee' lại
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