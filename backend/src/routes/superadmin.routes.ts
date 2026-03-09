import { Router } from "express";
import { SuperAdminController } from "../controllers/SuperAdminController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();
const superAdminController = new SuperAdminController();

// Only Superadmin can access these routes
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    res.status(403).json({ message: "Require Superadmin Role" });
    return;
  }
  next();
});

router.get("/empresas", superAdminController.listCompanies.bind(superAdminController));
router.get("/empresas/:id", superAdminController.getCompany.bind(superAdminController));
router.post("/empresas", superAdminController.createCompany.bind(superAdminController));
router.put("/empresas/:id", superAdminController.updateCompany.bind(superAdminController));
router.post("/empresas/:id/crear-rrhh", superAdminController.createCompanyUser.bind(superAdminController));

export default router;
