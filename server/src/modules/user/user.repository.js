import prisma from "../../core/database/prisma.js";

export class UserRepository {
  findAll({ skip, limit, where = {} }) {
    return Promise.all([
      prisma.user.findMany({
        skip, take: limit, where, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, avatar: true },
      }),
      prisma.user.count({ where }),
    ]);
  }

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, avatar: true, phone: true },
    });
  }

  update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true, avatar: true },
    });
  }

  delete(id) {
    return prisma.user.delete({ where: { id } });
  }
}
