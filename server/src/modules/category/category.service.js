import { CategoryRepository } from "./category.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { cacheDelPattern } from "../../core/cache/redis.js";

export class CategoryService {
  constructor() {
    this.repo = new CategoryRepository();
  }

  getCategories() {
    return this.repo.findActive();
  }

  getAllCategories(query = {}) {
    const where = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.isActive !== undefined && query.isActive !== "") {
      where.isActive = query.isActive === "true";
    }

    const allowed = ["name", "slug", "sortOrder", "createdAt", "updatedAt"];
    const sortBy = allowed.includes(query.sortBy) ? query.sortBy : "sortOrder";
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    return this.repo.findAll({ where, orderBy: { [sortBy]: sortOrder } });
  }

  async createCategory(data) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw ApiError.conflict("Category slug already exists");
    return this.repo.create(data);
  }

  async updateCategory(id, data) {
    const category = await this.repo.findById(id);
    if (!category) throw ApiError.notFound("Category not found");
    const updated = await this.repo.update(id, data);
    await cacheDelPattern("product:*");
    await cacheDelPattern("products:*");
    return updated;
  }

  async deleteCategory(id) {
    const category = await this.repo.findById(id);
    if (!category) throw ApiError.notFound("Category not found");
    const updated = await this.repo.softDelete(id);
    await cacheDelPattern("product:*");
    await cacheDelPattern("products:*");
    return updated;
  }
}
