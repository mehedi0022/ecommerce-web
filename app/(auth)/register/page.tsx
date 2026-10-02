import Link from "next/link";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand Hero Side */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
        <div className="absolute -left-20 -top-20 size-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShoppingBag className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">LUXE STORE</span>
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
                  On all orders over $100 worldwide
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 text-primary border border-zinc-800">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  30-Day Easy Returns
                </p>
                <p className="text-xs text-zinc-400">
                  Hassle-free exchange policy
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

      {/* Form Side */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-background">
        <div className="flex justify-end">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm space-y-6 py-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Join us to enjoy exclusive shopping rewards
            </p>
          </div>

          <RegisterForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By registering, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
