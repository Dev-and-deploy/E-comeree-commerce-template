import prisma from "../../core/database/prisma.js";

const PUBLIC_KEYS = [
  "currency",
  "taxRate",
  "freeShippingThreshold",
  "siteTitle",
  "siteDescription",
  "contactEmail",
  "maintenanceMode",
];

export class SettingsRepository {
  getAll() {
    return prisma.adminSettings.findMany({ orderBy: { key: "asc" } });
  }

  getPublic() {
    return prisma.adminSettings.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    });
  }

  upsert(key, value) {
    return prisma.adminSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  upsertMany(entries) {
    return prisma.$transaction(
      entries.map(({ key, value }) =>
        prisma.adminSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
  }
}
