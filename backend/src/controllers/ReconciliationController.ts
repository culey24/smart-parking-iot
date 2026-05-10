import { Request, Response } from 'express';
import { ReconciliationRequest } from '../models/ReconciliationRequest';
import { ParkingSession } from '../models/ParkingSession';
import { Invoice } from '../models/Invoice';

export class ReconciliationController {
  static async getRequests(req: Request, res: Response) {
    try {
      const requests = await ReconciliationRequest.find().sort({ reportedAt: -1 }).lean();
      const mapped = requests.map((r: any) => ({
        ...r,
        id: r._id.toString()
      }));
      res.json({
        success: true,
        data: mapped
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async resolveRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      
      const updated = await ReconciliationRequest.findByIdAndUpdate(
        id,
        { status, note },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSessionData(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await ParkingSession.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ success: false, message: 'Parking session not found' });
      }

      let invoice = null;
      if (session.invoiceId) {
        invoice = await Invoice.findOne({ invoiceId: session.invoiceId });
      }

      res.json({ 
        success: true, 
        data: { 
          entryTime: session.startTime,
          exitTime: session.endTime,
          licensePlate: session.plateNumber,
          cardId: session.subjectID, // mapping subjectID to cardId for frontend
          calculatedAmount: session.fee,
          transactionId: invoice?.invoiceId || 'N/A',
          transactionStatus: invoice?.paymentStatus || 'UNPAID',
          actualAmount: invoice?.amount || 0
        } 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRelatedSessions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const sessions = await ParkingSession.find({ subjectID: userId })
        .sort({ startTime: -1 })
        .limit(10);

      const data = sessions.map((s: any) => ({
        id: s.sessionId,
        entryTime: s.startTime,
        exitTime: s.endTime,
        licensePlate: s.plateNumber,
        fee: s.fee
      }));

      res.json({
        success: true,
        data: data
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
