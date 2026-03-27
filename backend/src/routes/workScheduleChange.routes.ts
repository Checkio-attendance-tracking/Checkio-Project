import { Router } from "express";
import { AttendanceCorrectionController } from "../controllers/WorkScheduleChangeController";
import { authMiddleware, roleMiddleware, tenantMiddleware } from "../middleware/auth";

const router = Router();
const controller = new AttendanceCorrectionController();

router.use(authMiddleware, tenantMiddleware);

router.post("/", roleMiddleware(["employee"]), controller.create.bind(controller));
router.get("/mias", roleMiddleware(["employee"]), controller.listMine.bind(controller));

router.get("/", roleMiddleware(["admin"]), controller.listCompany.bind(controller));
router.post("/:id/aprobar", roleMiddleware(["admin"]), controller.approve.bind(controller));
router.post("/:id/rechazar", roleMiddleware(["admin"]), controller.reject.bind(controller));

export default router;
