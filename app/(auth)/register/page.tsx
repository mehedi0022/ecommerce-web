import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold">Create an account</h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Enter your details to create your account.
        </p>

        <RegisterForm />
      </div>
    </main>
  );
}
