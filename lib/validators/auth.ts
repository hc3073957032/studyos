import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
