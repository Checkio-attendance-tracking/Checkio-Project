import { Request, Response } from "express";
import { prisma } from "../config/database";

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export class NotificationController {
  async list(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const toUserId = req.user?.userId;
      if (!companyId || !toUserId) {
        res.status(400).json({ message: "Tenant context missing" });
        return;
      }

      const unread = req.query.unread === "1" || req.query.unread === "true";
      const limit = clampInt(req.query.limit, 20, 1, 50);
      const offset = clampInt(req.query.offset, 0, 0, 5000);

      const where = {
        companyId,
        toUserId,
        ...(unread ? { readAt: null } : {}),
      };

      const [items, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({
          where: { companyId, toUserId, readAt: null },
        }),
      ]);

      res.json({ items, unreadCount });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const toUserId = req.user?.userId;
      if (!companyId || !toUserId) {
        res.status(400).json({ message: "Tenant context missing" });
        return;
      }

      const { id } = req.params;
      const existing = await prisma.notification.findFirst({
        where: { id: id as string, companyId, toUserId },
        select: { id: true, readAt: true },
      });
      if (!existing) {
        res.status(404).json({ message: "Notification not found" });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id: existing.id },
        data: { readAt: existing.readAt ?? new Date() },
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const toUserId = req.user?.userId;
      if (!companyId || !toUserId) {
        res.status(400).json({ message: "Tenant context missing" });
        return;
      }

      const result = await prisma.notification.updateMany({
        where: { companyId, toUserId, readAt: null },
        data: { readAt: new Date() },
      });

      res.json({ updated: result.count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

