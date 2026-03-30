import { Router } from "express";
import { AttendanceController } from "../controllers/AttendanceController";
import { authMiddleware, tenantMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();
const controller = new AttendanceController();

// Employee routes
// Need to bind controller context
const mark = controller.mark.bind(controller);

router.post("/ingreso", authMiddleware, tenantMiddleware, roleMiddleware(['employee']), (req, res, next) => { req.body = req.body || {}; req.body.type = 'checkIn'; next(); }, mark);
router.post("/salida-almuerzo", authMiddleware, tenantMiddleware, roleMiddleware(['employee']), (req, res, next) => { req.body = req.body || {}; req.body.type = 'lunchStart'; next(); }, mark);
router.post("/regreso-almuerzo", authMiddleware, tenantMiddleware, roleMiddleware(['employee']), (req, res, next) => { req.body = req.body || {}; req.body.type = 'lunchEnd'; next(); }, mark);
router.post("/salida-final", authMiddleware, tenantMiddleware, roleMiddleware(['employee']), (req, res, next) => { req.body = req.body || {}; req.body.type = 'checkOut'; next(); }, mark);
router.get("/mis-asistencias", authMiddleware, tenantMiddleware, roleMiddleware(['employee']), controller.getMyHistory.bind(controller));

// HR routes
router.get("/", authMiddleware, tenantMiddleware, roleMiddleware(['admin']), controller.getAll.bind(controller));
router.get("/:id", authMiddleware, tenantMiddleware, roleMiddleware(['admin']), controller.getById.bind(controller));

export default router;
