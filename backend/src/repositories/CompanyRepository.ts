import { prisma } from "../config/database";

export class CompanyRepository {
  async findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any) {
    return prisma.company.update({
      where: { id },
      data,
    });
  }
}
