import { UserRepository } from "./user.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { getPagination, buildPaginationMeta } from "../../shared/helpers/pagination.js";

export class UserService {
  constructor() {
    this.repo = new UserRepository();
  }

  async getUsers(query) {
    const { page, limit, skip } = getPagination(query);
    const where = {};
    if (query.role) where.role = query.role;
    if (query.search) where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
    const [users, total] = await this.repo.findAll({ skip, limit, where });
    return { users, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getUser(id) {
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async updateUser(id, data) {
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    if (user.role === "SUPER_ADMIN") {
      if (data.isActive === false) throw ApiError.forbidden("Cannot deactivate super admin");
      if (data.role && data.role !== "SUPER_ADMIN") throw ApiError.forbidden("Cannot change super admin role");
    }
    return this.repo.update(id, data);
  }

  async deleteUser(id) {
    const user = await this.repo.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    if (user.role === "SUPER_ADMIN") throw ApiError.forbidden("Cannot delete super admin");
    return this.repo.delete(id);
  }

  async updateProfile(userId, data) {
    return this.repo.update(userId, { name: data.name, avatar: data.avatar, phone: data.phone });
  }
}
