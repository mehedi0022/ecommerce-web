import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean(),
});

export const registerSchema = z.object({
  userName: z.string().trim().min(1, "Username is required"),

  fullName: z.string().trim().min(1, "Full name is required"),

  email: z.email("Please enter a valid email address"),

  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;
