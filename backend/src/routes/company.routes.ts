import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { authMiddleware, tenantMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();
const controller = new CompanyController();

// Only admins can view and modify company settings
router.get('/settings', authMiddleware, tenantMiddleware, roleMiddleware(['admin']), (req, res) => controller.getSettings(req, res));
router.put('/settings', authMiddleware, tenantMiddleware, roleMiddleware(['admin']), (req, res) => controller.updateSettings(req, res));

export default router;
