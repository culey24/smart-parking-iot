import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', AuthController.login);
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
