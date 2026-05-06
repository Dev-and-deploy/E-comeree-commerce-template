import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.number().positive(),
    comparePrice: z.number().positive().optional(),
    stock: z.number().int().min(0).default(0),
    sku: z.string().optional(),
    images: z.array(z.string().url()).default([]),
    categoryId: z.string().uuid(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDesc: z.string().optional(),
    seoKeywords: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createProductSchema.shape.body.partial(),
});

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
