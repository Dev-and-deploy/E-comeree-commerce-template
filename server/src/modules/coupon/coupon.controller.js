import { CouponService } from "./coupon.service.js";
import { success, created, noContent, paginated } from "../../shared/helpers/response.js";

const couponService = new CouponService();

export const getCoupons = async (req, res, next) => {
  try {
    const { coupons, pagination } = await couponService.getCoupons(req.query);
    paginated(res, coupons, pagination);
  } catch (err) { next(err); }
};

export const getCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.getCoupon(req.params.id);
    success(res, coupon);
  } catch (err) { next(err); }
};

export const getBannerCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.getBannerCoupon();
    success(res, coupon);
  } catch (err) { next(err); }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    created(res, coupon, "Coupon created");
  } catch (err) { next(err); }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    success(res, coupon, "Coupon updated");
  } catch (err) { next(err); }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await couponService.deleteCoupon(req.params.id);
    noContent(res);
  } catch (err) { next(err); }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.validateCoupon(req.body.code, req.body.orderAmount ?? 0);
    success(res, coupon);
  } catch (err) { next(err); }
};
