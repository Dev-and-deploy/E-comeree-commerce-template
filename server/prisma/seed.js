import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories } from "./data/categories.js";
import { products } from "./data/products.js";

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ─────────────────────────────────────────────────────────────
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

  // ── Templates ──────────────────────────────────────────────────────────────
  const fashionTemplate = await prisma.template.upsert({
    where: { slug: "fashion" },
    update: {},
    create: { name: "Fashion", slug: "fashion", description: "Elegant fashion-forward storefront", isActive: true },
  });

  for (const t of [
    { name: "Electronics", slug: "electronics", description: "Tech-focused modern storefront" },
    { name: "Minimal", slug: "minimal", description: "Clean minimalist design" },
    { name: "Modern", slug: "modern", description: "Bold modern commerce" },
  ]) {
    await prisma.template.upsert({ where: { slug: t.slug }, update: {}, create: { ...t, isActive: true } });
  }

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

  // ── Categories ─────────────────────────────────────────────────────────────
  const createdCategories = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { image: cat.image, sortOrder: cat.sortOrder },
      create: { ...cat, isActive: true },
    });
    createdCategories[cat.slug] = created;
  }

  // ── Products ───────────────────────────────────────────────────────────────
  for (const product of products) {
    const { categorySlug, ...data } = product;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: { images: data.images, price: data.price, comparePrice: data.comparePrice, stock: data.stock },
      create: { ...data, categoryId: createdCategories[categorySlug].id, isActive: true },
    });
  }

  console.log(`Seed completed: ${products.length} products across ${categories.length} categories`);
  console.log(`Admin login: ${superAdmin.email} / Admin@123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
