import { Router } from 'express';
import { SystemAdminController } from '../controllers/SystemAdminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware'; // <-- Import thêm cái này

const router = Router();

// Riêng phần Pricing thì cho cả Admin và Finance đụng vào
const pricingAuth = [authMiddleware, roleMiddleware(['ADMIN', 'FINANCE_OFFICE'])];
// Phần cấu hình hệ thống (Config) thường chỉ dành cho Admin tổng
const configAuth = [authMiddleware, roleMiddleware(['ADMIN'])];

router.get('/config', configAuth, SystemAdminController.getAllConfigs);
router.get('/pricing', pricingAuth, SystemAdminController.getPricing);
router.get('/logs', authMiddleware, SystemAdminController.getLogs);

router.put('/config', configAuth, SystemAdminController.updateConfig);
router.put('/pricing', pricingAuth, SystemAdminController.updatePricing);

export default router;