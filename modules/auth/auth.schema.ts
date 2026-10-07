import { z } from "zod";

export const BD_PHONE_REGEX = /^(?:\+?880|0)?1[3-9]\d{8}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Phone number or email is required"),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean(),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(
      BD_PHONE_REGEX,
      "Please enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)",
    ),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),

  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type LoginFormValues = z.infer<typeof loginSchema>;
