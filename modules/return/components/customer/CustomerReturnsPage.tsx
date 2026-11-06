"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CustomerReturnsList } from "./CustomerReturnsList";
import { AccountLayoutShell } from "@/modules/account/components/AccountLayoutShell";

export function CustomerReturnsPage() {
  const actions = (
    <Link
      href="/account/orders"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1.5 text-xs font-semibold rounded-xl"
      )}
    >
      <Package className="size-3.5" />
      <span>View Past Orders</span>
    </Link>
  );

  return (
    <AccountLayoutShell
      title="Returns & Exchanges"
      description="Track the status and progress of your return requests and refund payouts."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Account", href: "/account" },
        { label: "Returns & Exchanges" },
      ]}
      actions={actions}
    >
      <div className="space-y-6">
        <CustomerReturnsList hideHeader={true} />
      </div>
    </AccountLayoutShell>
  );
}
