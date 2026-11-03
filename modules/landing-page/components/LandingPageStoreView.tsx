"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Award,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ShoppingCart,
  Minus,
  Plus,
  Ruler,
  X,
  Loader2,
  ArrowRight,
  Package,
  Star,
  MapPin,
  Check,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextContent } from "@/components/rich-text/RichTextContent";
import { cn } from "@/lib/utils";
import type { LandingPage } from "../types";
import type { ProductVariant, ProductImage } from "@/modules/product/types";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { VariantSelector } from "@/modules/product/components/store/VariantSelector";
import { useIncompleteOrderCapture } from "@/modules/incomplete-order/useIncompleteOrderCapture";
import { CheckoutAddressForm } from "@/modules/checkout/components/CheckoutAddressForm";
import { CheckoutShippingMethods } from "@/modules/checkout/components/CheckoutShippingMethods";
import { CheckoutPaymentMethod } from "@/modules/checkout/components/CheckoutPaymentMethod";
import {
  useGetPublicShippingMethodsQuery,
  useCalculateShippingMutation,
  useCheckoutGuestMutation,
  useCheckoutAuthenticatedMutation,
  useGetSavedAddressesQuery,
  useCreateAddressMutation,
} from "@/modules/checkout/checkoutApi";
import type {
  CheckoutAddress,
  ShippingMethod,
  SavedAddress,
} from "@/modules/checkout/checkout.types";
import { useAddToCartMutation } from "@/modules/cart/cartApi";
import { useMeQuery } from "@/modules/auth/authApi";

// ─── Icon Map for Feature Cards ───────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  Award,
  CheckCircle2,
  Clock,
};

// ─── Countdown Timer Component ────────────────────────────────────────────────

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      if (diff === 0) {
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
      <span className="rounded-md bg-black/60 px-2 py-1 shadow-xs">{pad(timeLeft.hours)}h</span>
      <span>:</span>
      <span className="rounded-md bg-black/60 px-2 py-1 shadow-xs">{pad(timeLeft.minutes)}m</span>
      <span>:</span>
      <span className="rounded-md bg-black/60 px-2 py-1 shadow-xs">{pad(timeLeft.seconds)}s</span>
    </div>
  );
}

