import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint tra cứu thẻ
router.get('/lookup', CardController.lookup);

// Endpoint vô hiệu hóa thẻ (Cần có quyền Admin/Operator)
router.put('/:id/disable', authMiddleware, CardController.disableCard);

export default router;