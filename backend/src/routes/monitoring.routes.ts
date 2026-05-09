import { Router } from 'express';
import { MonitoringController } from '../controllers/MonitoringController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Endpoint for live monitoring data
router.get('/live', MonitoringController.getLive);

export default router;
