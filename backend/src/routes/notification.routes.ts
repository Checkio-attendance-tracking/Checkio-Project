import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authMiddleware, roleMiddleware, tenantMiddleware } from "../middleware/auth";

const router = Router();
const controller = new NotificationController();

router.use(authMiddleware, tenantMiddleware);

router.get("/", roleMiddleware(["admin", "employee"]), controller.list.bind(controller));
router.post("/read-all", roleMiddleware(["admin", "employee"]), controller.markAllRead.bind(controller));
router.post("/:id/read", roleMiddleware(["admin", "employee"]), controller.markRead.bind(controller));

export default router;

