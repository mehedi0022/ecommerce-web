"use client";

import { useState } from "react";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { useListPublicProductsQuery } from "@/modules/product/productApi";
import { Button } from "@/components/ui/button";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useListPublicProductsQuery({
    page,
    limit: 24,
    search: search.trim() || undefined,
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
          maxLength={100}
          aria-label="Search products"
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="max-w-sm"
        />
      </div>
      {isLoading && (
        <p className="text-muted-foreground">Loading products...</p>
      )}
      {isError && <div role="alert"><p className="text-destructive">Unable to load products.</p><Button variant="outline" onClick={refetch}>Try again</Button></div>}
      {!isLoading && !isError && products.length === 0 && (
        <p className="text-muted-foreground">No products found.</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!isError && <div className="mt-8 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{data?.meta.total ?? 0} products</p><div className="flex gap-2"><Button variant="outline" disabled={page === 1 || isFetching} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" disabled={page >= (data?.meta.totalPages ?? 1) || isFetching} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
    </StoreContainer>
  );
}
