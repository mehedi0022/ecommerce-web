import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Search", noIndex: true });

export default function SearchPage() {
  return <main><h1>Search</h1></main>;
}
