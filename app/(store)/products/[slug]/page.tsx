"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { useGetPublicProductBySlugQuery } from "@/modules/product/productApi";

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useGetPublicProductBySlugQuery(
    params.slug,
  );
  const product = data?.data;
  const [selectedImage, setSelectedImage] = useState(0);
  if (isLoading)
    return (
      <StoreContainer className="py-10">
        <p>Loading product...</p>
      </StoreContainer>
    );
  if (isError || !product)
    return (
      <StoreContainer className="py-10">
        <p className="text-destructive">Product not found.</p>
      </StoreContainer>
    );
  const images = product.images ?? [];
  const image = images[selectedImage];
  return (
    <StoreContainer className="py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
            {image ? (
              <img
                src={image.imageUrl}
                alt={image.altText || product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground">No image</span>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            {images.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedImage(index)}
                className="h-16 w-16 overflow-hidden rounded border"
              >
                <img
                  src={item.imageUrl}
                  alt={item.altText || product.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-muted-foreground">
            {product.description || product.shortDescription}
          </p>
          <div className="mt-8 space-y-3">
            <h2 className="font-semibold">Available variants</h2>
            {(product.variants ?? []).map((variant) => (
              <div key={variant.id} className="rounded border p-3">
                <div className="flex justify-between">
                  <span>{variant.sku}</span>
                  <span className="font-semibold">{variant.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StoreContainer>
  );
}
