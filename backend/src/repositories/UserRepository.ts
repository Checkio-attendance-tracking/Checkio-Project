import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string) {
    const normalized = email.trim();
    return prisma.user.findFirst({
      where: { OR: [{ email: normalized }, { email: normalized.toLowerCase() }] },
      include: { company: true, employee: true }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { company: true, employee: true }
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }
}
