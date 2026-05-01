import { Router } from 'express';
import { IoTDataController } from '../controllers/IoTDataController';

const router = Router();

router.post('/', IoTDataController.createAlert);

export default router;
