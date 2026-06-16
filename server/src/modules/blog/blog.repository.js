import prisma from "../../core/database/prisma.js";

export class BlogRepository {
  findAll({ skip, limit, where = {}, orderBy = { createdAt: "desc" } }) {
    return Promise.all([
      prisma.blog.findMany({ skip, take: limit, where, orderBy }),
      prisma.blog.count({ where }),
    ]);
  }

  findBySlug(slug) {
    return prisma.blog.findUnique({ where: { slug } });
  }

  findById(id) {
    return prisma.blog.findUnique({ where: { id } });
  }

  create(data) {
    return prisma.blog.create({ data });
  }

  update(id, data) {
    return prisma.blog.update({ where: { id }, data });
  }

  delete(id) {
    return prisma.blog.delete({ where: { id } });
  }
}
