import prisma from "../../core/database/prisma.js";

export class ProductRepository {
  findAll({ skip, limit, where = {}, orderBy = { createdAt: "desc" } }) {
    return Promise.all([
      prisma.product.findMany({ skip, take: limit, where, orderBy, include: { category: { select: { id: true, name: true, slug: true } } } }),
      prisma.product.count({ where }),
    ]);
  }

  findBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: { where: { isApproved: true }, include: { user: { select: { name: true, avatar: true } } } },
      },
    });
  }

  findActiveBySlug(slug) {
    return prisma.product.findFirst({
      where: { slug, isActive: true, category: { isActive: true } },
      include: {
        category: true,
        reviews: { where: { isApproved: true }, include: { user: { select: { name: true, avatar: true } } } },
      },
    });
  }

  findById(id) {
    return prisma.product.findUnique({ where: { id }, include: { category: true } });
  }

  create(data) {
    return prisma.product.create({ data, include: { category: true } });
  }

  update(id, data) {
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  softDelete(id) {
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  updateStock(id, quantity) {
    return prisma.product.update({ where: { id }, data: { stock: { decrement: quantity } } });
  }
}
