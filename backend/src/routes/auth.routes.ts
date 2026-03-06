import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login.bind(controller));
router.get("/me", authMiddleware, controller.me.bind(controller));

export default router;
