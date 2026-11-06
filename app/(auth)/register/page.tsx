import Link from "next/link";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-2 bg-muted/20">
      {/* Background Ambient Glows - Contained to prevent horizontal scrolling */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-20 size-72 sm:size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 size-72 sm:size-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Brand Hero Side (Desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
        <div className="absolute -left-20 -top-20 size-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShoppingBag className="size-5" />
          </div>
          <span className="text-xl font-black tracking-tight">LUXE STORE</span>
        </div>

        {/* Member Benefits Showcase */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Member Perks & Privileges
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 text-primary border border-zinc-800">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Free Express Shipping
                </p>
                <p className="text-xs text-zinc-400">
                  On all qualifying orders
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 text-primary border border-zinc-800">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Easy Exchanges & Returns
                </p>
                <p className="text-xs text-zinc-400">
                  Hassle-free return policy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 text-primary border border-zinc-800">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Buyer Protection
                </p>
                <p className="text-xs text-zinc-400">
                  Secure end-to-end checkout guarantee
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} LUXE Inc. All rights reserved.
        </div>
      </div>

      {/* Form Side (Mobile & Desktop) */}
      <div className="relative z-10 flex flex-col justify-between p-4 sm:p-8 lg:p-12 min-h-screen w-full max-w-full overflow-hidden">
        {/* Mobile Brand Header */}
        <div className="flex items-center justify-center w-full mb-3 sm:mb-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <ShoppingBag className="size-4.5" />
            </div>
            <span className="font-black text-base tracking-tight text-foreground">
              LUXE STORE
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="mx-auto w-full max-w-md my-auto">
          <div className="rounded-3xl border border-border/70 bg-card/95 backdrop-blur-xl p-5 sm:p-8 shadow-xl shadow-black/[0.04]">
            {/* Segmented Switcher */}
            <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs sm:text-sm font-semibold mb-6">
              <Link
                href="/login"
                className="flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                Sign In
              </Link>
              <span className="flex items-center justify-center py-2 rounded-lg bg-background text-foreground shadow-xs font-bold select-none cursor-default">
                Create Account
              </span>
            </div>

            <div className="space-y-1.5 text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Join our store
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Create an account to track orders & enjoy member privileges
              </p>
            </div>

            <RegisterForm />

            {/* Quick Benefits on Mobile */}
            <div className="mt-6 pt-5 border-t border-border/50 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <Gift className="size-4 text-primary" />
                <span>Welcome Perk</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="size-4 text-emerald-600" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="size-4 text-sky-500" />
                <span>100% Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Terms & Policy */}
        <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
          By registering, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground font-medium"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
