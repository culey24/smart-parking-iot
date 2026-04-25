import { Request, Response } from 'express';

export class EntryExitController {
  static async checkIn(req: Request, res: Response) {
    // TODO: Implement check-in logic
    res.json({ message: 'Check-in logic' });
  }

  static async checkOut(req: Request, res: Response) {
    // TODO: Implement check-out logic
    res.json({ message: 'Check-out logic' });
  }
}
