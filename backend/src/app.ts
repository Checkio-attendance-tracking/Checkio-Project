import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import attendanceRoutes from "./routes/attendance.routes";
import companyRoutes from "./routes/company.routes";
import superAdminRoutes from "./routes/superadmin.routes";
import workScheduleChangeRoutes from "./routes/workScheduleChange.routes";
import { prisma } from "./config/database";

const app = express();

const isProd = process.env.NODE_ENV === "production";
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: !isProd ? true : corsOrigins.length > 0 ? corsOrigins : false,
  })
);
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/empleados", employeeRoutes);
app.use("/asistencias", attendanceRoutes);
app.use("/empresa", companyRoutes);
app.use("/solicitudes-correccion", workScheduleChangeRoutes);

app.get("/time", (req, res) => {
  res.json({ time: new Date().toISOString() });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok", time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", db: "down", time: new Date().toISOString() });
  }
});

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const e = err as { message?: string; stack?: string };
  console.error({ message: e?.message, stack: e?.stack });
  res.status(500).json({ message: "Internal server error" });
});

export default app;
