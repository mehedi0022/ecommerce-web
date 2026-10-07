"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

import { useRegisterMutation } from "../authApi";
import { registerSchema, type RegisterFormValues } from "../auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      userName: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() || undefined,
        userName: values.userName?.trim() || undefined,
        password: values.password,
      }).unwrap();
      router.replace("/login");
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Unable to create your account. Please try again.",
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName">
          Full name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            placeholder="Jane Doe"
            className="pl-9 h-10"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs font-medium text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">
          Phone number <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            className="pl-9 h-10"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </div>
        {errors.phone ? (
          <p className="text-xs font-medium text-destructive">
            {errors.phone.message}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            We will use this phone number for order updates and verification.
          </p>
        )}
      </div>

      {/* Email (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">Email address</Label>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-9 h-10"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs font-medium text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Username (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="userName">Username</Label>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="userName"
            type="text"
            placeholder="janedoe"
            className="pl-9 h-10"
            aria-invalid={Boolean(errors.userName)}
            {...register("userName")}
          />
        </div>
        {errors.userName && (
          <p className="text-xs font-medium text-destructive">
            {errors.userName.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Password <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-9 h-10"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          "Creating account..."
        ) : (
          <span className="flex items-center gap-2">
            Create account <ArrowRight className="size-4" />
          </span>
        )}
      </Button>
    </form>
  );
}
