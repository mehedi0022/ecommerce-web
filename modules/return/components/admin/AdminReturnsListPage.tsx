"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  Boxes,
  Truck,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminReturnsQuery } from "../../returnApi";
import type { Return, ReturnStatus } from "../../return.types";
import { mediaUrl } from "@/modules/catalog/catalog.utils";

const STATUS_BADGE: Record<ReturnStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "Under Review",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  IN_TRANSIT: {
    label: "In Transit",
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  },
  RECEIVED: {
    label: "Received / Inspecting",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const STATUS_TABS = [
  { key: "ALL", label: "All Returns" },
  { key: "REQUESTED", label: "Pending Review" },
  { key: "APPROVED", label: "Approved" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "RECEIVED", label: "Received / Inspecting" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Rejected" },
];

export function AdminReturnsListPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useGetAdminReturnsQuery(
    selectedStatus !== "ALL" ? { status: selectedStatus } : undefined
  );

  const returns = data?.data || [];

  const filteredReturns = returns.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.returnNumber.toLowerCase().includes(q) ||
      r.order?.orderNumber?.toLowerCase().includes(q) ||
      r.order?.customerName?.toLowerCase().includes(q) ||
      r.order?.customerPhone?.toLowerCase().includes(q)
    );
  });

  // Calculate high-level counters
  const totalCount = returns.length;
  const requestedCount = returns.filter((r) => r.status === "REQUESTED").length;
  const inTransitCount = returns.filter((r) => r.status === "IN_TRANSIT").length;
  const receivedCount = returns.filter((r) => r.status === "RECEIVED").length;
  const completedCount = returns.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <RotateCcw className="size-6 text-primary" />
            Customer Returns & Exchanges
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review RMA requests, approve pickups, inspect received goods, and issue refunds.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
          onClick={() => refetch()}
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-card shadow-none">
          <CardContent className="p-3.5 space-y-1">
            <p className="text-[11px] text-muted-foreground uppercase font-medium">
              Total Returns
            </p>
            <p className="text-xl font-bold font-mono text-foreground">{totalCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
          <CardContent className="p-3.5 space-y-1">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 uppercase font-medium">
              Action Needed
            </p>
            <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {requestedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-violet-500/5 border-violet-500/20 shadow-none">
          <CardContent className="p-3.5 space-y-1">
            <p className="text-[11px] text-violet-700 dark:text-violet-400 uppercase font-medium">
              In Transit
            </p>
            <p className="text-xl font-bold font-mono text-violet-700 dark:text-violet-400">
              {inTransitCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/20 shadow-none">
          <CardContent className="p-3.5 space-y-1">
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 uppercase font-medium">
              To Inspect
            </p>
            <p className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-400">
              {receivedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-none">
          <CardContent className="p-3.5 space-y-1">
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-medium">
              Completed
            </p>
            <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {completedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                variant={selectedStatus === tab.key ? "default" : "outline"}
                className="h-8 text-xs shrink-0"
                onClick={() => setSelectedStatus(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search return or order #..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Returns Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading return requests...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <RotateCcw className="size-8 mx-auto text-muted-foreground/50" />
                <p className="font-semibold text-foreground">No return requests found</p>
                <p>No returns matching the current filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Return ID</th>
                      <th className="py-3 px-4 font-semibold">Order</th>
                      <th className="py-3 px-4 font-semibold">Customer</th>
                      <th className="py-3 px-4 font-semibold">Returned Products</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReturns.map((ret) => {
                      const badge = STATUS_BADGE[ret.status] || {
                        label: ret.status,
                        className: "bg-muted text-foreground",
                      };

                      return (
                        <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-foreground">
                            {ret.returnNumber}
                          </td>
                          <td className="py-3 px-4 font-mono text-primary font-semibold">
                            {ret.order ? (
                              <Link
                                href={`/admin/orders/${ret.order.orderNumber}`}
                                className="hover:underline"
                              >
                                #{ret.order.orderNumber}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-foreground">
                              {ret.order?.customerName || "Customer"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {ret.order?.customerPhone}
                            </p>
                          </td>
                          <td className="py-3 px-4 max-w-[240px]">
                            {ret.items && ret.items.length > 0 ? (
                              <div className="flex items-start gap-2.5">
                                {(() => {
                                  const first = ret.items[0];
                                  const img =
                                    first.orderItem?.product?.images?.find(
                                      (i: any) => i.isPrimary
                                    )?.imageUrl ||
                                    first.orderItem?.product?.images?.[0]?.imageUrl;

                                  return (
                                    <div className="size-10 shrink-0 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center relative">
                                      {img ? (
                                        <img
                                          src={mediaUrl(img)}
                                          alt={first.orderItem?.productName || "Product"}
                                          className="size-full object-cover"
                                        />
                                      ) : (
                                        <Package className="size-4 text-muted-foreground/60" />
                                      )}
                                    </div>
                                  );
                                })()}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-medium text-foreground text-xs truncate"
                                    title={ret.items[0].orderItem?.productName}
                                  >
                                    {ret.items[0].orderItem?.productName || "Product"}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                    <span>Qty: {ret.items[0].quantity}</span>
                                    {ret.items.length > 1 && (
                                      <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0 text-[10px] font-medium text-muted-foreground border">
                                        +{ret.items.length - 1} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-[11px]">
                                No items
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${badge.className}`}
                            >
                              {badge.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(ret.requestedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/admin/returns/${ret.returnNumber}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                              >
                                <Eye className="size-3" />
                                Manage
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
