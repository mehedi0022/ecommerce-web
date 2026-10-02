import { ProductEditor } from "@/modules/product/components/ProductEditor";
export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams;
  return <ProductEditor edit={Boolean(draft)} productId={draft ? Number(draft) : undefined} />;
}
