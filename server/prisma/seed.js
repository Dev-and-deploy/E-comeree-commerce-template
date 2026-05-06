import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@store.com" },
    update: { role: "SUPER_ADMIN", isActive: true },
    create: {
      email: "superadmin@store.com",
      password: passwordHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  const fashionTemplate = await prisma.template.upsert({
    where: { slug: "fashion" },
    update: {},
    create: {
      name: "Fashion",
      slug: "fashion",
      description: "Elegant fashion-forward storefront",
      isActive: true,
    },
  });

  await prisma.template.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Tech-focused modern storefront",
      isActive: true,
    },
  });

  await prisma.template.upsert({
    where: { slug: "minimal" },
    update: {},
    create: {
      name: "Minimal",
      slug: "minimal",
      description: "Clean minimalist design",
      isActive: true,
    },
  });

  await prisma.template.upsert({
    where: { slug: "modern" },
    update: {},
    create: {
      name: "Modern",
      slug: "modern",
      description: "Bold modern commerce",
      isActive: true,
    },
  });

  await prisma.themeSettings.upsert({
    where: { id: "default-theme" },
    update: {},
    create: {
      id: "default-theme",
      templateId: fashionTemplate.id,
      primaryColor: "#1a1a2e",
      secondaryColor: "#ffffff",
      accentColor: "#e94560",
      fontFamily: "Inter",
      storeName: "MyStore",
      isActive: true,
      homeSections: [
        { type: "hero", order: 1, isActive: true },
        { type: "featured_products", order: 2, isActive: true },
        { type: "categories", order: 3, isActive: true },
        { type: "banner", order: 4, isActive: true },
        { type: "new_arrivals", order: 5, isActive: true },
      ],
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "All clothing items",
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "classic-white-tee" },
    update: {},
    create: {
      name: "Classic White Tee",
      slug: "classic-white-tee",
      description: "Timeless white t-shirt made from premium cotton.",
      price: 29.99,
      comparePrice: 39.99,
      stock: 100,
      sku: "CWT-001",
      images: [],
      categoryId: category.id,
      isActive: true,
      isFeatured: true,
      tags: ["clothing", "basics"],
    },
  });

  console.log("Seed completed:", { superAdmin: superAdmin.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
