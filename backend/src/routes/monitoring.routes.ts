import { Router } from 'express';
import { MonitoringController } from '../controllers/MonitoringController';
import { MonitoringSSEController } from '../controllers/MonitoringSSEController';
import { SystemLogService } from '../services/SystemLogService';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Full snapshot (existing)
router.get('/live', MonitoringController.getLive);

// SSE stream for real-time updates
router.get('/stream', MonitoringSSEController.stream);

// Recent system logs
router.get('/logs', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const logs = await SystemLogService.getRecent(limit);
  res.json({ success: true, data: logs });
});

// Bind a session to a sensor device
router.post('/bind', MonitoringSSEController.bindSensor);

export default router;
