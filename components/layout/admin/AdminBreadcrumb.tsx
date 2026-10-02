import Link from "next/link";
export type AdminBreadcrumbItem = { label: string; href?: string };
export function AdminBreadcrumb({ items }: { items: AdminBreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"><Link href="/admin" className="hover:text-foreground">Admin</Link>{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2"><span>/</span>{item.href && index < items.length - 1 ? <Link href={item.href} className="hover:text-foreground">{item.label}</Link> : <span className="text-foreground">{item.label}</span>}</span>)}</nav>;
}
