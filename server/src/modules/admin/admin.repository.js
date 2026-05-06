import prisma from "../../core/database/prisma.js";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];

const SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export class AdminRepository {
  async findAll({ where = {}, skip = 0, take = 10, orderBy = { createdAt: "desc" } } = {}) {
    const baseWhere = { role: { in: STAFF_ROLES }, ...where };
    const [data, total] = await Promise.all([
      prisma.user.findMany({ where: baseWhere, select: SELECT, skip, take, orderBy }),
      prisma.user.count({ where: baseWhere }),
    ]);
    return { data, total };
  }

  findById(id) {
    return prisma.user.findFirst({
      where: { id, role: { in: STAFF_ROLES } },
      select: SELECT,
    });
  }

  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  create(data) {
    return prisma.user.create({ data, select: SELECT });
  }

  update(id, data) {
    return prisma.user.update({ where: { id }, data, select: SELECT });
  }
}
