import { Router } from 'express';
import { IoTDataController } from '../controllers/IoTDataController';

const router = Router();

router.post('/webhook', IoTDataController.webhook);

export default router;