// ─── YouTube Video Embed Helper ───────────────────────────────────────────────

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=0&rel=0`
      : null;
  } catch {
    return null;
  }
}

const INITIAL_ADDRESS: CheckoutAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  divisionId: "6",
  districtId: "47",
  upazilaId: "",
  unionId: "",
  district: "Dhaka",
  division: "Dhaka",
  upazila: "",
  thana: "",
  area: "",
  postalCode: "",
  countryCode: "BD",
};

// ─── Main Storefront Landing Page Component ───────────────────────────────────

interface LandingPageStoreViewProps {
  landingPage?: LandingPage;
  page?: LandingPage;
}

export function LandingPageStoreView(props: LandingPageStoreViewProps) {
  const landingPage = props.landingPage || props.page;
  if (!landingPage) return null;

  const product = landingPage.product;
  const variants = product?.variants || [];
  const sizeChart = product?.sizeChart;
  const images = useMemo(() => {
    if (landingPage.gallery && landingPage.gallery.length > 0) {
      return landingPage.gallery;
    }
    return product?.images?.map((i) => i.imageUrl) || [];
  }, [landingPage.gallery, product?.images]);

  const [activeImage, setActiveImage] = useState<string>(images[0] || "");

  useEffect(() => {
    if (images.length > 0 && (!activeImage || !images.includes(activeImage))) {
      setActiveImage(images[0]);
    }
  }, [images, activeImage]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.find((v) => v.isActive) || variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // ── Authentication & Saved Addresses ──
  const { data: meData } = useMeQuery();
  const user = meData?.data;
  const { data: savedAddressesData } = useGetSavedAddressesQuery(undefined, { skip: !user });
  const savedAddresses = (savedAddressesData?.data || []) as SavedAddress[];

  // ── Address State (like checkout page) ──
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress>(INITIAL_ADDRESS);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Sync user info into initial address if available
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || (user as any)?.name || user.fullName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Sync default saved address if user is logged in
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === null && !useCustomAddress) {
      const defaultAddr = savedAddresses.find((a) => a.isDefaultShipping) ?? savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [savedAddresses, selectedAddressId, useCustomAddress]);

  const activeAddress = user && savedAddresses.length > 0 && !useCustomAddress
    ? savedAddresses.find((a) => a.id === selectedAddressId)
    : shippingAddress;

  // ── Shipping Methods & Calculation ──
  const { data: publicShippingMethodsData, isLoading: isShippingMethodsLoading } =
    useGetPublicShippingMethodsQuery();
  const publicShippingMethods = publicShippingMethodsData?.data || [];
  const [calculateShipping, { isLoading: isCalculatingShipping }] = useCalculateShippingMutation();
  const [availableMethods, setAvailableMethods] = useState<ShippingMethod[]>([]);
  const [resolvedZoneName, setResolvedZoneName] = useState<string>("");
  const [shippingMethodId, setShippingMethodId] = useState<number>(5);

  // Calculate dynamic shipping options when delivery address location changes
  useEffect(() => {
    const district = activeAddress?.district?.trim();
    if (!district && !activeAddress?.districtId) return;

    let isMounted = true;
    calculateShipping({
      divisionId: activeAddress?.divisionId || undefined,
      districtId: activeAddress?.districtId || undefined,
      upazilaId: activeAddress?.upazilaId || undefined,
      unionId: activeAddress?.unionId || undefined,
      countryCode: activeAddress?.countryCode || "BD",
      division: activeAddress?.division?.trim() || undefined,
      district: district || undefined,
      upazila: activeAddress?.upazila?.trim() || undefined,
      area: activeAddress?.area?.trim() || undefined,
      postalCode: activeAddress?.postalCode?.trim() || undefined,
      subtotal: (Number(selectedVariant?.price || 0)) * quantity,
      isAllFreeShipping: Boolean(product?.isFreeShipping),
    })
      .unwrap()
      .then((res) => {
        if (!isMounted) return;
        const methods = res.data?.methods || [];
        setAvailableMethods(methods);
        setResolvedZoneName(res.data?.zone?.name || "");

        if (methods.length > 0) {
          const stillValid = methods.some((m) => m.id === shippingMethodId);
          if (!stillValid) {
            setShippingMethodId(methods[0].id);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [
    activeAddress?.district,
    activeAddress?.districtId,
    activeAddress?.divisionId,
    activeAddress?.upazilaId,
    selectedVariant?.price,
    quantity,
    product?.isFreeShipping,
    calculateShipping,
  ]);

  // Methods to display
  const rawMethods = availableMethods.length > 0 ? availableMethods : publicShippingMethods;
  const methodsToDisplay = rawMethods.map((m: ShippingMethod) => {
    const isExpress = m.code?.toUpperCase().includes("EXPRESS");
    if (product?.isFreeShipping && !isExpress) {
      return {
        ...m,
        isFree: true,
        finalCharge: "0.00",
        charge: "0.00",
        regularCharge: m.regularCharge ?? m.charge ?? "70.00",
      };
    }
    return m;
  });

  const selectedShippingMethod = methodsToDisplay.find((m) => m.id === shippingMethodId) || methodsToDisplay[0];
  const isSelectedExpress = Boolean(selectedShippingMethod?.code?.toUpperCase().includes("EXPRESS"));
  const baseShippingFee = selectedShippingMethod?.finalCharge !== undefined
    ? Number(selectedShippingMethod.finalCharge)
    : selectedShippingMethod?.charge !== undefined
    ? Number(selectedShippingMethod.charge)
    : 70;
  const shippingFee = (product?.isFreeShipping && !isSelectedExpress) ? 0 : baseShippingFee;

  // ── Payment Methods State ──
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "ONLINE">("CASH_ON_DELIVERY");
  const [paymentMethodCode, setPaymentMethodCode] = useState<string>("cod");
  const [paymentMethodType, setPaymentMethodType] = useState<string>("COD");
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");

  // Pricing calculations
  const unitPrice = Number(selectedVariant?.price || 0);
  const unitComparePrice = selectedVariant?.compareAtPrice ? Number(selectedVariant.compareAtPrice) : null;
  const itemsTotal = unitPrice * quantity;
  const finalTotal = itemsTotal + shippingFee;
  const discountPercent =
    unitComparePrice && unitComparePrice > unitPrice
      ? Math.round(((unitComparePrice - unitPrice) / unitComparePrice) * 100)
      : null;

  // Mutations
  const [addToCart] = useAddToCartMutation();
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation();
  const [checkoutGuest, { isLoading: isSubmittingGuest }] = useCheckoutGuestMutation();
  const [checkoutAuth, { isLoading: isSubmittingAuth }] = useCheckoutAuthenticatedMutation();
  const isSubmitting = isSubmittingGuest || isSubmittingAuth || isCreatingAddress;

  // Success Confirmation State
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  // Auto-capture lead in real-time as visitor types contact details
  useIncompleteOrderCapture({
    customerName: activeAddress?.fullName || null,
    customerPhone: activeAddress?.phone || null,
    shippingAddress: activeAddress
      ? {
          fullName: activeAddress.fullName,
          phone: activeAddress.phone,
          division: activeAddress.division,
          district: activeAddress.district,
          upazila: activeAddress.upazila,
          addressLine1: activeAddress.addressLine1,
        }
      : null,
    cartItems: selectedVariant
      ? [
          {
            variantId: selectedVariant.id,
            productId: product?.id,
            name: product?.name || landingPage.title,
            sku: selectedVariant.sku,
            price: selectedVariant.price,
            quantity,
            image: activeImage || images[0] || "",
          },
        ]
      : [],
    subtotal: itemsTotal,
    shippingFee,
    totalAmount: finalTotal,
    source: `LANDING_PAGE:${landingPage.slug}`,
    enabled: !orderConfirmed,
  });

  // Order Form Ref for Smooth Scrolling
  const orderFormRef = useRef<HTMLDivElement>(null);

  const scrollToOrderForm = () => {
    orderFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle direct order submission (Supporting both Guest & Authenticated)
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVariant) {
      toast.error("অনুগ্রহ করে সাইজ বা অপশন সিলেক্ট করুন।");
      return;
    }

    const currentAddr = user && savedAddresses.length > 0 && !useCustomAddress
      ? savedAddresses.find((a) => a.id === selectedAddressId)
      : shippingAddress;

    if (!currentAddr?.fullName?.trim()) {
      toast.error("অনুগ্রহ করে আপনার পুরো নাম লিখুন।");
      return;
    }
    const cleanPhone = (currentAddr?.phone || "").trim().replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 11) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।");
      return;
    }
    if (!currentAddr?.addressLine1?.trim()) {
      toast.error("অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন।");
      return;
    }
    if (!currentAddr?.district?.trim()) {
      toast.error("অনুগ্রহ করে আপনার জেলা সিলেক্ট করুন।");
      return;
    }

    const isManual = paymentMethodType === "MANUAL_MFS" || paymentMethodType === "MANUAL_BANK";
    if (isManual) {
      if (!senderNumber.trim()) {
        toast.error("যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন।");
        return;
      }
      if (!transactionId.trim()) {
        toast.error("লেনদেনের ট্রানজেকশন আইডি (TrxID) দিন।");
        return;
      }
    }

    const effectiveShippingMethodId = shippingMethodId || selectedShippingMethod?.id || 5;

    try {
      // Step 1: Add product variant to cart
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
      }).unwrap();

      let orderResult: any = null;

      if (user) {
        // Authenticated flow
        let targetAddressId = selectedAddressId;

        if (savedAddresses.length === 0 || useCustomAddress) {
          const savedAddrRes = await createAddress({
            fullName: currentAddr.fullName.trim(),
            phone: cleanPhone,
            addressLine1: currentAddr.addressLine1.trim(),
            addressLine2: currentAddr.addressLine2?.trim() || undefined,
            divisionId: currentAddr.divisionId || undefined,
            districtId: currentAddr.districtId || "47",
            upazilaId: currentAddr.upazilaId || undefined,
            unionId: currentAddr.unionId || undefined,
            division: currentAddr.division?.trim() || undefined,
            district: currentAddr.district.trim(),
            upazila: currentAddr.upazila?.trim() || undefined,
            thana: currentAddr.thana?.trim() || undefined,
            area: currentAddr.area?.trim() || undefined,
            postalCode: currentAddr.postalCode?.trim() || undefined,
            countryCode: currentAddr.countryCode || "BD",
          }).unwrap();

          targetAddressId = savedAddrRes.data.id;
          setSelectedAddressId(targetAddressId);
          setUseCustomAddress(false);
        }

        if (!targetAddressId) {
          toast.error("অনুগ্রহ করে একটি ডেলিভারি ঠিকানা বেছে নিন।");
          return;
        }

        const authRes = await checkoutAuth({
          shippingAddressId: targetAddressId,
          billingSameAsShipping: true,
          shippingMethodId: effectiveShippingMethodId,
          paymentMethod,
          paymentMethodCode,
          senderNumber: paymentMethodCode !== "cod" ? senderNumber.trim() : undefined,
          transactionId: paymentMethodCode !== "cod" ? transactionId.trim() : undefined,
          customerNote: customerNote
            ? `Landing Page: ${landingPage.title} - ${customerNote}`
            : `Landing Page: ${landingPage.title} (${selectedVariant.sku})`,
        }).unwrap();

        orderResult = authRes.data || authRes;

        if (authRes.data?.paymentSession?.paymentUrl) {
          window.location.href = authRes.data.paymentSession.paymentUrl;
          return;
        }
      } else {
        // Guest flow
        const guestPayload = {
          customer: {
            name: currentAddr.fullName.trim(),
            phone: cleanPhone,
            email: `${cleanPhone}@customer.guest`,
          },
          shippingAddress: {
            fullName: currentAddr.fullName.trim(),
            phone: cleanPhone,
            addressLine1: currentAddr.addressLine1.trim(),
            addressLine2: currentAddr.addressLine2?.trim() || undefined,
            divisionId: currentAddr.divisionId || undefined,
            districtId: currentAddr.districtId || "47",
            upazilaId: currentAddr.upazilaId || undefined,
            unionId: currentAddr.unionId || undefined,
            division: currentAddr.division?.trim() || undefined,
            district: currentAddr.district.trim(),
            upazila: currentAddr.upazila?.trim() || undefined,
            thana: currentAddr.thana?.trim() || undefined,
            area: currentAddr.area?.trim() || undefined,
            postalCode: currentAddr.postalCode?.trim() || undefined,
            countryCode: currentAddr.countryCode || "BD",
          },
          billingSameAsShipping: true,
          shippingMethodId: effectiveShippingMethodId,
          paymentMethod,
          paymentMethodCode,
          senderNumber: paymentMethodCode !== "cod" ? senderNumber.trim() : undefined,
          transactionId: paymentMethodCode !== "cod" ? transactionId.trim() : undefined,
          customerNote: customerNote
            ? `Landing Page: ${landingPage.title} - ${customerNote}`
            : `Landing Page: ${landingPage.title} (${selectedVariant.sku})`,
        };

        const guestRes = await checkoutGuest(guestPayload).unwrap();
        orderResult = guestRes.data || guestRes;

        if (guestRes.data?.paymentSession?.paymentUrl) {
          window.location.href = guestRes.data.paymentSession.paymentUrl;
          return;
        }
      }

      setOrderConfirmed(orderResult);
      toast.success("আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "অর্ডার সম্পন্ন হতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  const videoEmbed = landingPage.videoUrl ? getYouTubeEmbedUrl(landingPage.videoUrl) : null;

  // ── Success Confirmed Screen ──
  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-3xl border bg-card p-8 shadow-2xl text-center space-y-6 animate-in fade-in-50 zoom-in-95">
          <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto">
            <CheckCircle2 className="size-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে
            </h1>
            <p className="text-sm text-muted-foreground">
              আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করে অর্ডার কনফার্ম করবেন।
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-5 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">অর্ডার নম্বর:</span>
              <span className="font-bold font-mono text-foreground text-sm">
                #{orderConfirmed.orderNumber || orderConfirmed.orderId || "ORD-SUCCESS"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">গ্রাহকের নাম:</span>
              <span className="font-semibold text-foreground">
                {activeAddress?.fullName || orderConfirmed?.shippingAddress?.fullName || orderConfirmed?.customer?.name || "Customer"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">মোবাইল নম্বর:</span>
              <span className="font-semibold text-foreground">
                {activeAddress?.phone || orderConfirmed?.shippingAddress?.phone || orderConfirmed?.customer?.phone || ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ডেলিভারি ঠিকানা:</span>
              <span className="font-semibold text-foreground truncate max-w-[220px]">
                {activeAddress?.addressLine1
                  ? `${activeAddress.addressLine1}, ${activeAddress.district || ""}`
                  : orderConfirmed?.shippingAddress?.addressLine1 || "ঠিকানা সংরক্ষিত"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">পণ্য:</span>
              <span className="font-bold text-foreground">
                {product?.name} ({selectedVariant?.sku}) × {quantity}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-sm font-black text-primary">
              <span>ক্যাশ অন ডেলিভারিতে প্রদেয়:</span>
              <span>৳{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href={`https://wa.me/?text=Hello! I just ordered ${encodeURIComponent(landingPage.title)} (Order #${orderConfirmed.orderNumber || ""})`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <MessageCircle className="size-4" />
              <span>হোয়াটসঅ্যাপে যোগাযোগ করুন</span>
            </a>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground py-2"
            >
              <span>আমাদের হোমপেজে যান →</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* ── Top Floating Offer Notification Header ── */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="font-black text-lg tracking-tight text-primary flex items-center gap-1.5">
            <Package className="size-5" />
            <span>Store Offer</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+8801700000000"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border rounded-full px-3 py-1.5"
            >
              <Phone className="size-3.5 text-primary" />
              <span>হটলাইন: কল করুন</span>
            </a>

            <Button
              type="button"
              onClick={scrollToOrderForm}
              size="sm"
              className="rounded-full font-bold px-4 bg-primary text-primary-foreground shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart className="size-3.5 mr-1.5" />
              <span>অর্ডার করুন</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Top Promo Bar with Countdown Timer ── */}
      {landingPage.badgeText && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 py-2.5 px-4 text-white text-center shadow-xs">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white animate-ping" />
              {landingPage.badgeText}
            </span>

            {landingPage.countdownTarget && (
              <div className="flex items-center gap-2">
                <span className="text-white/80 font-normal hidden sm:inline">অফার শেষ হতে বাকি:</span>
                <CountdownTimer targetDate={landingPage.countdownTarget} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Funnel Container ── */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10 sm:space-y-14">
        {/* ── Hero Headline ── */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
            {landingPage.headline || landingPage.title}
          </h1>
          {landingPage.subHeadline && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {landingPage.subHeadline}
            </p>
          )}

          {/* Quick Price Banner */}
          <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-full mt-2">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">অফার মূল্য:</span>
            <span className="text-2xl sm:text-3xl font-black text-primary">৳{unitPrice.toFixed(0)}</span>
            {unitComparePrice && unitComparePrice > unitPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">৳{unitComparePrice.toFixed(0)}</span>
                <Badge className="bg-rose-500 text-white font-bold text-xs">
                  {discountPercent}% ছাড়
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* ── Showcase Media (Gallery & Video) ── */}
        <div className="space-y-4">
          {/* Main Active Photo */}
          {activeImage ? (
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden border bg-card shadow-lg flex items-center justify-center p-2 sm:p-4">
              <img
                src={mediaUrl(activeImage)}
                alt={landingPage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-4/3 sm:aspect-16/10 rounded-3xl border bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
              <Package className="size-8 opacity-40 mr-2" />
              <span>No image preview</span>
            </div>
          )}

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative size-16 sm:size-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-card",
                    activeImage === img ? "border-primary scale-105 shadow-md" : "border-border/60 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={mediaUrl(img)} alt={`Thumb ${idx + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* YouTube Video Embed */}
          {videoEmbed && (
            <div className="pt-2">
              <div className="relative aspect-video rounded-3xl overflow-hidden border bg-black shadow-xl">
                <iframe
                  src={videoEmbed}
                  title="Product video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Call to Action Banner Button ── */}
        <div className="text-center pt-2">
          <Button
            type="button"
            size="lg"
            onClick={scrollToOrderForm}
            className="h-14 sm:h-16 px-8 sm:px-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black text-lg sm:text-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingCart className="size-6 mr-2" />
            <span>অর্ডার করতে এখানে ক্লিক করুন 🛒</span>
          </Button>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি · পণ্য হাতে পেয়ে মূল্য পরিশোধ
          </p>
        </div>

        {/* ── Key Feature Cards ── */}
        {landingPage.features?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-center text-foreground">
              কেন এই পণ্যটি আপনার জন্য সেরা পছন্দ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {landingPage.features.map((feat, idx) => {
                const IconComp = (feat.icon && ICON_MAP[feat.icon]) || ShieldCheck;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <IconComp className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                        {feat.title}
                      </h3>
                      {feat.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                          {feat.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Custom Story / Rich Text Content ── */}
        {landingPage.customContent && (
          <div className="rounded-3xl border bg-card p-6 sm:p-10 shadow-xs space-y-4">
            <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 dark:prose-invert">
              <RichTextContent value={landingPage.customContent} />
            </div>
          </div>
        )}

        {/* ── FAQs Accordion ── */}
        {landingPage.faqs?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-center text-foreground">
              সাধারণ জিজ্ঞাসা (FAQs)
            </h2>
            <div className="space-y-3">
              {landingPage.faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border bg-card overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={cn("size-4 text-muted-foreground shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            EMBEDDED 1-CLICK EXPRESS CHECKOUT ORDER FORM
        ══════════════════════════════════════════════════════════════════════ */}
        <div ref={orderFormRef} id="order-form" className="scroll-mt-20">
          <div className="rounded-3xl border-2 border-primary/30 bg-card p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Header banner */}
            <div className="absolute top-0 inset-x-0 bg-primary h-2" />

            <div className="text-center space-y-2 pb-6 border-b">
              <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
                ⚡ দ্রুত ১-ক্লিক অর্ডার ফর্ম
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                অর্ডার করতে নিচের ফর্মটি পূরণ করুন
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                অর্ডার নিশ্চিত করতে আপনার সঠিক নাম, মোবাইল নম্বর এবং ঠিকানা দিন।
              </p>
            </div>

            <form onSubmit={handleOrderSubmit} className="mt-8 space-y-8">
              {/* ── STEP 1: Variation Selector (Colors, Sizes, etc.) ── */}
              {variants.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-xs">
                        ১
                      </span>
                      <span>কালার ও সাইজ নির্বাচন করুন</span>
                    </label>

                    {product?.sizeChart && (
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <Ruler className="size-3.5" />
                        <span>সাইজ চার্ট ({product.sizeChart.name})</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-muted/15 rounded-2xl p-4 border border-border/70">
                    <VariantSelector
                      variants={variants}
                      selectedVariantId={selectedVariant?.id ?? null}
                      onOpenSizeChart={product?.sizeChart ? () => setShowSizeGuide(true) : undefined}
                      onSelect={(v) => {
                        setSelectedVariant(v);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 2: Quantity Counter ── */}
              <div className="flex items-center justify-between border-y py-4">
                <span className="text-sm font-bold text-foreground">পরিমাণ (Quantity):</span>
                <div className="flex items-center rounded-xl border bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-10 items-center justify-center rounded-l-xl hover:bg-muted transition cursor-pointer"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-10 items-center justify-center rounded-r-xl hover:bg-muted transition cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              {/* ── STEP 3: Delivery Address (like checkout page) ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <MapPin className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    ৩. ডেলিভারি তথ্য ও ঠিকানা
                  </h3>
                </div>

                {user && savedAddresses.length > 0 && (
                  <div className="space-y-3 pb-3 border-b">
                    <p className="text-xs font-semibold text-muted-foreground">সংরক্ষিত ঠিকানা থেকে বেছে নিন:</p>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition text-xs",
                            selectedAddressId === addr.id && !useCustomAddress
                              ? "border-primary bg-primary/5 font-semibold"
                              : "border-border hover:bg-muted/30"
                          )}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedAddressId === addr.id && !useCustomAddress}
                            onChange={() => {
                              setSelectedAddressId(addr.id);
                              setUseCustomAddress(false);
                            }}
                            className="mt-0.5 size-4 text-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground">{addr.fullName} ({addr.phone})</p>
                            <p className="text-muted-foreground truncate">{addr.addressLine1}, {addr.district}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={useCustomAddress}
                        onChange={(e) => setUseCustomAddress(e.target.checked)}
                        className="rounded size-4 text-primary"
                      />
                      <span>অন্য ঠিকানায় ডেলিভারি নিতে চান? (নতুন ঠিকানা দিন)</span>
                    </label>
                  </div>
                )}

                {(!user || savedAddresses.length === 0 || useCustomAddress) && (
                  <div className="rounded-2xl border bg-muted/10 p-4 sm:p-5">
                    <CheckoutAddressForm
                      address={shippingAddress}
                      onChange={setShippingAddress}
                      showContactFields={true}
                    />
                  </div>
                )}
              </div>

              {/* ── STEP 4: Shipping Methods (like checkout page) ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Truck className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    ৪. ডেলিভারি মেথড নির্বাচন করুন
                  </h3>
                </div>

                <CheckoutShippingMethods
                  methods={methodsToDisplay}
                  selectedMethodId={shippingMethodId}
                  onSelectMethod={setShippingMethodId}
                  isLoading={isCalculatingShipping || isShippingMethodsLoading}
                  zoneName={resolvedZoneName}
                />
              </div>

              {/* ── STEP 5: Payment Method (like checkout page) ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <CreditCard className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    ৫. পেমেন্ট মেথড নির্বাচন করুন
                  </h3>
                </div>

                <CheckoutPaymentMethod
                  selectedCode={paymentMethodCode}
                  onSelectMethod={(code, type, methodType) => {
                    setPaymentMethodCode(code);
                    setPaymentMethod(type);
                    setPaymentMethodType(methodType || "COD");
                  }}
                  senderNumber={senderNumber}
                  onChangeSenderNumber={setSenderNumber}
                  transactionId={transactionId}
                  onChangeTransactionId={setTransactionId}
                  totalAmount={finalTotal}
                  isCodAvailable={product?.isCodAvailable !== false}
                />
              </div>

              {/* ── Customer Note (Optional) ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  অর্ডার সংক্রান্ত কোনো বিশেষ নির্দেশনা থাকলে লিখুন (ঐচ্ছিক):
                </label>
                <Input
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়..."
                  className="h-10 text-xs bg-background"
                />
              </div>

              {/* ── STEP 6: Live Order Calculation Summary ── */}
              <div className="rounded-2xl border bg-muted/30 p-5 space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">পণ্যের মূল্য ({quantity}টি):</span>
                  <span className="font-semibold text-foreground">৳{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">ডেলিভারি চার্জ:</span>
                  <span className="font-semibold text-foreground">
                    {shippingFee === 0 ? "ফ্রি (৳০)" : `৳${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                {product?.requiresAdvancePayment && product.advancePaymentAmount && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 dark:text-amber-200">
                    ⚡ এই অর্ডারের জন্য <strong>৳{product.advancePaymentAmount}</strong> অগ্রিম পরিশোধ করতে হবে; বাকি টাকা ক্যাশ অন ডেলিভারিতে দিবেন।
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-black text-foreground">সর্বমোট মূল্য:</span>
                    <p className="text-[11px] text-muted-foreground">
                      {paymentMethodCode === "cod" ? "ক্যাশ অন ডেলিভারিতে পরিশোধযোগ্য" : "অনলাইন পেমেন্ট"}
                    </p>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-primary">
                    ৳{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ── Submit Button ── */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-lg sm:text-xl shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span>অর্ডার প্রসেসিং হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="size-6" />
                    <span>
                      {paymentMethodCode === "cod"
                        ? "ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম করুন"
                        : "পেমেন্ট করে অর্ডার সম্পন্ন করুন"}
                    </span>
                  </div>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-primary" />
                  ১০০% সুরক্ষিত অর্ডার
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="size-3.5 text-primary" />
                  দ্রুত হোম ডেলিভারি
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ── Sticky Bottom Bar on Mobile/Tablet ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur-md p-3 shadow-2xl sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">অফার মূল্য:</span>
            <span className="text-xl font-black text-primary">৳{unitPrice.toFixed(0)}</span>
          </div>

          <Button
            type="button"
            onClick={scrollToOrderForm}
            className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            <ShoppingCart className="size-4 mr-1.5" />
            <span>অর্ডার করুন 🛒</span>
          </Button>
        </div>
      </div>

      {/* ── Size Guide Modal ── */}
      {showSizeGuide && sizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border bg-background p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ruler className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{sizeChart.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Size & Fit Guide · All measurements in <strong className="uppercase">{sizeChart.unit}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card mb-4">
              <table className="w-full text-xs text-left">
                <thead className="border-b bg-muted/60 text-muted-foreground font-semibold">
                  <tr>
                    {sizeChart.columns.map((col: string, idx: number) => (
                      <th key={idx} className="px-3.5 py-2.5">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sizeChart.rows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-muted/30">
                      {sizeChart.columns.map((col: string, cIdx: number) => (
                        <td key={cIdx} className="px-3.5 py-2.5 font-medium">
                          {row[col] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sizeChart.tips && (
              <div className="rounded-xl border bg-muted/30 p-3.5 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <span>📏</span> How to measure
                </p>
                <p className="leading-relaxed">{sizeChart.tips}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => setShowSizeGuide(false)}>
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
