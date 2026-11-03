import type { Metadata } from "next";
import Link from "next/link";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { ChevronRight, Sparkles, Layers } from "lucide-react";
import { CategoriesBentoGrid } from "@/modules/category/components/store/CategoriesBentoGrid";
import type { Category } from "@/modules/category/types";

export const metadata: Metadata = {
  title: "All Categories & Departments | Store",
  description:
    "Explore our full directory of product departments and subcategories. Discover verified quality essentials with express doorstep delivery nationwide.",
};

export const dynamic = "force-dynamic";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

async function getCategoryTree(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories/public/tree`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategoryTree();

  return (
    <div className="py-8 md:py-14 min-h-screen">
      <StoreContainer>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-foreground">Categories</span>
        </nav>

        {/* Page Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-3">
            <Layers className="size-3.5" />
            <span>Store Taxonomy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            All Categories & Departments
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Browse our complete product taxonomy. Select any department to discover
            curated collections, compare specifications, and find the perfect match.
          </p>
        </div>

        {/* Interactive Bento Visual Grid */}
        <CategoriesBentoGrid categories={categories} />
      </StoreContainer>
    </div>
  );
}
