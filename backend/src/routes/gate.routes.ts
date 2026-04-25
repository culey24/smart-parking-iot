import { Router } from 'express';
import { EntryExitController } from '../controllers/EntryExitController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint for gateway devices or operators to trigger check-in
router.post('/check-in', EntryExitController.checkIn);
router.post('/check-out', EntryExitController.checkOut);

// Admin open gate manually
router.post('/:id/open', authMiddleware, (req, res) => {
  res.json({ success: true, message: `Gate ${req.params.id} opened manually.` });
});

export default router;
