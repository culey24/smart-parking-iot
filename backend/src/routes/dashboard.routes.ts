import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Endpoint for Dashboard Stats
router.get('/stats', DashboardController.getStats);

export default router;
