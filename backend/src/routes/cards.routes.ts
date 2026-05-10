import { Router } from 'express';
import { CardController } from '../controllers/CardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Tra cứu thẻ bằng biển số (public)
router.get('/lookup', CardController.lookup);

// Cấp thẻ tạm (public — IoT gọi khi xe vào)
router.post('/issue', CardController.issueCard);

// Trả thẻ tạm (public — IoT gọi khi xe ra)
router.post('/return', CardController.returnCard);

// Khóa thẻ khi bị mất (cần auth)
router.put('/:id/disable', authMiddleware, CardController.disableCard);

export default router;