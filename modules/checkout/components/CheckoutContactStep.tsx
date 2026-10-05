"use client";

import Link from "next/link";
import { UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckoutCustomer } from "../checkout.types";
import type { AuthUser } from "@/modules/auth/auth.types";

interface CheckoutContactStepProps {
  user: AuthUser | null;
  customer: CheckoutCustomer;
  onChangeCustomer: (customer: CheckoutCustomer) => void;
}

export function CheckoutContactStep({
  user,
  customer,
  onChangeCustomer,
}: CheckoutContactStepProps) {
  if (user) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                {user.fullName || user.userName || user.email}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Account
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          We&apos;ll use this information to send you order updates and tracking.
        </p>
        <Link
          href="/login?redirect=/checkout"
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Sign in
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cust-name" className="text-xs font-semibold">
            Your Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cust-name"
            placeholder="e.g. Tanvir Ahmed"
            value={customer.name}
            onChange={(e) =>
              onChangeCustomer({ ...customer, name: e.target.value })
            }
            className="h-10 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cust-phone" className="text-xs font-semibold">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cust-phone"
            type="tel"
            placeholder="e.g. 01712345678"
            value={customer.phone}
            onChange={(e) =>
              onChangeCustomer({ ...customer, phone: e.target.value })
            }
            className="h-10 text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cust-email" className="text-xs font-semibold">
          Email Address{" "}
          <span className="text-xs font-normal text-muted-foreground">(For order receipt)</span>
        </Label>
        <Input
          id="cust-email"
          type="email"
          placeholder="e.g. tanvir@example.com"
          value={customer.email || ""}
          onChange={(e) =>
            onChangeCustomer({ ...customer, email: e.target.value })
          }
          className="h-10 text-sm"
        />
      </div>
    </div>
  );
}
