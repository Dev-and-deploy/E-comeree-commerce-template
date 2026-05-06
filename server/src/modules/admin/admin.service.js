import bcrypt from "bcryptjs";
import { AdminRepository } from "./admin.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { ROLES } from "../../shared/constants/roles.js";

export class AdminService {
  constructor() {
    this.repo = new AdminRepository();
  }

  async getAdmins(query = {}) {
    const where = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined && query.isActive !== "") {
      where.isActive = query.isActive === "true";
    }

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    const allowed = ["name", "email", "role", "createdAt", "updatedAt"];
    const sortBy = allowed.includes(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const { data, total } = await this.repo.findAll({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createAdmin(data, requestingUser) {
    // Only SUPER_ADMIN can create another SUPER_ADMIN
    if (data.role === ROLES.SUPER_ADMIN && requestingUser.role !== ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden("Only Super Admin can create Super Admin accounts");
    }

    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw ApiError.conflict("Email already in use");

    const hash = await bcrypt.hash(data.password, 12);
    return this.repo.create({ ...data, password: hash });
  }

  async updateAdmin(id, data, requestingUser) {
    const target = await this.repo.findById(id);
    if (!target) throw ApiError.notFound("Admin not found");

    // Prevent privilege escalation: non-SUPER_ADMIN can't assign SUPER_ADMIN role
    if (data.role === ROLES.SUPER_ADMIN && requestingUser.role !== ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden("Only Super Admin can assign the Super Admin role");
    }

    // SUPER_ADMIN accounts can only be modified by another SUPER_ADMIN
    if (target.role === ROLES.SUPER_ADMIN && requestingUser.role !== ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden("Cannot modify a Super Admin account");
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    } else {
      delete updateData.password;
    }

    return this.repo.update(id, updateData);
  }

  async toggleActive(id, requestingUser) {
    if (id === requestingUser.id) {
      throw ApiError.badRequest("Cannot deactivate your own account");
    }

    const target = await this.repo.findById(id);
    if (!target) throw ApiError.notFound("Admin not found");

    if (target.role === ROLES.SUPER_ADMIN && requestingUser.role !== ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden("Cannot modify a Super Admin account");
    }

    return this.repo.update(id, { isActive: !target.isActive });
  }

  async deleteAdmin(id, requestingUser) {
    if (id === requestingUser.id) {
      throw ApiError.badRequest("Cannot delete your own account");
    }

    const target = await this.repo.findById(id);
    if (!target) throw ApiError.notFound("Admin not found");

    if (target.role === ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden("Super Admin accounts cannot be deleted");
    }

    // Soft delete — deactivate and remove refresh token
    return this.repo.update(id, { isActive: false, refreshToken: null });
  }
}
