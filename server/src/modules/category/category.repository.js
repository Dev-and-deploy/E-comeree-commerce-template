import prisma from "../../core/database/prisma.js";

export class CategoryRepository {
  findActive() {
    return prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  }

  findAll({ where = {}, orderBy = { sortOrder: "asc" } } = {}) {
    return prisma.category.findMany({ where, orderBy });
  }

  findBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  }

  findById(id) {
    return prisma.category.findUnique({ where: { id } });
  }

  create(data) {
    return prisma.category.create({ data });
  }

  update(id, data) {
    return prisma.category.update({ where: { id }, data });
  }

  softDelete(id) {
    return prisma.category.update({ where: { id }, data: { isActive: false } });
  }
}
