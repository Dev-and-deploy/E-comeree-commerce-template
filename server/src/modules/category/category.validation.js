import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().optional(),
    image: z.string().url().optional(),
    parentId: z.string().uuid().optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
    seoTitle: z.string().optional(),
    seoDesc: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createCategorySchema.shape.body.partial(),
});
