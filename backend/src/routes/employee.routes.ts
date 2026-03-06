import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeeController";
import { authMiddleware, tenantMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();
const controller = new EmployeeController();

router.use(authMiddleware, tenantMiddleware, roleMiddleware(['admin']));

router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
