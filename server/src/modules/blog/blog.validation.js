import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal("")).transform((v) => v || undefined);

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(500),
    slug: z.string().min(1, "Slug is required").max(500),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(["draft", "published", "scheduled"]).default("draft"),
    author: z.string().min(1, "Author is required"),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featuredImage: optionalUrl,
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    canonicalUrl: optionalUrl,
    focusKeyword: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: optionalUrl,
    noIndex: z.boolean().default(false),
    noFollow: z.boolean().default(false),
    structuredData: z.string().optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});

export const updateBlogSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createBlogSchema.shape.body.partial(),
});
