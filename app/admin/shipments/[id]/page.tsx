"use client";

import { use } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
  Printer,
  Tag,
  ExternalLink,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminOrderQuery } from "@/modules/order/orderApi";
import { ShippingLabelModal } from "@/modules/order/components/shipping-label/ShippingLabelModal";

export default function ShipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderNumber = id.startsWith("ORD-") ? id : `ORD-${id}`;

  const { data, isLoading } = useGetAdminOrderQuery(orderNumber);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  const order = data?.data;
  const shipment = order?.shipment;
  const shippingAddr =
    order?.addresses?.find((a) => a.type === "SHIPPING") ??
    order?.addresses?.[0];

  return (
    <div className="container mx-auto max-w-[1200px] space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b pb-4">
        <div>
          <nav className="mb-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/admin/shipments" className="hover:text-foreground">
              Shipments
            </Link>
            <span>/</span>
            <span className="text-foreground font-mono font-medium">#{orderNumber}</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="size-6 text-primary" />
            Shipment & Dispatch #{orderNumber}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Courier dispatch records, tracking events, and thermal label printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/shipments">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <ArrowLeft className="size-4" /> Back to Shipments
            </Button>
          </Link>

          {order && (
            <Button
              size="sm"
              onClick={() => setIsLabelModalOpen(true)}
              className="gap-1.5 text-xs h-9 bg-black text-white hover:bg-neutral-800 font-semibold shadow-sm"
            >
              <Tag className="size-3.5" />
              Print Thermal Label
            </Button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-muted-foreground">
          Loading shipment details...
        </div>
      ) : !order ? (
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto size-8 text-muted-foreground mb-2" />
          <h3 className="font-bold text-sm">Order or Shipment Record Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Could not retrieve shipment data for #{orderNumber}.
          </p>
          <Link href="/admin/shipments" className="mt-4 inline-block">
            <Button variant="outline" size="sm" className="text-xs">
              Return to Shipments
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Package className="size-4 text-primary" /> Courier Fulfillment Status
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold"
                >
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between text-xs border-b pb-3">
                  <span className="text-muted-foreground">Courier Service:</span>
                  <span className="font-bold text-foreground">
                    {shipment?.courierName || order.shippingMethodName || "Steadfast Courier"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b pb-3">
                  <span className="text-muted-foreground">Tracking / Consignment ID:</span>
                  <span className="font-mono font-bold text-foreground">
                    {shipment?.trackingNumber || shipment?.consignmentId || "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b pb-3">
                  <span className="text-muted-foreground">Cash on Delivery (COD) to Collect:</span>
                  <span className="font-mono font-bold text-base text-foreground">
                    ৳{Number(order.dueAmount || order.grandTotal).toFixed(2)}
                  </span>
                </div>
                {shipment?.trackingUrl && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Public Tracking URL:</span>
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono inline-flex items-center gap-1"
                    >
                      Open Courier Portal <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Tag className="size-4 text-primary" /> Parcel Items ({order.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y pt-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      {item.attributes && (
                        <p className="text-[11px] text-muted-foreground">
                          {item.attributes.map((a) => `${a.attributeName}: ${a.attributeValue}`).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right font-mono font-bold">
                      Qty: {item.quantity}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-primary" /> Recipient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs pt-3">
                <p className="font-bold text-foreground text-sm">
                  {shippingAddr?.fullName || order.customerName}
                </p>
                <p className="font-mono font-bold text-foreground">
                  {shippingAddr?.phone || order.customerPhone}
                </p>
                <p className="text-muted-foreground">
                  {shippingAddr?.addressLine1}
                  {shippingAddr?.addressLine2 && `, ${shippingAddr.addressLine2}`}
                </p>
                <p className="text-muted-foreground">
                  {shippingAddr?.district}, Bangladesh
                </p>
              </CardContent>
            </Card>

            <Card className="p-4 space-y-2.5">
              <Button
                onClick={() => setIsLabelModalOpen(true)}
                className="w-full gap-2 text-xs bg-black text-white hover:bg-neutral-800 font-semibold h-9"
              >
                <Printer className="size-3.5" />
                Print Shipping Label (Thermal)
              </Button>
              <Link href={`/admin/orders/${order.orderNumber}`} className="block">
                <Button variant="outline" className="w-full text-xs h-9">
                  View Full Order Page
                </Button>
              </Link>
            </Card>
          </aside>
        </div>
      )}

      {order && (
        <ShippingLabelModal
          order={order}
          open={isLabelModalOpen}
          onOpenChange={setIsLabelModalOpen}
        />
      )}
    </div>
  );
}
