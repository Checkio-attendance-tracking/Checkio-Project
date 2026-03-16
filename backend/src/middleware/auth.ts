import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { CompanyRepository } from "../repositories/CompanyRepository";

const companyRepo = new CompanyRepository();

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  req.user = payload;
  next();
};

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.companyId) {
    res.status(403).json({ message: "Tenant context missing" });
    return;
  }
  try {
    const company = await companyRepo.findById(req.user.companyId);
    if (!company) {
      res.status(403).json({ message: "Company not found" });
      return;
    }
    if (company.status !== "active") {
      res.status(403).json({ message: "Company is not active" });
      return;
    }
  } catch {
    res.status(500).json({ message: "Failed to validate company status" });
    return;
  }
  next();
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }
    next();
  };
};
