import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import attendanceRoutes from "./routes/attendance.routes";
import companyRoutes from "./routes/company.routes";
import superAdminRoutes from "./routes/superadmin.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/empleados", employeeRoutes);
app.use("/asistencias", attendanceRoutes);
app.use("/empresa", companyRoutes);

app.get("/time", (req, res) => {
  res.json({ time: new Date().toISOString() });
});

export default app;
