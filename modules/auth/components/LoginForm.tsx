"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "../authSlice";
import { sessionDestination } from "../redirect";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

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
      email: "",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
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

      {/* Password Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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

      {/* Remember Me */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) =>
            setValue("rememberMe", checked === true, { shouldDirty: true })
          }
        />
        <Label
          htmlFor="rememberMe"
          className="cursor-pointer text-sm font-normal text-muted-foreground"
        >
          Remember me for 30 days
        </Label>
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
          "Signing in..."
        ) : (
          <span className="flex items-center gap-2">
            Sign in <ArrowRight className="size-4" />
          </span>
        )}
      </Button>
    </form>
  );
}
