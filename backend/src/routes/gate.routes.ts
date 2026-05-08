import { Router } from 'express';
import { EntryExitController } from '../controllers/EntryExitController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint for gateway devices or operators to trigger check-in
router.post('/check-in', EntryExitController.checkIn);

// Endpoint cho xe ra
router.post('/check-out', EntryExitController.checkOut);

// Admin open gate manually (Sửa lại: Kẹp authMiddleware và trỏ về Controller)
router.post('/open', authMiddleware, EntryExitController.openGate);

export default router;