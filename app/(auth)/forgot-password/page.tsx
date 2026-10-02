import { ForgotPasswordForm } from "@/modules/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold">Forgot password?</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your email and we will send a reset link if the account exists.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
