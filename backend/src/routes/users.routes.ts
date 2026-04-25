import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { User } from '../models/User';

const router = Router();

// Lấy danh sách users (Chỉ ADMIN)
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user role
router.put('/:userId/role', authMiddleware, roleMiddleware(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findOneAndUpdate({ userId: req.params.userId }, { role }, { new: true });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
