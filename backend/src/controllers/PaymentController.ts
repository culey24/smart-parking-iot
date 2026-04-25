import { Request, Response } from 'express';

export class PaymentController {
  static async getHistory(req: Request, res: Response) {
    // Mock data history
    res.json({
      success: true,
      data: [
        { id: '1', date: new Date(), amount: 5000, status: 'PAID' }
      ]
    });
  }

  static async getDebt(req: Request, res: Response) {
    // Mock data debt
    res.json({
      success: true,
      data: { amount: 15000 }
    });
  }
}
