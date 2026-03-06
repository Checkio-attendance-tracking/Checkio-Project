import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
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
