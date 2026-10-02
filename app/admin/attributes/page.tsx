import { AttributesPage } from "@/modules/catalog/components/AttributesPage";
export default async function Page({ searchParams }: { searchParams: Promise<{ attribute?: string }> }) {
  const { attribute } = await searchParams;
  return <AttributesPage initialId={attribute ? Number(attribute) : undefined}/>;
}
