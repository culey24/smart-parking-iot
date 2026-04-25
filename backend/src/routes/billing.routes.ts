import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/history', PaymentController.getHistory);
router.get('/debt', PaymentController.getDebt);

export default router;
