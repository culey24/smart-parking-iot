import { Router } from 'express';
import { SessionController } from '../controllers/SessionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', SessionController.getAll);
router.get('/recent', SessionController.getRecent);
router.get('/user/:userId', SessionController.getByUser);

export default router;
