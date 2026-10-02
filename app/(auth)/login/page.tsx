import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { ShoppingBag, Star } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Visual / Brand Hero Section */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
        {/* Subtle Background Glow */}
        <div className="absolute -left-20 -top-20 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 size-96 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShoppingBag className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">LUXE STORE</span>
        </div>

        {/* Testimonial / E-commerce Highlight */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="flex gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400" />
            ))}
          </div>
          <blockquote className="text-xl font-medium leading-relaxed tracking-tight text-zinc-100">
            &ldquo;Shopping here has been an incredible experience. The curated
            collections and seamless checkout make it my go-to store.&rdquo;
          </blockquote>
          <div>
            <p className="font-semibold text-white">Sophia Reynolds</p>
            <p className="text-xs text-zinc-400">
              Verified Customer • Joined 2024
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} LUXE Inc. All rights reserved.
        </div>
      </div>

      {/* Form Container */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-background">
        <div className="flex justify-end">
          <Link
            href="/register"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Create account
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm space-y-8 py-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account & orders
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms of Service
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
