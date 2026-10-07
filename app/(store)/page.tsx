"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { useListProductsQuery } from "@/modules/product/productApi";
import { StorefrontHeroSlider } from "@/modules/slider/components/store/StorefrontHeroSlider";
import type { Product } from "@/modules/product/types";

const fallbackProducts: Product[] = [
  {
    id: -1,
    name: "Minimal Everyday Tee",
    slug: "minimal-everyday-tee",
    shortDescription: "Soft cotton essential in timeless colors",
    description: null,
    brandId: null,
    status: "ACTIVE",
    isFeatured: true,
    categories: [],
    variants: [
      {
        id: -1,
        productId: -1,
        sku: "MOCK-TEE",
        price: "34.00",
        compareAtPrice: "44.00",
        costPrice: null,
        isActive: true,
        sortOrder: 0,
      },
    ],
  },
  {
    id: -2,
    name: "Utility Canvas Backpack",
    slug: "utility-canvas-backpack",
    shortDescription: "Roomy, durable and ready for every day",
    description: null,
    brandId: null,
    status: "ACTIVE",
    isFeatured: true,
    categories: [],
    variants: [
      {
        id: -2,
        productId: -2,
        sku: "MOCK-BAG",
        price: "68.00",
        compareAtPrice: null,
        costPrice: null,
        isActive: true,
        sortOrder: 0,
      },
    ],
  },
  {
    id: -3,
    name: "Studio Running Sneakers",
    slug: "studio-running-sneakers",
    shortDescription: "Lightweight comfort for your daily miles",
    description: null,
    brandId: null,
    status: "ACTIVE",
    isFeatured: true,
    categories: [],
    variants: [
      {
        id: -3,
        productId: -3,
        sku: "MOCK-SHOE",
        price: "112.00",
        compareAtPrice: "140.00",
        costPrice: null,
        isActive: true,
        sortOrder: 0,
      },
    ],
  },
  {
    id: -4,
    name: "Ceramic Morning Mug",
    slug: "ceramic-morning-mug",
    shortDescription: "Hand-finished form for slow mornings",
    description: null,
    brandId: null,
    status: "ACTIVE",
    isFeatured: false,
    categories: [],
    variants: [
      {
        id: -4,
        productId: -4,
        sku: "MOCK-MUG",
        price: "24.00",
        compareAtPrice: null,
        costPrice: null,
        isActive: true,
        sortOrder: 0,
      },
    ],
  },
];

export default function HomePage() {
  const { data, isFetching } = useListProductsQuery({ page: 1, limit: 8 });
  const products = data?.data?.length ? data.data : fallbackProducts;
  const usingFallback = !data?.data?.length;

  return (
    <>
      <StorefrontHeroSlider />

      <StoreContainer className="py-14 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Curated for you</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Featured products
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-semibold sm:flex"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        {isFetching && !data ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Loading products...
          </p>
        ) : null}
        {usingFallback ? (
          <p className="mb-5 text-xs text-muted-foreground">
            Showing sample products while the catalog loads.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </StoreContainer>
    </>
  );
}
