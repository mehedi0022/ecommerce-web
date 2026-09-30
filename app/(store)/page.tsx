import { StoreContainer } from "@/components/layout/store/StoreContainer";

export default function HomePage() {
  return (
    <StoreContainer className="py-10">
      <h1 className="text-3xl font-bold">Storefront</h1>

      <p className="mt-2 text-muted-foreground">
        Discover our latest products.
      </p>
    </StoreContainer>
  );
}
