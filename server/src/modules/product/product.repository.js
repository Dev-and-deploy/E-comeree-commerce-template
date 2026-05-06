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

  findById(id) {
    return prisma.product.findUnique({ where: { id }, include: { category: true } });
  }

  create(data) {
    return prisma.product.create({ data, include: { category: true } });
  }

  update(id, data) {
    return prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  delete(id) {
    return prisma.product.delete({ where: { id } });
  }

  updateStock(id, quantity) {
    return prisma.product.update({ where: { id }, data: { stock: { decrement: quantity } } });
  }

  findCategories() {
    return prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  }

  findAllCategories() {
    return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  }

  findCategoryBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  }

  createCategory(data) {
    return prisma.category.create({ data });
  }

  updateCategory(id, data) {
    return prisma.category.update({ where: { id }, data });
  }

  deleteCategory(id) {
    return prisma.category.delete({ where: { id } });
  }
}
