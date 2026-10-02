"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { useForgotPasswordMutation } from "../authApi";

const schema = z.object({ email: z.email("Please enter a valid email address") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [submit, { isLoading }] = useForgotPasswordMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async (values: Values) => {
    setMessage(null); setError(null);
    try { const result = await submit(values).unwrap(); setMessage(result.message); }
    catch (e) { setError(getApiErrorMessage(e, "Unable to send reset email.")); }
  };

  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}</div>
    {message && <p role="status" className="text-sm text-green-600">{message}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Sending..." : "Send reset link"}</Button>
    <p className="text-center text-sm"><Link href="/login" className="underline">Back to sign in</Link></p>
  </form>;
}
