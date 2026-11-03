"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  MapPin,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserX,
  FileText,
  Loader2,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck,
  UserCheck,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useListIncompleteOrdersQuery,
  useGetIncompleteOrderMetricsQuery,
  useUpdateIncompleteOrderMutation,
  useConvertIncompleteOrderMutation,
} from "@/modules/incomplete-order/incompleteOrderApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { IncompleteOrder, IncompleteCartItem } from "@/modules/incomplete-order/types";
import { CheckoutAddressForm } from "@/modules/checkout/components/CheckoutAddressForm";
import type { CheckoutAddress } from "@/modules/checkout/checkout.types";
import { getApiErrorMessage } from "@/lib/api/api-error";

const INITIAL_CONV_ADDRESS: CheckoutAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  divisionId: "6",
  districtId: "47",
  upazilaId: "",
  unionId: "",
  division: "Dhaka",
  district: "Dhaka",
  upazila: "",
  thana: "",
  area: "",
  postalCode: "",
  countryCode: "BD",
};

const STATUS_TABS = [
  { label: "All Leads", value: "ALL" },
  { label: "Pending Call", value: "PENDING" },
  { label: "No Response", value: "CALLED_NO_RESPONSE" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Converted / Won", value: "CONVERTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminIncompleteOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [activeLeadForNotes, setActiveLeadForNotes] = useState<IncompleteOrder | null>(null);
  const [modalStatus, setModalStatus] = useState<IncompleteOrder["status"]>("PENDING");
  const [modalNotes, setModalNotes] = useState<string>("");

  const { data: metricsData, refetch: refetchMetrics } = useGetIncompleteOrderMetricsQuery();
  const metrics = metricsData?.data;

  const {
    data: listData,
    isLoading,
    isFetching,
    refetch: refetchList,
  } = useListIncompleteOrdersQuery({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    search: search.trim() || undefined,
  });

  const [updateOrder, { isLoading: isUpdating }] = useUpdateIncompleteOrderMutation();
  const [convertOrder, { isLoading: isConverting }] = useConvertIncompleteOrderMutation();

  const incompleteOrders = listData?.data || [];

  const handleOpenNotesModal = (lead: IncompleteOrder) => {
    setActiveLeadForNotes(lead);
    setModalStatus(lead.status);
    setModalNotes(lead.crmNotes || "");
  };

  const handleSaveNotes = async () => {
    if (!activeLeadForNotes) return;
    try {
      await updateOrder({
        id: activeLeadForNotes.id,
        body: {
          status: modalStatus,
          crmNotes: modalNotes.trim() || null,
        },
      }).unwrap();
      toast.success("CRM note & lead status updated!");
      setActiveLeadForNotes(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update lead note."));
    }
  };

  // Convert to order modal states
  const [convertLead, setConvertLead] = useState<IncompleteOrder | null>(null);
  const [convCustomerName, setConvCustomerName] = useState("");
  const [convCustomerPhone, setConvCustomerPhone] = useState("");
  const [convCustomerEmail, setConvCustomerEmail] = useState("");
  const [convAddress, setConvAddress] = useState<CheckoutAddress>(INITIAL_CONV_ADDRESS);
  const [convPaymentMethod, setConvPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE">("CASH_ON_DELIVERY");
  const [convShippingFee, setConvShippingFee] = useState<number>(60);
  const [convAdvanceAmount, setConvAdvanceAmount] = useState<number>(0);
  const [convDiscountAmount, setConvDiscountAmount] = useState<number>(0);
  const [convAdminNote, setConvAdminNote] = useState("");
  const [convCartItems, setConvCartItems] = useState<IncompleteCartItem[]>([]);

  const handleOpenConvertModal = (lead: IncompleteOrder) => {
    if (lead.status === "CONVERTED") {
      toast.info("This lead is already converted.");
      return;
    }
    const addr: any = lead.shippingAddress || {};
    const name = lead.customerName || addr.fullName || "";
    const phone = lead.customerPhone || addr.phone || "";

    setConvertLead(lead);
    setConvCustomerName(name);
    setConvCustomerPhone(phone);
    setConvCustomerEmail(lead.customerEmail || "");
    setConvAddress({
      fullName: name,
      phone,
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      divisionId: addr.divisionId || "6",
      districtId: addr.districtId || "47",
      upazilaId: addr.upazilaId || "",
      unionId: addr.unionId || "",
      division: addr.division || "Dhaka",
      district: addr.district || "Dhaka",
      upazila: addr.upazila || addr.thana || "",
      thana: addr.thana || addr.upazila || "",
      area: addr.area || "",
      postalCode: addr.postalCode || "",
      countryCode: addr.countryCode || "BD",
    });
    setConvPaymentMethod("CASH_ON_DELIVERY");
    setConvShippingFee(Number(lead.shippingFee) || 60);
    setConvAdvanceAmount(0);
    setConvDiscountAmount(0);
    setConvAdminNote(lead.crmNotes ? `Lead note: ${lead.crmNotes}` : "");
    setConvCartItems(lead.cartItems ? lead.cartItems.map((item) => ({ ...item })) : []);
  };

  const handleCustomerNameChange = (val: string) => {
    setConvCustomerName(val);
    setConvAddress((prev) => ({ ...prev, fullName: val }));
  };

  const handleCustomerPhoneChange = (val: string) => {
    setConvCustomerPhone(val);
    setConvAddress((prev) => ({ ...prev, phone: val }));
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    setConvCartItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQty = Math.max(1, (item.quantity || 1) + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    setConvCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const convSubtotal = convCartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );
  const convGrandTotal = Math.max(
    0,
    convSubtotal + (Number(convShippingFee) || 0) - (Number(convDiscountAmount) || 0)
  );
  const convDueAmount = Math.max(0, convGrandTotal - (Number(convAdvanceAmount) || 0));

  const handleConfirmConvert = async () => {
    if (!convertLead) return;
    if (!convCustomerPhone.trim()) {
      toast.error("Please enter customer phone number");
      return;
    }
    if (!convCustomerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!convAddress.addressLine1.trim()) {
      toast.error("Please enter street address / house / road");
      return;
    }
    if (!convAddress.district.trim()) {
      toast.error("Please select a delivery district");
      return;
    }
    if (convCartItems.length === 0) {
      toast.error("At least one product item is required");
      return;
    }

    try {
      const res = await convertOrder({
        id: convertLead.id,
        body: {
          customerName: convCustomerName.trim(),
          customerPhone: convCustomerPhone.trim(),
          customerEmail: convCustomerEmail.trim() || null,
          shippingAddress: {
            fullName: convCustomerName.trim(),
            phone: convCustomerPhone.trim(),
            addressLine1: convAddress.addressLine1.trim(),
            addressLine2: convAddress.addressLine2?.trim() || undefined,
            divisionId: convAddress.divisionId || undefined,
            districtId: convAddress.districtId || undefined,
            upazilaId: convAddress.upazilaId || undefined,
            unionId: convAddress.unionId || undefined,
            division: convAddress.division?.trim() || undefined,
            district: convAddress.district.trim(),
            upazila: convAddress.upazila?.trim() || undefined,
            thana: convAddress.thana?.trim() || undefined,
            area: convAddress.area?.trim() || undefined,
            postalCode: convAddress.postalCode?.trim() || undefined,
            countryCode: convAddress.countryCode || "BD",
          },
          cartItems: convCartItems,
          paymentMethod: convPaymentMethod,
          shippingFee: Number(convShippingFee) || 0,
          advanceAmount: Number(convAdvanceAmount) || 0,
          discountAmount: Number(convDiscountAmount) || 0,
          adminNote: convAdminNote.trim() || undefined,
        },
      }).unwrap();

      const orderNum = res.data?.orderNumber || "ORDER";
      toast.success(`Success! Order #${orderNum} created for ${convCustomerName}!`);
      setConvertLead(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to convert lead to order."));
    }
  };

  const handleRefresh = () => {
    refetchMetrics();
    refetchList();
  };

  const getWhatsAppLink = (lead: IncompleteOrder) => {
    let cleanPhone = lead.customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "88" + cleanPhone;
    }
    const firstItem = lead.cartItems?.[0]?.name || "পণ্যটি";
    const msg = `আসসালামু আলাইকুম ${lead.customerName ? lead.customerName + " ভাই/আপু" : ""}! আপনি আমাদের স্টোর থেকে "${firstItem}" অর্ডার করতে চেয়েছিলেন। কোনো সহযোগিতা বা সাইজ সংক্রান্ত সাহায্য লাগবে কি? আমরা সরাসরি অর্ডার কনফার্ম করে দিচ্ছি।`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <PhoneCall className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Incomplete Orders & Abandoned Leads
              </h1>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-300">
                CRM Lead Recovery
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customers who entered contact info but dropped off before pressing confirm order.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          <span>Refresh Leads</span>
        </Button>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Drop-offs</span>
            <AlertCircle className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{metrics?.totalLeads ?? 0}</p>
          <p className="text-[11px] text-muted-foreground">Captured from checkout & landing pages</p>
        </div>

        {/* Pending Calls */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-2 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-bold">Pending Calls Needed</span>
            <PhoneCall className="size-4 text-amber-600 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
            {metrics?.pendingCalls ?? 0}
          </p>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300">Awaiting CRM team call confirmation</p>
        </div>

        {/* Potential Revenue */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Potential Stuck Value</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary">
            ৳{metrics?.potentialRevenue ?? "0.00"}
          </p>
          <p className="text-[11px] text-muted-foreground">Revenue waiting to be recovered</p>
        </div>

        {/* Recovered / Converted */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-2 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold">Recovered Won Orders</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
            {metrics?.convertedCount ?? 0}
          </p>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300">
            Recovered: ৳{metrics?.recoveredRevenue ?? "0.00"} ({metrics?.conversionRate ?? "0%"})
          </p>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                selectedStatus === tab.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone or name..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* ── Leads List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : incompleteOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center bg-card space-y-3">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Incomplete Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Great news! No abandoned checkouts match your current filter. When visitors type their phone number and drop off, they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {incompleteOrders.map((lead) => {
            const isConverted = lead.status === "CONVERTED";
            return (
              <div
                key={lead.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 space-y-4",
                  isConverted && "border-emerald-500/30 bg-emerald-500/5",
                  lead.status === "PENDING" && "border-amber-500/30"
                )}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0">
                      #{lead.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {lead.customerName || "Customer"}
                        </span>
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="font-mono font-black text-sm text-primary hover:underline"
                        >
                          {lead.customerPhone}
                        </a>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <Clock className="size-3" />
                        <span>{new Date(lead.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground/80">Source: {lead.source}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        lead.status === "PENDING" && "bg-amber-500/15 text-amber-700 border-amber-400",
                        lead.status === "CALLED_NO_RESPONSE" && "bg-blue-500/15 text-blue-700 border-blue-400",
                        lead.status === "CONTACTED" && "bg-purple-500/15 text-purple-700 border-purple-400",
                        lead.status === "CONVERTED" && "bg-emerald-600 text-white border-emerald-600",
                        lead.status === "CANCELLED" && "bg-rose-500/15 text-rose-700 border-rose-400"
                      )}
                    >
                      {lead.status === "PENDING" && "Pending Call"}
                      {lead.status === "CALLED_NO_RESPONSE" && "No Answer"}
                      {lead.status === "CONTACTED" && "Contacted"}
                      {lead.status === "CONVERTED" && "Order Won"}
                      {lead.status === "CANCELLED" && "Cancelled"}
                    </Badge>

                    {lead.convertedOrder && (
                      <Link
                        href={`/admin/orders/${lead.convertedOrder.orderNumber}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        <span>#{lead.convertedOrder.orderNumber}</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Body info: Cart items preview & Destination */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                  {/* Cart Items */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      Cart Products ({lead.cartItems?.length || 0})
                    </p>
                    <div className="space-y-1.5">
                      {lead.cartItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-xl bg-muted/30 p-1.5 border">
                          {item.image ? (
                            <img
                              src={mediaUrl(item.image)}
                              alt={item.name}
                              className="size-8 rounded-lg object-cover bg-background shrink-0"
                            />
                          ) : (
                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Package className="size-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate text-foreground text-[11px]">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.sku ? `SKU: ${item.sku} · ` : ""}
                              {item.quantity} × ৳{Number(item.price).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      Delivery Destination
                    </p>
                    {lead.shippingAddress ? (
                      <div className="rounded-xl border bg-muted/20 p-2.5 space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span>
                            {lead.shippingAddress.district || "District not selected"},{" "}
                            {lead.shippingAddress.division || ""}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {lead.shippingAddress.addressLine1 || "Detailed address not entered yet"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic text-[11px]">No address entered</p>
                    )}
                  </div>

                  {/* Pricing Breakdown & CRM Note */}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                      Pricing & Call Notes
                    </p>
                    <div className="rounded-xl border bg-muted/20 p-2.5 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">৳{Number(lead.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span className="font-medium">৳{Number(lead.shippingFee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-foreground">
                        <span>Total Stuck Value:</span>
                        <span className="text-primary font-black">৳{Number(lead.totalAmount).toFixed(2)}</span>
                      </div>

                      {lead.crmNotes && (
                        <div className="mt-2 pt-1 border-t text-amber-700 dark:text-amber-300 font-medium italic">
                          "{lead.crmNotes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CRM Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <div className="flex items-center gap-2">
                    {/* Call Direct */}
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-8 gap-1.5 text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <PhoneCall className="size-3.5" />
                      <span>Call {lead.customerPhone}</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={getWhatsAppLink(lead)}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-8 gap-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                      )}
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp Lead</span>
                    </a>

                    {/* Note & Status */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenNotesModal(lead)}
                      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <FileText className="size-3.5" />
                      <span>Notes & Status</span>
                    </Button>
                  </div>

                  {/* Convert to Real Order Modal trigger */}
                  {!isConverted && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isConverting}
                      onClick={() => handleOpenConvertModal(lead)}
                      className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Convert to Real Order</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dialog for Updating CRM Status & Note ── */}
      <Dialog open={Boolean(activeLeadForNotes)} onOpenChange={(open) => !open && setActiveLeadForNotes(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Lead Status & Call Notes</DialogTitle>
            <DialogDescription>
              Lead #{activeLeadForNotes?.id} · {activeLeadForNotes?.customerName || "Customer"} (
              {activeLeadForNotes?.customerPhone})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Call Status</label>
              <select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value as any)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="PENDING">Pending (Call Needed)</option>
                <option value="CALLED_NO_RESPONSE">No Answer / Did Not Pick Up</option>
                <option value="CONTACTED">Contacted / Call Back Later</option>
                <option value="CONVERTED">Converted / Agreed to Buy</option>
                <option value="CANCELLED">Customer Cancelled / Refused</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Agent Notes</label>
              <Textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="e.g. Customer requested delivery on Friday afternoon, advance will be paid via bKash..."
                className="min-h-24 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveLeadForNotes(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={handleSaveNotes}
              className="text-xs font-bold gap-1.5"
            >
              {isUpdating && <Loader2 className="size-3.5 animate-spin" />}
              <span>Save Lead Status</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog for Verifying and Converting Lead to Real Order ── */}
      <Dialog open={Boolean(convertLead)} onOpenChange={(open) => !open && setConvertLead(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
              <DialogTitle className="text-lg">Verify & Convert Lead to Official Order</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Review customer details, delivery location, items, and pricing before creating the official order for Lead #{convertLead?.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* 1. Customer Information */}
            <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <UserCheck className="size-4 text-primary" />
                <span>Customer Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Customer Full Name *</label>
                  <Input
                    value={convCustomerName}
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Phone Number *</label>
                  <Input
                    value={convCustomerPhone}
                    onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">Email Address (Optional)</label>
                  <Input
                    type="email"
                    value={convCustomerEmail}
                    onChange={(e) => setConvCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address (Structured like Checkout page) */}
            <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <MapPin className="size-4 text-rose-500" />
                <span>Delivery Address</span>
              </div>
              <CheckoutAddressForm
                address={convAddress}
                onChange={setConvAddress}
                showContactFields={false}
              />
            </div>

            {/* 3. Ordered Products */}
            <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-4 text-emerald-600" />
                  <span>Order Items ({convCartItems.length})</span>
                </div>
                <span className="text-muted-foreground font-semibold">Subtotal: ৳{convSubtotal.toFixed(0)}</span>
              </div>

              {convCartItems.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">No products left in this order.</p>
              ) : (
                <div className="space-y-2">
                  {convCartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-background text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image ? (
                          <img
                            src={mediaUrl(item.image)}
                            alt={item.name}
                            className="size-10 rounded-lg object-cover bg-muted shrink-0"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate text-xs">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.sku ? `SKU: ${item.sku} · ` : ""}৳{Number(item.price).toFixed(0)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border rounded-lg bg-muted/30">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(idx, -1)}
                            className="size-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground rounded-l-lg cursor-pointer"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(idx, 1)}
                            className="size-7 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground rounded-r-lg cursor-pointer"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="font-bold text-xs min-w-14 text-right">
                          ৳{((Number(item.price) || 0) * (item.quantity || 1)).toFixed(0)}
                        </span>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="size-7 flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Payment & Charges */}
            <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Truck className="size-4 text-indigo-500" />
                <span>Delivery & Payment Settings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Payment Method</label>
                  <select
                    value={convPaymentMethod}
                    onChange={(e) => setConvPaymentMethod(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
                    <option value="ONLINE">Paid Online / Mobile Financial Service (MFS)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Delivery Charge (৳)</label>
                  <Input
                    type="number"
                    min="0"
                    value={convShippingFee}
                    onChange={(e) => setConvShippingFee(Math.max(0, Number(e.target.value) || 0))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Special Discount (৳)</label>
                  <Input
                    type="number"
                    min="0"
                    value={convDiscountAmount}
                    onChange={(e) => setConvDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Advance Received (৳)</label>
                  <Input
                    type="number"
                    min="0"
                    value={convAdvanceAmount}
                    onChange={(e) => setConvAdvanceAmount(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 5. Financial Summary Breakdown */}
            <div className="rounded-2xl border bg-primary/5 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Products Subtotal</span>
                <span>৳{convSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery Charge</span>
                <span>+৳{Number(convShippingFee).toFixed(2)}</span>
              </div>
              {convDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-500 font-semibold">
                  <span>Special Discount</span>
                  <span>-৳{Number(convDiscountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-foreground pt-1.5 border-t text-sm">
                <span>Grand Total</span>
                <span>৳{convGrandTotal.toFixed(2)}</span>
              </div>
              {convAdvanceAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Advance Received</span>
                  <span>-৳{Number(convAdvanceAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-extrabold text-emerald-700 dark:text-emerald-400 pt-1.5 border-t text-base">
                <span>Balance Due on Delivery</span>
                <span>৳{convDueAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* 6. Admin / Dispatch Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Special Instructions / Dispatch Notes</label>
              <Textarea
                value={convAdminNote}
                onChange={(e) => setConvAdminNote(e.target.value)}
                placeholder="e.g. Call before delivery, customer requested evening delivery..."
                className="min-h-16 text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConvertLead(null)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isConverting || convCartItems.length === 0}
              onClick={handleConfirmConvert}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              {isConverting && <Loader2 className="size-3.5 animate-spin" />}
              <span>Confirm & Place Real Order</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
