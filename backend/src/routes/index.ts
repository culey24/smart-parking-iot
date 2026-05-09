import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import gateRoutes from './gate.routes';
import cardsRoutes from './cards.routes';
import billingRoutes from './billing.routes';
import reconciliationRoutes from './reconciliation.routes';
import iotRoutes from './iot.routes';
import alertsRoutes from './alerts.routes';
import dashboardRoutes from './dashboard.routes';
import monitoringRoutes from './monitoring.routes';
import sessionsRoutes from './sessions.routes';

// 1. IMPORT ROUTES CỦA TASK 7 VÀO ĐÂY
import adminRoutes from './admin.routes';
import reportsRoutes from './reports.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/gates', gateRoutes);
router.use('/cards', cardsRoutes);
router.use('/billing', billingRoutes);
router.use('/reconciliation', reconciliationRoutes);
router.use('/iot', iotRoutes);
router.use('/alerts', alertsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/sessions', sessionsRoutes);

// 2. CẮM ĐƯỜNG DẪN CỦA TASK 7 VÀO MAIN ROUTER
router.use('/admin', adminRoutes);
router.use('/reports', reportsRoutes);

export default router;