import prisma from "../../core/database/prisma.js";

export class ThemeRepository {
  getActive() {
    return prisma.themeSettings.findFirst({
      where: { isActive: true },
      include: { template: true },
    });
  }

  getAll() {
    return prisma.themeSettings.findMany({ include: { template: true } });
  }

  getById(id) {
    return prisma.themeSettings.findUnique({ where: { id }, include: { template: true } });
  }

  create(data) {
    const { id: _id, template: _template, createdAt: _createdAt, updatedAt: _updatedAt, ...safe } = data;
    return prisma.themeSettings.create({ data: safe, include: { template: true } });
  }

  update(id, data) {
    const { id: _id, template: _template, createdAt: _createdAt, updatedAt: _updatedAt, ...safe } = data;
    return prisma.themeSettings.update({ where: { id }, data: safe, include: { template: true } });
  }

  activate(id) {
    return prisma.$transaction([
      prisma.themeSettings.updateMany({ where: {}, data: { isActive: false } }),
      prisma.themeSettings.update({ where: { id }, data: { isActive: true } }),
    ]);
  }

  getTemplates() {
    return prisma.template.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  }

  getAdminSettings() {
    return prisma.adminSettings.findMany();
  }

  upsertAdminSetting(key, value) {
    return prisma.adminSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
