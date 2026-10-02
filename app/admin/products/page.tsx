"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  Download,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string | null;
  variants: number;
  price: string;
  inventory: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  status: "Published" | "Draft";
  image?: string;
};
const products: Product[] = [
  {
    id: "1",
    name: "Nike Air Max 270",
    slug: "nike-air-max-270",
    category: "Shoes",
    brand: "Nike",
    variants: 8,
    price: "$120 – $145",
    inventory: "84 available",
    stock: "In Stock",
    status: "Published",
  },
  {
    id: "2",
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    category: "Clothing",
    brand: null,
    variants: 12,
    price: "$18 – $24",
    inventory: "12 available",
    stock: "Low Stock",
    status: "Published",
  },
  {
    id: "3",
    name: "Leather Travel Bag",
    slug: "leather-travel-bag",
    category: "Bags",
    brand: "Urban Carry",
    variants: 4,
    price: "$89.00",
    inventory: "Out of stock",
    stock: "Out of Stock",
    status: "Draft",
  },
  {
    id: "4",
    name: "Minimal Desk Lamp",
    slug: "minimal-desk-lamp",
    category: "Home & Living",
    brand: "Northstar",
    variants: 3,
    price: "$46 – $58",
    inventory: "36 available",
    stock: "In Stock",
    status: "Published",
  },
  {
    id: "5",
    name: "Relaxed Cotton Overshirt",
    slug: "relaxed-cotton-overshirt",
    category: "Apparel",
    brand: null,
    variants: 6,
    price: "$74.00",
    inventory: "9 available",
    stock: "Low Stock",
    status: "Draft",
  },
];
const statusStyle: Record<Product["status"], string> = {
  Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Draft: "bg-muted text-muted-foreground",
};
const stockStyle: Record<Product["stock"], string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "Out of Stock": "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [stock, setStock] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = useMemo(
    () =>
      products.filter(
        (p) =>
          (status === "All" || p.status === status) &&
          (stock === "All" || p.stock === stock) &&
          `${p.name} ${p.slug} ${p.category} ${p.brand ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, status, stock],
  );
  const toggle = (id: string) =>
    setSelected((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  const allSelected =
    rows.length > 0 && rows.every((row) => selected.includes(row.id));
  const columns: DataTableColumn<Product>[] = [
    {
      key: "id",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() =>
            setSelected(allSelected ? [] : rows.map((row) => row.id))
          }
          aria-label="Select all products"
          className="size-4 accent-primary"
        />
      ),
      className: "w-12",
      render: (p) => (
        <input
          type="checkbox"
          checked={selected.includes(p.id)}
          onChange={() => toggle(p.id)}
          aria-label={`Select ${p.name}`}
          className="size-4 accent-primary"
        />
      ),
    },
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Package className="size-4 text-muted-foreground" />
          </div>
          <div>
            <Link
              href={`/admin/products/${p.id}`}
              className="font-medium hover:text-primary"
            >
              {p.name}
            </Link>
            <p className="font-mono text-xs text-muted-foreground">{p.slug}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category" },
    {
      key: "brand",
      header: "Brand",
      render: (p) =>
        p.brand ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "variants",
      header: "Variants",
      render: (p) => (
        <span className="text-muted-foreground">{p.variants} variants</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (p) => <span className="font-mono font-medium">{p.price}</span>,
    },
    {
      key: "inventory",
      header: "Inventory",
      render: (p) => (
        <div>
          <span className="block text-sm">{p.inventory}</span>
          <Badge className={stockStyle[p.stock]}>{p.stock}</Badge>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge className={statusStyle[p.status]}>{p.status}</Badge>
      ),
    },
    {
      key: "id",
      header: "",
      className: "w-12",
      render: (p) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${p.name}`}
        >
          <MoreHorizontal />
        </Button>
      ),
    },
  ];
  return (
    <div className="container mx-auto space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-3 text-sm text-muted-foreground">
            Dashboard <span className="mx-2">/</span> Catalog{" "}
            <span className="mx-2">/</span>{" "}
            <span className="text-foreground">Products</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your store products, variants, pricing and inventory.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:inline-flex">
            <Upload /> Import
          </Button>
          <Button variant="outline">
            <Download /> Export
          </Button>
          <Button render={<Link href="/admin/products/new" />}>
            <Plus /> Add product
          </Button>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["All products", products.length],
          [
            "Published",
            products.filter((p) => p.status === "Published").length,
          ],
          ["Draft", products.filter((p) => p.status === "Draft").length],
          ["Low stock", products.filter((p) => p.stock === "Low Stock").length],
          [
            "Out of stock",
            products.filter((p) => p.stock === "Out of Stock").length,
          ],
        ].map(([label, value]) => (
          <button
            key={String(label)}
            onClick={() =>
              label === "Published" || label === "Draft"
                ? setStatus(String(label))
                : label === "Low stock" || label === "Out of stock"
                  ? setStock(
                      label === "Low stock" ? "Low Stock" : "Out of Stock",
                    )
                  : (setStatus("All"), setStock("All"))
            }
            className="rounded-xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/40"
          >
            <p className="text-sm text-muted-foreground">{String(label)}</p>
            <b className="mt-2 block text-xl">{String(value)}</b>
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, SKU..."
              className="h-9 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              <option>All</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
            <select
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              <option>All</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter /> Filters
            </Button>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-3 text-sm">
            <Check className="size-4 text-primary" />
            <b>{selected.length} selected</b>
            <Button size="sm" variant="outline">
              Publish
            </Button>
            <Button size="sm" variant="outline">
              Move to draft
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        )}
        <DataTable
          columns={columns}
          data={rows}
          getRowKey={(p) => p.id}
          emptyIcon={<Package className="size-5" />}
          emptyMessage={
            query || status !== "All" || stock !== "All"
              ? "No products match your filters."
              : "No products yet. Add your first product to start building your catalog."
          }
        />
        <div className="flex flex-col gap-3 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing <b className="text-foreground">{rows.length}</b> of{" "}
            {products.length} products
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
