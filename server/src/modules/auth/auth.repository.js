import prisma from "../../core/database/prisma.js";

export class AuthRepository {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data) {
    return prisma.user.create({ data });
  }

  updateRefreshToken(id, refreshToken) {
    return prisma.user.update({ where: { id }, data: { refreshToken } });
  }

  countAdmins() {
    return prisma.user.count({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } } });
  }
}
