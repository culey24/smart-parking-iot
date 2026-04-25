import { Request, Response } from 'express';

export class ReconciliationController {
  static async getRequests(req: Request, res: Response) {
    // Mock data
    res.json({
      success: true,
      data: [
        { requestId: 'R1', date: new Date(), spmsTotal: 100000, bkpayTotal: 95000, status: 'PENDING' }
      ]
    });
  }

  static async resolveRequest(req: Request, res: Response) {
    res.json({ success: true, message: `Request ${req.params.id} resolved.` });
  }

  static async getSessionData(req: Request, res: Response) {
    res.json({ success: true, data: { sessionId: req.params.sessionId, spmsFee: 5000, bkpayFee: 5000 } });
  }
}
