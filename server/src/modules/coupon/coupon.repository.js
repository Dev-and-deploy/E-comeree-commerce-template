import prisma from "../../core/database/prisma.js";

export class CouponRepository {
  findAll({ skip, limit, where = {}, orderBy = { createdAt: "desc" } }) {
    return Promise.all([
      prisma.coupon.findMany({ skip, take: limit, where, orderBy }),
      prisma.coupon.count({ where }),
    ]);
  }

  findById(id) {
    return prisma.coupon.findUnique({ where: { id } });
  }

  findByCode(code) {
    return prisma.coupon.findUnique({ where: { code } });
  }

  findActiveBanner() {
    return prisma.coupon.findFirst({
      where: { showInBanner: true, isActive: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  create(data) {
    return prisma.coupon.create({ data });
  }

  update(id, data) {
    return prisma.coupon.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.coupon.delete({ where: { id } });
  }

  incrementUsed(id) {
    return prisma.coupon.update({ where: { id }, data: { usedCount: { increment: 1 } } });
  }
}
