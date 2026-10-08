"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderInvoice } from "./OrderInvoice";
import { useGetOrderByNumberQuery } from "../../orderApi";
import type { Order } from "../../order.types";
import { Loader2 } from "lucide-react";

interface OrderInvoiceModalProps {
  order?: Order | null;
  orders?: Order[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderInvoiceModal({
  order,
  orders,
  open,
  onOpenChange,
}: OrderInvoiceModalProps) {
  const isBulk = Boolean(orders && orders.length > 0);
  const orderNumber = order?.orderNumber ?? "";

  // Always fetch full order details if single order open
  const { data: detailData, isLoading } = useGetOrderByNumberQuery(orderNumber, {
    skip: !open || !orderNumber || isBulk,
  });

  const activeOrder = detailData?.data || order;

  if (!order && (!orders || orders.length === 0)) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl md:max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none print:h-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Order Invoices</DialogTitle>
        </DialogHeader>

        {isBulk && orders ? (
          <div className="space-y-8 divide-y print:divide-none">
            {orders.map((ord, idx) => (
              <div key={ord.id} className={idx > 0 ? "pt-8 print:pt-0 print:break-before-page" : ""}>
                <OrderInvoice order={ord} hideActions={idx > 0} />
              </div>
            ))}
          </div>
        ) : isLoading && !activeOrder ? (
          <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-sm">Loading full invoice details...</span>
          </div>
        ) : activeOrder ? (
          <OrderInvoice order={activeOrder} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
