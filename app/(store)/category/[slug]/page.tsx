export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold capitalize">{slug}</h1>
      <p className="text-muted-foreground mt-2">Showing products in {slug}.</p>
    </div>
  );
}
