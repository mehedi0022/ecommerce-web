"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "../authSlice";
import { sessionDestination } from "../redirect";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLoginMutation } from "../authApi";
import { loginSchema, type LoginFormValues } from "../auth.schema";

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = useWatch({ control, name: "rememberMe" });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await login(values).unwrap();
      const user = response.data.user;
      dispatch(setSession(user));
      router.replace(sessionDestination(user.role.key, window.location.search));
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "Unable to sign in. Please try again."),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
      {/* Identifier Input (Phone or Email) */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="identifier" className="text-xs sm:text-sm font-semibold text-foreground">
          Phone or Email address
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="01XXXXXXXXX or name@example.com"
            className="pl-10 h-11 sm:h-12 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/25 text-sm"
            aria-invalid={Boolean(errors.identifier)}
            {...register("identifier")}
          />
        </div>
        {errors.identifier && (
          <p className="text-xs font-medium text-destructive">
            {errors.identifier.message}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-foreground">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-background/50 border-border/80 focus-visible:ring-primary/25 text-sm"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="size-4.5" />
            ) : (
              <Eye className="size-4.5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-2 pt-0.5">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) =>
            setValue("rememberMe", checked === true, { shouldDirty: true })
          }
          className="rounded-md"
        />
        <Label
          htmlFor="rememberMe"
          className="cursor-pointer text-xs sm:text-sm font-normal text-muted-foreground select-none"
        >
          Remember me for 30 days
        </Label>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
        disabled={isLoading}
      >
        {isLoading ? (
          "Signing in..."
        ) : (
          <span className="flex items-center gap-2">
            Sign in <ArrowRight className="size-4.5" />
          </span>
        )}
      </Button>
    </form>
  );
}
