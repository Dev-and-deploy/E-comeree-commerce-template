import { BlogRepository } from "./blog.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "../../core/cache/redis.js";
import { getPagination, buildPaginationMeta } from "../../shared/helpers/pagination.js";

export class BlogService {
  constructor() {
    this.repo = new BlogRepository();
  }

  async getBlogs(query) {
    const { page, limit, skip } = getPagination(query);
    const where = { status: "PUBLISHED" };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { excerpt: { contains: query.search, mode: "insensitive" } },
        { author: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.tag) where.tags = { has: query.tag };

    const allowed = ["title", "publishedAt", "createdAt"];
    const sortBy = allowed.includes(query.sortBy) ? query.sortBy : "publishedAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [blogs, total] = await this.repo.findAll({
      skip, limit, where, orderBy: { [sortBy]: sortOrder },
    });
    return { blogs, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getBlog(slug) {
    const cacheKey = `blog:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const blog = await this.repo.findBySlug(slug);
    if (!blog || blog.status !== "PUBLISHED") throw ApiError.notFound("Blog post not found");

    await cacheSet(cacheKey, blog, 300);
    return blog;
  }

  async getAdminBlogs(query) {
    const { page, limit, skip } = getPagination(query);
    const where = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { author: { contains: query.search, mode: "insensitive" } },
        { excerpt: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status.toUpperCase();
    if (query.category) where.category = { contains: query.category, mode: "insensitive" };

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

    const allowed = ["title", "publishedAt", "createdAt", "author"];
    const sortBy = allowed.includes(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [blogs, total] = await this.repo.findAll({
      skip, limit, where, orderBy: { [sortBy]: sortOrder },
    });
    return { blogs, pagination: buildPaginationMeta(total, page, limit) };
  }

  async createBlog(data) {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) throw ApiError.conflict("Blog slug already exists");

    const blogData = this._mapStatus(data);
    if (blogData.status === "PUBLISHED" && !blogData.publishedAt) {
      blogData.publishedAt = new Date();
    }

    const blog = await this.repo.create(blogData);
    await cacheDelPattern("blogs:*");
    return blog;
  }

  async updateBlog(id, data) {
    const blog = await this.repo.findById(id);
    if (!blog) throw ApiError.notFound("Blog post not found");

    if (data.slug && data.slug !== blog.slug) {
      const existing = await this.repo.findBySlug(data.slug);
      if (existing) throw ApiError.conflict("Blog slug already exists");
    }

    const updateData = this._mapStatus(data);
    if (
      updateData.status === "PUBLISHED" &&
      blog.status !== "PUBLISHED" &&
      !updateData.publishedAt
    ) {
      updateData.publishedAt = new Date();
    }

    const updated = await this.repo.update(id, updateData);
    await cacheDel(`blog:${blog.slug}`);
    if (data.slug && data.slug !== blog.slug) await cacheDel(`blog:${data.slug}`);
    await cacheDelPattern("blogs:*");
    return updated;
  }

  async deleteBlog(id) {
    const blog = await this.repo.findById(id);
    if (!blog) throw ApiError.notFound("Blog post not found");
    await this.repo.delete(id);
    await cacheDel(`blog:${blog.slug}`);
    await cacheDelPattern("blogs:*");
  }

  _mapStatus(data) {
    const mapped = { ...data };
    if (mapped.status) mapped.status = mapped.status.toUpperCase();
    return mapped;
  }
}
