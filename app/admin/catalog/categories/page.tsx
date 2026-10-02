import { CategoriesPage } from "@/modules/catalog/components/CategoriesPage";
export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <CategoriesPage initialId={category ? Number(category) : undefined}/>;
}
