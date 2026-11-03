"use client";

import { use } from "react";
import Link from "next/link";
import { Loader2, PackageX, Home, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetPublicLandingPageQuery } from "@/modules/landing-page/landingPageApi";
import { LandingPageStoreView } from "@/modules/landing-page/components/LandingPageStoreView";

export default function PublicDealPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading, error } = useGetPublicLandingPageQuery(slug, {
    skip: !slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">
            Loading special offer...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border bg-card p-8 shadow-xl text-center space-y-5">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
            <PackageX className="size-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground">অফারটি পাওয়া যায়নি</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              এই ডিল বা ল্যান্ডিং পেজের মেয়াদ শেষ হয়ে থাকতে পারে অথবা ঠিকানাটি সঠিক নয়। অনুগ্রহ করে আমাদের মূল স্টোরে ঘুরে আসুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2 w-full sm:w-auto rounded-xl")}
            >
              <Home className="size-4" />
              <span>হোমপেজে যান</span>
            </Link>

            <Link
              href="/products"
              className={cn(buttonVariants(), "gap-2 w-full sm:w-auto rounded-xl font-bold")}
            >
              <ShoppingBag className="size-4" />
              <span>অন্যান্য পণ্য দেখুন</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LandingPageStoreView landingPage={data.data} />;
}
