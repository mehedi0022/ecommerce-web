"use client";

import { useState } from "react";
import Link from "next/link";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import {
  Boxes,
  PackagePlus,
  AlertTriangle,
  Minus,
  Search,
  History,
  Clock,
  Package,
  SlidersHorizontal,
  Settings2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  useGetInventoryListQuery,
  useGetGlobalMovementsQuery,
} from "@/modules/inventory/inventoryApi";
import type {
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  StockStatus,
} from "@/modules/inventory/inventory.types";
import { InventoryRestockDialog } from "@/modules/inventory/components/InventoryRestockDialog";
import { InventoryDamageDialog } from "@/modules/inventory/components/InventoryDamageDialog";
import { InventoryAdjustDialog } from "@/modules/inventory/components/InventoryAdjustDialog";
import { InventoryThresholdDialog } from "@/modules/inventory/components/InventoryThresholdDialog";
import { VariantMovementHistoryDialog } from "@/modules/inventory/components/VariantMovementHistoryDialog";

const stockStyle: Record<StockStatus, string> = {
  IN_STOCK:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  LOW_STOCK:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  OUT_OF_STOCK:
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

const stockLabel: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

const movementTypeBadge: Record<
  InventoryMovementType,
  { label: string; className: string }
> = {
  INITIAL_STOCK: {
    label: "Initial Stock",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  RESTOCK: {
    label: "Restock",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  ORDER: {
    label: "Order Fulfilled",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  ORDER_CANCELLED: {
    label: "Order Cancelled",
    className:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  RETURN: {
    label: "Customer Return",
    className:
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  DAMAGED: {
    label: "Damaged / Loss",
    className:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  ADJUSTMENT: {
    label: "Audit Adjustment",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<string>("stock");

  // Stock inventory query state
  const [stockSearch, setStockSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("ALL");
  const [stockPage, setStockPage] = useState(1);
  const [stockLimit, setStockLimit] = useState(20);

  // Global movements query state
  const [movementSearch, setMovementSearch] = useState("");
  const [movementType, setMovementType] = useState("ALL");
  const [movementPage, setMovementPage] = useState(1);
  const [movementLimit, setMovementLimit] = useState(20);

  // Modal dialog states
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [damageItem, setDamageItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(
    null,
  );
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  // Queries
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    refetch: refetchInventory,
    isFetching: isInventoryFetching,
  } = useGetInventoryListQuery({
    page: stockPage,
    limit: stockLimit,
    search: stockSearch || undefined,
    status: stockStatus !== "ALL" ? stockStatus : undefined,
  });

  const {
    data: movementsData,
    isLoading: isMovementsLoading,
    refetch: refetchMovements,
    isFetching: isMovementsFetching,
  } = useGetGlobalMovementsQuery(
    {
      page: movementPage,
      limit: movementLimit,
      search: movementSearch || undefined,
      type: movementType !== "ALL" ? movementType : undefined,
    },
    {
      skip: activeTab !== "movements",
    },
  );

  const summary = inventoryData?.data?.summary || {
    totalVariants: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalOnHand: 0,
    totalReserved: 0,
    totalAvailable: 0,
  };

  const stockItems = inventoryData?.data?.items || [];
  const stockPagination = inventoryData?.data?.pagination || {
    page: 1,
    limit: stockLimit,
    total: 0,
    totalPages: 1,
  };

  const movements = movementsData?.data || [];
  const movementsMeta = movementsData?.meta || {
    page: 1,
    limit: movementLimit,
    total: 0,
    totalPages: 1,
  };

  // Stock Table Columns Definition
  const stockColumns: DataTableColumn<InventoryItem>[] = [
    {
      key: "product",
      header: "Product / Variant",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted/30 flex items-center justify-center relative">
            {r.productImage ? (
              <img
                src={mediaUrl(r.productImage)}
                alt={r.productName}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Package className="size-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/products/${r.productId}/edit`}
              className="font-medium text-foreground hover:underline line-clamp-1 text-xs"
            >
              {r.productName}
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                {r.sku}
              </span>
              {r.attributes.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  ·{" "}
                  {r.attributes.map((a) => `${a.name}: ${a.value}`).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (r) => (
        <span className="text-xs font-semibold">
          ৳{Number(r.price).toFixed(2)}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "On Hand",
      render: (r) => (
        <span className="text-xs font-medium text-foreground">
          {r.quantity}
        </span>
      ),
    },
    {
      key: "reserved",
      header: "Reserved",
      render: (r) => (
        <span
          className={`text-xs font-medium ${
            r.reservedQuantity > 0
              ? "text-amber-600 font-bold"
              : "text-muted-foreground"
          }`}
        >
          {r.reservedQuantity}
        </span>
      ),
    },
    {
      key: "available",
      header: "Available",
      render: (r) => (
        <span
          className={`text-xs font-bold ${
            r.availableQuantity <= 0
              ? "text-rose-600"
              : r.availableQuantity <= r.lowStockThreshold
                ? "text-amber-600"
                : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {r.availableQuantity}
        </span>
      ),
    },
    {
      key: "threshold",
      header: "Low Alert",
      render: (r) => (
        <button
          type="button"
          onClick={() => setThresholdItem(r)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono rounded px-1.5 py-0.5 hover:bg-muted"
          title="Click to update low stock threshold"
        >
          <span>≤ {r.lowStockThreshold}</span>
          <Settings2 className="size-3 opacity-60" />
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge
          variant="outline"
          className={`text-[10px] font-bold ${stockStyle[r.status]}`}
        >
          {stockLabel[r.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right w-64",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400"
            onClick={() => setRestockItem(r)}
            title="Restock Stock"
          >
            <PackagePlus className="size-3.5 mr-1" /> Restock
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => setDamageItem(r)}
            title="Record Damaged Stock"
          >
            <AlertCircle className="size-3.5 mr-1" /> Damage
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setAdjustItem(r)}
            title="Audit Adjust Stock"
          >
            <SlidersHorizontal className="size-3.5 mr-1" /> Adjust
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onClick={() => setHistoryItem(r)}
            title="Movement History"
            aria-label="View history"
          >
            <History className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  // Global Movements Columns Definition
  const movementColumns: DataTableColumn<InventoryMovement>[] = [
    {
      key: "createdAt",
      header: "Date & Time",
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "product",
      header: "Product / Variant",
      render: (r) => (
        <div>
          <p className="font-semibold text-foreground text-xs">
            {r.productName}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-mono">{r.sku}</span>
            {r.variantName && <span>· {r.variantName}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Movement Type",
      render: (r) => {
        const cfg = movementTypeBadge[r.type] || {
          label: r.type,
          className: "bg-muted text-muted-foreground",
        };
        return (
          <Badge
            variant="outline"
            className={`text-[10px] font-bold ${cfg.className}`}
          >
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      key: "quantity",
      header: "Quantity Change",
      render: (r) => {
        const isPositive = r.quantity > 0;
        return (
          <span
            className={`font-mono font-bold text-xs ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? `+${r.quantity}` : r.quantity} units
          </span>
        );
      },
    },
    {
      key: "reference",
      header: "Reference",
      render: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {r.referenceId ? (
            <>
              {r.referenceType ? `${r.referenceType}: ` : ""}
              <strong className="text-foreground">{r.referenceId}</strong>
            </>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      key: "note",
      header: "Note / Reason",
      render: (r) => (
        <span className="text-xs text-muted-foreground line-clamp-2">
          {r.note || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>{" "}
            <span className="mx-1">/</span>{" "}
            <span className="text-foreground font-semibold">Inventory</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Stock & Inventory Management
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Track physical stock on-hand, monitor reserved quantities, and
            review audit movement logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeTab === "stock") refetchInventory();
            else refetchMovements();
          }}
          disabled={isInventoryFetching || isMovementsFetching}
          className="gap-1.5 h-9"
        >
          <RefreshCw
            className={`size-3.5 ${
              isInventoryFetching || isMovementsFetching ? "animate-spin" : ""
            }`}
          />
          Refresh Stock
        </Button>
      </div>

      {/* ── Metric KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Variants
              </p>
              <p className="text-xl font-bold">{summary.totalVariants}</p>
              <p className="text-[11px] text-muted-foreground">
                {summary.totalOnHand} physical units
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Available Stock
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.totalAvailable}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Ready for sale
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Reserved in Orders
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {summary.totalReserved}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Pending orders
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Low Stock Alert
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {summary.lowStockCount}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Below threshold
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <Minus className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Out of Stock
              </p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {summary.outOfStockCount}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Zero inventory
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 flex flex-col"
      >
        <TabsList className="bg-muted/70 p-1">
          <TabsTrigger value="stock" className="gap-2 text-xs font-semibold">
            <Boxes className="size-3.5" />
            Stock Inventory
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {summary.totalVariants}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="gap-2 text-xs font-semibold"
          >
            <History className="size-3.5" />
            Movement Audit Log
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Current Stock List ─────────────────────────────────── */}
        <TabsContent value="stock" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  setStockPage(1);
                }}
                placeholder="Search by product name, variant or SKU..."
                className="h-9 pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={stockStatus}
                onChange={(e) => {
                  setStockStatus(e.target.value);
                  setStockPage(1);
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">
                  All Statuses ({summary.totalVariants})
                </option>
                <option value="IN_STOCK">
                  In Stock ({summary.inStockCount})
                </option>
                <option value="LOW_STOCK">
                  Low Stock ({summary.lowStockCount})
                </option>
                <option value="OUT_OF_STOCK">
                  Out of Stock ({summary.outOfStockCount})
                </option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
            <DataTable
              columns={stockColumns}
              data={stockItems}
              getRowKey={(r) => r.variantId}
              isLoading={isInventoryLoading}
              emptyIcon={<Boxes className="size-8 opacity-40" />}
              emptyMessage="No inventory variants match your search or filters."
            />

            <AdminPagination
              page={stockPage}
              limit={stockLimit}
              total={stockPagination.total}
              totalPages={stockPagination.totalPages}
              onPageChange={setStockPage}
              onLimitChange={setStockLimit}
              disabled={isInventoryLoading || isInventoryFetching}
            />
          </div>
        </TabsContent>

        {/* ── TAB 2: Global Movements Log ───────────────────────────────── */}
        <TabsContent value="movements" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={movementSearch}
                onChange={(e) => {
                  setMovementSearch(e.target.value);
                  setMovementPage(1);
                }}
                placeholder="Search reference (PO, Order ID), SKU, or note..."
                className="h-9 pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={movementType}
                onChange={(e) => {
                  setMovementType(e.target.value);
                  setMovementPage(1);
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs"
              >
                <option value="ALL">All Movement Types</option>
                <option value="RESTOCK">Restock</option>
                <option value="ORDER">Order Fulfilled</option>
                <option value="ORDER_CANCELLED">Order Cancelled</option>
                <option value="RETURN">Customer Return</option>
                <option value="DAMAGED">Damaged / Loss</option>
                <option value="ADJUSTMENT">Audit Adjustment</option>
                <option value="INITIAL_STOCK">Initial Stock</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
            <DataTable
              columns={movementColumns}
              data={movements}
              getRowKey={(r) => r.id}
              isLoading={isMovementsLoading}
              emptyIcon={<History className="size-8 opacity-40" />}
              emptyMessage="No stock movements recorded yet."
            />

            <AdminPagination
              page={movementPage}
              limit={movementLimit}
              total={movementsMeta.total}
              totalPages={movementsMeta.totalPages}
              onPageChange={setMovementPage}
              onLimitChange={setMovementLimit}
              disabled={isMovementsLoading || isMovementsFetching}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialog Modals ────────────────────────────────────────────── */}
      <InventoryRestockDialog
        item={restockItem}
        open={Boolean(restockItem)}
        onOpenChange={(open) => !open && setRestockItem(null)}
      />

      <InventoryDamageDialog
        item={damageItem}
        open={Boolean(damageItem)}
        onOpenChange={(open) => !open && setDamageItem(null)}
      />

      <InventoryAdjustDialog
        item={adjustItem}
        open={Boolean(adjustItem)}
        onOpenChange={(open) => !open && setAdjustItem(null)}
      />

      <InventoryThresholdDialog
        item={thresholdItem}
        open={Boolean(thresholdItem)}
        onOpenChange={(open) => !open && setThresholdItem(null)}
      />

      <VariantMovementHistoryDialog
        item={historyItem}
        open={Boolean(historyItem)}
        onOpenChange={(open) => !open && setHistoryItem(null)}
      />
    </div>
  );
}
