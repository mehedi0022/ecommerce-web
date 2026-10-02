"use client";

import { useState } from "react";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { useListProductsQuery } from "@/modules/product/productApi";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useListProductsQuery({
    page: 1,
    limit: 24,
    search: search || undefined,
    status: "ACTIVE",
  });
  const products = data?.data ?? [];
  return (
    <StoreContainer className="py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Discover our latest products.
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="max-w-sm"
        />
      </div>
      {isLoading && (
        <p className="text-muted-foreground">Loading products...</p>
      )}
      {isError && <p className="text-destructive">Unable to load products.</p>}
      {!isLoading && !isError && products.length === 0 && (
        <p className="text-muted-foreground">No products found.</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </StoreContainer>
  );
}
