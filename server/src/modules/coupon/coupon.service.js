import { CouponRepository } from "./coupon.repository.js";
import { ApiError } from "../../shared/errors/ApiError.js";
import { getPagination, buildPaginationMeta } from "../../shared/helpers/pagination.js";

export class CouponService {
  constructor() {
    this.repo = new CouponRepository();
  }

  async getCoupons(query) {
    const { page, limit, skip } = getPagination(query);
    const where = {};

    if (query.search) {
      where.code = { contains: query.search.toUpperCase(), mode: "insensitive" };
    }
    if (query.isActive !== undefined && query.isActive !== "") {
      where.isActive = query.isActive === "true";
    }
    if (query.type) {
      where.type = query.type.toUpperCase();
    }

    const allowed = ["code", "createdAt", "usedCount", "value"];
    const sortBy = allowed.includes(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [coupons, total] = await this.repo.findAll({
      skip, limit, where, orderBy: { [sortBy]: sortOrder },
    });
    return { coupons, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getCoupon(id) {
    const coupon = await this.repo.findById(id);
    if (!coupon) throw ApiError.notFound("Coupon not found");
    return coupon;
  }

  async getBannerCoupon() {
    return this.repo.findActiveBanner();
  }

  async createCoupon(data) {
    const existing = await this.repo.findByCode(data.code.toUpperCase());
    if (existing) throw ApiError.conflict("Coupon code already exists");

    if (data.showInBanner) {
      await this._clearOtherBanners(null);
    }

    return this.repo.create({ ...data, code: data.code.toUpperCase() });
  }

  async updateCoupon(id, data) {
    const coupon = await this.repo.findById(id);
    if (!coupon) throw ApiError.notFound("Coupon not found");

    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existing = await this.repo.findByCode(data.code.toUpperCase());
      if (existing) throw ApiError.conflict("Coupon code already exists");
      data.code = data.code.toUpperCase();
    }

    if (data.showInBanner) {
      await this._clearOtherBanners(id);
    }

    return this.repo.update(id, data);
  }

  async deleteCoupon(id) {
    const coupon = await this.repo.findById(id);
    if (!coupon) throw ApiError.notFound("Coupon not found");
    await this.repo.delete(id);
  }

  async validateCoupon(code, orderAmount) {
    const coupon = await this.repo.findByCode(code.toUpperCase());
    if (!coupon) throw ApiError.notFound("Coupon not found");
    if (!coupon.isActive) throw ApiError.badRequest("Coupon is inactive");

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) throw ApiError.badRequest("Coupon not yet active");
    if (coupon.expiresAt && coupon.expiresAt < now) throw ApiError.badRequest("Coupon has expired");
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw ApiError.badRequest("Coupon usage limit reached");
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw ApiError.badRequest(`Minimum order amount is ${coupon.minOrderAmount}`);
    }

    return coupon;
  }

  async _clearOtherBanners(excludeId) {
    const banner = await this.repo.findActiveBanner();
    if (banner && banner.id !== excludeId) {
      await this.repo.update(banner.id, { showInBanner: false });
    }
  }
}
