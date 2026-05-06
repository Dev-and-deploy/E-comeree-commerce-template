import { ProductRepository } from "./product.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "../../core/cache/redis.js";
import { getPagination, buildPaginationMeta } from "../../shared/helpers/pagination.js";

export class ProductService {
  constructor() {
    this.repo = new ProductRepository();
  }

  async getProducts(query) {
    const { page, limit, skip } = getPagination(query);
    const where = { isActive: true };

    if (query.category) where.category = { slug: query.category };
    if (query.search) where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
    if (query.featured === "true") where.isFeatured = true;
    if (query.minPrice) where.price = { ...where.price, gte: parseFloat(query.minPrice) };
    if (query.maxPrice) where.price = { ...where.price, lte: parseFloat(query.maxPrice) };

    const orderBy = query.sort === "price_asc" ? { price: "asc" }
      : query.sort === "price_desc" ? { price: "desc" }
      : query.sort === "newest" ? { createdAt: "desc" }
      : { createdAt: "desc" };

    const [products, total] = await this.repo.findAll({ skip, limit, where, orderBy });
    return { products, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getProduct(slug) {
    const cacheKey = `product:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const product = await this.repo.findBySlug(slug);
    if (!product) throw ApiError.notFound("Product not found");

    await cacheSet(cacheKey, product, 300);
    return product;
  }

  async createProduct(data) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw ApiError.conflict("Product slug already exists");
    const product = await this.repo.create(data);
    await cacheDelPattern("product:*");
    return product;
  }

  async updateProduct(id, data) {
    const product = await this.repo.findById(id);
    if (!product) throw ApiError.notFound("Product not found");
    const updated = await this.repo.update(id, data);
    await cacheDel(`product:${product.slug}`);
    await cacheDelPattern("products:*");
    return updated;
  }

  async deleteProduct(id) {
    const product = await this.repo.findById(id);
    if (!product) throw ApiError.notFound("Product not found");
    await this.repo.delete(id);
    await cacheDel(`product:${product.slug}`);
  }

  async getAdminProducts(query) {
    const { page, limit, skip } = getPagination(query);
    const where = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { sku: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.category) where.categoryId = query.category;
    if (query.isActive !== undefined && query.isActive !== "") {
      where.isActive = query.isActive === "true";
    }
    if (query.isFeatured !== undefined && query.isFeatured !== "") {
      where.isFeatured = query.isFeatured === "true";
    }

    const dateFrom = query.date_from;
    const dateTo = query.date_to;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const allowed = ["name", "price", "stock", "createdAt", "updatedAt", "sku"];
    const sortBy = allowed.includes(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [products, total] = await this.repo.findAll({
      skip, limit, where, orderBy: { [sortBy]: sortOrder },
    });
    return { products, pagination: buildPaginationMeta(total, page, limit) };
  }

  getCategories() {
    return this.repo.findCategories();
  }

  async createCategory(data) {
    const existing = await this.repo.findCategoryBySlug(data.slug);
    if (existing) throw ApiError.conflict("Category slug already exists");
    return this.repo.createCategory(data);
  }

  async updateCategory(id, data) {
    return this.repo.updateCategory(id, data);
  }

  async deleteCategory(id) {
    return this.repo.deleteCategory(id);
  }
}
