import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Page not found",
  noIndex: true,
});

export default function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The page you requested could not be found.</p>
    </main>
  );
}
