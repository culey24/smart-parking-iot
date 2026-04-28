import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// Báo cáo thì ADMIN và FINANCE_OFFICE đều có thể xem được
const reportAuth = [authMiddleware, roleMiddleware(['ADMIN', 'FINANCE_OFFICE'])];

router.get('/daily-revenue', reportAuth, ReportController.getDailyRevenueReport);

export default router;