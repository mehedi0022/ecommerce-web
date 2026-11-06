import Link from "next/link";
import { ForgotPasswordForm } from "@/modules/auth/components/ForgotPasswordForm";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 bg-muted/20">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 size-72 sm:size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 -right-20 size-72 sm:size-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-background/80 border border-border/70 hover:bg-muted text-foreground transition-all shadow-2xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <ShoppingBag className="size-4" />
          </div>
          <span className="font-black text-sm tracking-tight text-foreground">
            LUXE STORE
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="mx-auto w-full max-w-md my-auto">
        <div className="rounded-3xl border border-border/70 bg-card/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/[0.04]">
          <div className="space-y-1.5 text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Forgot password?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your email and we will send a password reset link
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
        Remember your password?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-foreground font-semibold text-primary"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
