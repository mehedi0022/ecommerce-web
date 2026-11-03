"use client";

import { use } from "react";
import { useGetLandingPageQuery } from "@/modules/landing-page/landingPageApi";
import { LandingPageForm } from "@/modules/landing-page/components/LandingPageForm";
import { Loader2 } from "lucide-react";

export default function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useGetLandingPageQuery(Number(id));

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-lg font-bold text-destructive">Landing page not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The landing page you are trying to edit does not exist or has been removed.
        </p>
      </div>
    );
  }

  return <LandingPageForm initialData={data.data} isEdit={true} />;
}
