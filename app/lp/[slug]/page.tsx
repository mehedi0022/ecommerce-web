"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyLandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (slug) {
      router.replace(`/deal/${slug}`);
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Redirecting to deal...
        </p>
      </div>
    </div>
  );
}
