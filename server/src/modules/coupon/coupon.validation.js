import { z } from "zod";

const couponTypes = ["PERCENTAGE", "FIXED", "FREE_SHIPPING", "BUY_X_GET_Y"];

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50).toUpperCase(),
    type: z.enum(couponTypes),
    value: z.number().min(0).default(0),
    minOrderAmount: z.number().min(0).optional().nullable(),
    maxUses: z.number().int().min(1).optional().nullable(),
    isActive: z.boolean().default(true),
    startDate: z.string().datetime({ offset: true }).optional().nullable(),
    expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
    showInBanner: z.boolean().default(false),
    bannerTitle: z.string().max(200).optional().nullable(),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createCouponSchema.shape.body.partial(),
});
