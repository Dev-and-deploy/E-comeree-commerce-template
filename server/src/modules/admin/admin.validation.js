import { z } from "zod";

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"], { message: "Role must be SUPER_ADMIN, ADMIN, or EDITOR" }),
    phone: z.string().optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateAdminSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).max(100).optional(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const adminIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
