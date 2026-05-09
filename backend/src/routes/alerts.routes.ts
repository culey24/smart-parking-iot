import { Router } from 'express';
import { IoTDataController } from '../controllers/IoTDataController';

const router = Router();

router.post('/', IoTDataController.createAlert);
router.get('/', IoTDataController.getAlerts);
router.put('/:id/status', IoTDataController.updateAlertStatus);

export default router;
