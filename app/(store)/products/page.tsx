import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { ProductFilterSidebar } from "@/modules/product/components/store/ProductFilterSidebar";
import { ProductFilterDrawer } from "@/modules/product/components/store/ProductFilterDrawer";
import { ProductSortSelect } from "@/modules/product/components/store/ProductSortSelect";
import { ProductActiveFilters } from "@/modules/product/components/store/ProductActiveFilters";
import { ProductPagination } from "@/modules/product/components/store/ProductPagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PackageX, ShoppingBag, Sparkles } from "lucide-react";
import type { Product } from "@/modules/product/types";
import type { Category } from "@/modules/category/types";
import type { Brand } from "@/modules/brand/types";

export const dynamic = "force-dynamic";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

interface ProductsSearchParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  inStock?: string;
  isFeatured?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
}

// ─── Dynamic SEO Metadata Generator ──────────────────────────────────────────
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  let title = "Shop All Products | Premium E-Commerce";
  let description =
    "Explore our complete collection of top-rated products with express delivery across Bangladesh.";

  if (params.search) {
    title = `Search results for "${params.search}" | Store`;
    description = `Find the best deals and items matching "${params.search}".`;
  } else if (params.category) {
    const formattedCat = params.category
      .split(",")
      .map((slug) =>
        slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      )
      .join(", ");
    title = `${formattedCat} Products | Store`;
    description = `Browse authentic ${formattedCat} items with fast delivery and easy returns.`;
  } else if (params.brand) {
    title = `${params.brand.toUpperCase()} Products | Store`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: "/products",
    },
  };
}

// ─── Server Data Fetchers ───────────────────────────────────────────────────
async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories/public/tree`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_URL}/brands/public?limit=100`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getProducts(
  params: ProductsSearchParams,
  brands: Brand[]
): Promise<{
  products: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const qs = new URLSearchParams();
  qs.set("status", "ACTIVE");
  qs.set("page", params.page || "1");
  qs.set("limit", "16");

  if (params.search) qs.set("search", params.search);
  if (params.category) qs.set("categorySlug", params.category);
  if (params.minPrice) qs.set("minPrice", params.minPrice);
  if (params.maxPrice) qs.set("maxPrice", params.maxPrice);
  if (params.rating) qs.set("rating", params.rating);
  if (params.inStock === "true") qs.set("inStock", "true");
  if (params.isFeatured === "true") qs.set("isFeatured", "true");
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

  // Map brand slug(s) to brand ID(s)
  if (params.brand) {
    const slugs = params.brand.split(",").filter(Boolean);
    const matchingBrandIds = brands
      .filter((b) => slugs.includes(b.slug))
      .map((b) => b.id);
    if (matchingBrandIds.length > 0) {
      qs.set("brandIds", matchingBrandIds.join(","));
    }
  }

  try {
    const res = await fetch(`${API_URL}/products/public?${qs.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { products: [], meta: { page: 1, limit: 16, total: 0, totalPages: 1 } };
    }
    const json = await res.json();
    return {
      products: json.data || [],
      meta: json.meta || { page: 1, limit: 16, total: 0, totalPages: 1 },
    };
  } catch {
    return { products: [], meta: { page: 1, limit: 16, total: 0, totalPages: 1 } };
  }
}

// ─── Main Products Page (Server Component) ──────────────────────────────────
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const params = await searchParams;

  // Concurrent server-side fetching
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const { products, meta } = await getProducts(params, brands);

  // Determine current active category title
  const activeCategory = params.category
    ? categories.find((c) => c.slug === params.category) ||
      categories
        .flatMap((c) => c.children || [])
        .find((c) => c.slug === params.category)
    : null;

  const pageTitle = params.search
    ? `Search: "${params.search}"`
    : activeCategory
    ? activeCategory.name
    : "All Products";

  // Schema.org JSON-LD for rich search engine results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    numberOfItems: products.length,
    itemListElement: products.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `/products/${item.slug}`,
    })),
  };

  return (
    <StoreContainer className="py-8 md:py-12">
      {/* Inject Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Page Header & Breadcrumb ────────────────────────────────── */}
      <div className="border-b pb-6 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {activeCategory.name}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mt-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                {pageTitle}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {meta.total > 0
                  ? `Showing ${products.length} of ${meta.total} products available`
                  : "Explore our curated catalog with verified quality."}
              </p>
            </div>

            {/* Mobile Filter Trigger & Sort Dropdown */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <ProductFilterDrawer
                categories={categories}
                brands={brands}
              />
              <ProductSortSelect />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        <div className="mt-3">
          <ProductActiveFilters
            categories={categories}
            brands={brands}
            totalResults={meta.total}
          />
        </div>
      </div>

      {/* ── Layout: Left Sidebar + Right Products Grid ────────────────── */}
      <div className="flex items-start gap-8 lg:gap-10">
        {/* Desktop Left Filter Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block sticky top-24 self-start rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <ProductFilterSidebar
            categories={categories}
            brands={brands}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {products.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="h-full"
                  />
                ))}
              </div>

              {/* Server-Side Pagination Links */}
              <ProductPagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                limit={meta.limit}
              />
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="rounded-2xl border border-dashed border-border p-12 text-center my-6 max-w-md mx-auto space-y-4">
              <div className="size-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                <PackageX className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  No products found
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We couldn&apos;t find any items matching your current filters. Try
                  clearing filters or adjusting your price and search keywords.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "font-semibold text-xs"
                  )}
                >
                  Clear all filters
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </StoreContainer>
  );
}
