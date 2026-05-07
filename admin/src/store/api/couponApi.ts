import { baseApi } from "./baseApi";
import type { PaginatedResponse } from "./productApi";

export type CouponType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "BUY_X_GET_Y";
export type CouponStatus = "active" | "expired" | "scheduled" | "disabled";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  expiresAt: string | null;
  showInBanner: boolean;
  bannerTitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateCouponBody {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  isActive?: boolean;
  startDate?: string | null;
  expiresAt?: string | null;
  showInBanner?: boolean;
  bannerTitle?: string | null;
}

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<PaginatedResponse<Coupon>, CouponParams | void>({
      query: (params) => ({ url: "/coupons", params: params ?? {} }),
      providesTags: ["Discounts"],
    }),
    createCoupon: builder.mutation<{ data: Coupon }, CreateCouponBody>({
      query: (body) => ({ url: "/coupons", method: "POST", body }),
      invalidatesTags: ["Discounts"],
    }),
    updateCoupon: builder.mutation<{ data: Coupon }, Partial<CreateCouponBody> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Discounts"],
    }),
    deleteCoupon: builder.mutation<void, string>({
      query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Discounts"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
