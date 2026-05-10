import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Zones endpoints
router.get('/usage', authMiddleware, DashboardController.getZonesByUsage);
router.get('/least', authMiddleware, DashboardController.getLeastUsedZone);
router.get('/summary', authMiddleware, DashboardController.getStats);
router.get('/live', authMiddleware, DashboardController.getLiveMonitoringSimple);

export default router;
