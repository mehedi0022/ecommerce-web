import { ProductEditor } from "@/modules/product/components/ProductEditor";
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditor edit productId={Number(id)} />;
}
