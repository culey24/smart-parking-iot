import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import gateRoutes from './gate.routes';
import cardsRoutes from './cards.routes';
import billingRoutes from './billing.routes';
import reconciliationRoutes from './reconciliation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/gates', gateRoutes);
router.use('/cards', cardsRoutes);
router.use('/billing', billingRoutes);
router.use('/reconciliation', reconciliationRoutes);

export default router;
