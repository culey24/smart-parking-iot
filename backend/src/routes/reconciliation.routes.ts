import { Router } from 'express';
import { ReconciliationController } from '../controllers/ReconciliationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/requests', ReconciliationController.getRequests);
router.put('/requests/:id', ReconciliationController.resolveRequest);
router.get('/session/:sessionId', ReconciliationController.getSessionData);
router.get('/related/:userId', ReconciliationController.getRelatedSessions);

export default router;
