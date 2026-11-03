import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { ProductFilterSidebar } from "@/modules/product/components/store/ProductFilterSidebar";
import { ProductFilterDrawer } from "@/modules/product/components/store/ProductFilterDrawer";
import { ProductSortSelect } from "@/modules/product/components/store/ProductSortSelect";
import { ProductActiveFilters } from "@/modules/product/components/store/ProductActiveFilters";
import { ProductPagination } from "@/modules/product/components/store/ProductPagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PackageX,
  Layers,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { Product } from "@/modules/product/types";
import type { Category } from "@/modules/category/types";
import type { Brand } from "@/modules/brand/types";

export const dynamic = "force-dynamic";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

interface CategoryPageSearchParams {
  search?: string;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatSlugTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function findCategoryInTree(
  categories: Category[],
  targetSlug: string
): Category | null {
  for (const cat of categories) {
    if (cat.slug.toLowerCase() === targetSlug.toLowerCase()) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryInTree(cat.children, targetSlug);
      if (found) return found;
    }
  }
  return null;
}

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = findCategoryInTree(categories, slug);

  const titleName = category ? category.name : formatSlugTitle(slug);
  const title = `${titleName} Products | Store`;
  const description =
    category?.description ||
    `Explore our authentic collection of ${titleName} products with fast delivery across Bangladesh.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

// ─── Data Fetchers ───────────────────────────────────────────────────────────
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

async function getCategoryProducts(
  categorySlug: string,
  params: CategoryPageSearchParams,
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
  qs.set("categorySlug", categorySlug);
  qs.set("page", params.page || "1");
  qs.set("limit", "16");

  if (params.search) qs.set("search", params.search);
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
      return {
        products: [],
        meta: { page: 1, limit: 16, total: 0, totalPages: 1 },
      };
    }
    const json = await res.json();
    return {
      products: json.data || [],
      meta: json.meta || { page: 1, limit: 16, total: 0, totalPages: 1 },
    };
  } catch {
    return {
      products: [],
      meta: { page: 1, limit: 16, total: 0, totalPages: 1 },
    };
  }
}

// ─── Main Category Page Component ───────────────────────────────────────────
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CategoryPageSearchParams>;
}) {
  const { slug } = await params;
  const search = await searchParams;

  // Concurrent fetching of categories, brands and products
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const activeCategory = findCategoryInTree(categories, slug);
  const categoryTitle = activeCategory ? activeCategory.name : formatSlugTitle(slug);

  const { products, meta } = await getCategoryProducts(slug, search, brands);

  // Subcategories (child categories if any)
  const subcategories = activeCategory?.children || [];

  // Schema.org Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryTitle,
    description:
      activeCategory?.description ||
      `Browse top quality ${categoryTitle} products.`,
    url: `/category/${slug}`,
    numberOfItems: products.length,
    itemListElement: products.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `/products/${item.slug}`,
    })),
  };

  const categoryImageUrl = activeCategory?.image
    ? mediaUrl(activeCategory.image)
    : null;

  return (
    <StoreContainer className="py-8 md:py-12">
      {/* Structured SEO Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href="/products"
          className="hover:text-foreground transition-colors"
        >
          Categories
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground">{categoryTitle}</span>
      </nav>

      {/* ── Category Banner Header ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-muted/50 via-card to-muted/30 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              <Layers className="size-3.5" />
              <span>Category</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {categoryTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {activeCategory?.description ||
                `Explore our complete collection of ${categoryTitle} products with genuine quality and express nationwide delivery.`}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-foreground font-bold">
                <ShoppingBag className="size-3.5 text-primary" />
                {meta.total} {meta.total === 1 ? "Product" : "Products"} Available
              </span>
            </div>
          </div>

          {/* Category Thumbnail / Illustration */}
          {categoryImageUrl ? (
            <div className="relative size-24 sm:size-28 rounded-2xl overflow-hidden border-2 border-border/80 shadow-sm shrink-0 self-start md:self-center">
              <Image
                src={categoryImageUrl}
                alt={categoryTitle}
                fill
                unoptimized
                sizes="112px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-20 sm:size-24 rounded-2xl border-2 border-border/80 bg-primary/5 text-primary items-center justify-center shrink-0 self-start md:self-center">
              <Layers className="size-10" />
            </div>
          )}
        </div>
      </div>

      {/* ── Subcategories Quick Navigation (If Available) ────────────── */}
      {subcategories.length > 0 && (
        <div className="mb-8 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Browse Subcategories
            </h2>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {subcategories.map((sub: Category) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-card hover:text-primary transition-all shadow-2xs shrink-0 group"
              >
                <span>{sub.name}</span>
                <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Toolbar: Filter Trigger & Sorting ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing {products.length} of {meta.total} results in{" "}
          <strong className="text-foreground">{categoryTitle}</strong>
        </p>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <ProductFilterDrawer categories={categories} brands={brands} />
          <ProductSortSelect />
        </div>
      </div>

      {/* Active Filter Chips */}
      <div className="mb-6">
        <ProductActiveFilters
          categories={categories}
          brands={brands}
          totalResults={meta.total}
        />
      </div>

      {/* ── Layout: Filter Sidebar + Products Grid ───────────────────── */}
      <div className="flex items-start gap-8 lg:gap-10">
        {/* Desktop Left Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block sticky top-24 self-start rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
          <ProductFilterSidebar categories={categories} brands={brands} />
        </aside>

        {/* Main Products Grid */}
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

              {/* Server-Side Pagination */}
              <ProductPagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                limit={meta.limit}
              />
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center my-6 max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <PackageX className="size-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">
                  No products in {categoryTitle} yet
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We are constantly expanding our catalog. If you used search or
                  filter criteria, try clearing them to see other available items.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <Link
                  href={`/category/${slug}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-xl text-xs font-bold"
                  )}
                >
                  Reset Category Filters
                </Link>
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-xl text-xs font-bold gap-1 bg-primary text-primary-foreground"
                  )}
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </StoreContainer>
  );
}
