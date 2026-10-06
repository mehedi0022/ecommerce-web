import { redirect } from "next/navigation";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; search?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || params.search || "";
  if (query) {
    redirect(`/products?search=${encodeURIComponent(query)}`);
  }
  redirect("/products");
}
