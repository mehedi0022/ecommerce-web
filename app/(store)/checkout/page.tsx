"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  User,
  ShoppingBag,
  FileText,
  AlertCircle,
  AlertTriangle,
  Plus,
  Check,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useGetCartQuery } from "@/modules/cart/cartApi";
import { useMeQuery } from "@/modules/auth/authApi";
import {
  useCheckoutAuthenticatedMutation,
  useCheckoutGuestMutation,
  useGetPublicShippingMethodsQuery,
  useGetSavedAddressesQuery,
  useCreateAddressMutation,
  useCalculateShippingMutation,
} from "@/modules/checkout/checkoutApi";
import { useValidateCouponMutation } from "@/modules/coupon/couponApi";
import { useInitiateGatewayPaymentMutation } from "@/modules/payment/paymentApi";
import { CheckoutContactStep } from "@/modules/checkout/components/CheckoutContactStep";
import { CheckoutAddressForm } from "@/modules/checkout/components/CheckoutAddressForm";
import { CheckoutShippingMethods } from "@/modules/checkout/components/CheckoutShippingMethods";
import { CheckoutPaymentMethod } from "@/modules/checkout/components/CheckoutPaymentMethod";
import { CheckoutOrderSummary } from "@/modules/checkout/components/CheckoutOrderSummary";
import type {
  CheckoutAddress,
  CheckoutCustomer,
  SavedAddress,
  ShippingMethod,
} from "@/modules/checkout/checkout.types";

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

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentQuery = searchParams.get("payment");

  // Queries
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const { data: userData } = useMeQuery();
  const { data: shippingMethodsData, isLoading: isShippingMethodsLoading } =
    useGetPublicShippingMethodsQuery();
  const { data: savedAddressesData } = useGetSavedAddressesQuery(undefined, {
    skip: !userData?.data,
  });

  useEffect(() => {
    if (paymentQuery === "cancelled") {
      toast.warning("অনলাইন পেমেন্ট বাতিল করা হয়েছে। আপনার কার্টের পণ্যগুলো অক্ষত রয়েছে।", {
        duration: 6000,
      });
    } else if (paymentQuery === "failed") {
      toast.error("পেমেন্ট সম্পন্ন হয়নি। আপনার কার্টের পণ্যগুলো অক্ষত রয়েছে। অনুগ্রহ করে অন্য মাধ্যমে চেষ্টা করুন বা ক্যাশ অন ডেলিভারি বেছে নিন।", {
        duration: 6000,
      });
    }
  }, [paymentQuery]);

  // Mutations
  const [checkoutAuthenticated, { isLoading: isSubmittingAuth }] =
    useCheckoutAuthenticatedMutation();
  const [checkoutGuest, { isLoading: isSubmittingGuest }] =
    useCheckoutGuestMutation();
  const [createAddress, { isLoading: isCreatingAddress }] =
    useCreateAddressMutation();
  const [initiateGateway, { isLoading: isInitiatingGateway }] =
    useInitiateGatewayPaymentMutation();

  const isSubmitting =
    isSubmittingAuth ||
    isSubmittingGuest ||
    isCreatingAddress ||
    isInitiatingGateway;

  // Cart & User Data
  const user = userData?.data ?? null;
  const cart = cartData?.data;
  const items = cart?.items ?? [];
  const summary = cart?.summary ?? { itemCount: 0, subtotal: "0.00" };
  const shippingMethods = (shippingMethodsData?.data ?? []).filter(
    (m) => m.isActive
  );
  const savedAddresses = savedAddressesData?.data ?? [];
  const isAllFreeShipping = items.length > 0 && items.every((i) => i.product?.isFreeShipping);

  // Form State
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: "",
  });
  const [createAccount, setCreateAccount] = useState<boolean>(false);

  const [shippingAddress, setShippingAddress] =
    useState<CheckoutAddress>(INITIAL_ADDRESS);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [deliverToSomeoneElse, setDeliverToSomeoneElse] = useState(false);
  const [billingAddress, setBillingAddress] =
    useState<CheckoutAddress>(INITIAL_ADDRESS);

  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH_ON_DELIVERY" | "ONLINE"
  >("CASH_ON_DELIVERY");
  const [paymentMethodCode, setPaymentMethodCode] = useState<string>("cod");
  const [paymentMethodType, setPaymentMethodType] = useState<string>("COD");
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [paidInFull, setPaidInFull] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("checkout_coupon_code") || "";
    }
    return "";
  });
  const [couponDiscount, setCouponDiscount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("checkout_coupon_discount");
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  const [customerNote, setCustomerNote] = useState<string>("");

  // Coupon validation mutation
  const [validateCoupon] = useValidateCouponMutation();

  // If coupon code was saved from cart page, re-validate with current cart subtotal
  useEffect(() => {
    if (couponCode && summary?.subtotal && Number(summary.subtotal) > 0) {
      validateCoupon({ code: couponCode })
        .unwrap()
        .then((res) => {
          const disc = Number(res.data?.discountAmount || "0");
          setCouponDiscount(disc);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("checkout_coupon_discount", String(disc));
          }
        })
        .catch(() => {
          // If no longer valid (e.g. cart subtotal decreased below minimum order amount)
          setCouponCode("");
          setCouponDiscount(0);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("checkout_coupon_code");
            sessionStorage.removeItem("checkout_coupon_discount");
          }
        });
    }
  }, [summary?.subtotal]);

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await validateCoupon({ code }).unwrap();
      const disc = Number(res.data?.discountAmount || "0");
      setCouponCode(res.data?.code || code);
      setCouponDiscount(disc);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("checkout_coupon_code", res.data?.code || code);
        sessionStorage.setItem("checkout_coupon_discount", String(disc));
      }
      toast.success(res.message || `Coupon ${res.data?.code} applied! Saved ৳${disc.toFixed(2)}`);
      return true;
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Invalid coupon code");
      return false;
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("checkout_coupon_code");
      sessionStorage.removeItem("checkout_coupon_discount");
    }
    toast.info("Coupon removed");
  };

  // Dynamic Shipping Calculation State
  const [calculateShipping, { isLoading: isCalculatingShipping }] =
    useCalculateShippingMutation();
  const [availableMethods, setAvailableMethods] = useState<ShippingMethod[]>([]);
  const [resolvedZoneName, setResolvedZoneName] = useState<string>("");

  // Determine active address for shipping calculation
  const activeAddress =
    user && savedAddresses.length > 0 && !useCustomAddress
      ? savedAddresses.find((a) => a.id === selectedAddressId)
      : shippingAddress;

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
      subtotal: summary?.subtotal ? Number(summary.subtotal) : undefined,
      isAllFreeShipping,
    })
      .unwrap()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          const fetchedMethods = res.data.methods || [];
          setAvailableMethods(fetchedMethods);
          setResolvedZoneName(res.data.zone?.name || "");

          setShippingMethodId((prevId) => {
            const exists = fetchedMethods.some((m: ShippingMethod) => m.id === prevId);
            if (exists) return prevId;
            const recommended = fetchedMethods.find((m: ShippingMethod) => m.isRecommended);
            return recommended ? recommended.id : (fetchedMethods[0]?.id ?? null);
          });
        }
      })
      .catch((err) => {
        console.error("Failed to calculate shipping options:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeAddress?.districtId,
    activeAddress?.divisionId,
    activeAddress?.upazilaId,
    activeAddress?.unionId,
    activeAddress?.district,
    activeAddress?.division,
    activeAddress?.upazila,
    activeAddress?.area,
    activeAddress?.countryCode,
    summary?.subtotal,
    isAllFreeShipping,
    calculateShipping,
  ]);

  // Sync default shipping method when loaded
  useEffect(() => {
    if (shippingMethods.length > 0 && !shippingMethodId && availableMethods.length === 0) {
      const rec = shippingMethods.find((m) => m.isRecommended);
      setShippingMethodId(rec ? rec.id : shippingMethods[0].id);
    }
  }, [shippingMethods, shippingMethodId, availableMethods.length]);

  // Sync user info when logged in
  useEffect(() => {
    if (user) {
      const userName = user.fullName || user.userName || "";
      setCustomer({
        name: userName,
        email: user.email ?? "",
        phone: "",
      });
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || userName,
      }));
    }
  }, [user]);

  // Sync default saved address
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === null && !useCustomAddress) {
      const defaultAddr =
        savedAddresses.find((a) => a.isDefaultShipping) ?? savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [savedAddresses, selectedAddressId, useCustomAddress]);

  // Partial COD / Advance calculation
  const isCodAvailableForAll = items.length > 0 && items.every((i) => i.product?.isCodAvailable !== false);
  const anyRequiresAdvance = items.some((i) => i.product?.requiresAdvancePayment);
  const anyCodDisabled = items.some((i) => i.product?.isCodAvailable === false);

  // Calculate selected shipping fee
  const rawMethods =
    availableMethods.length > 0 ? availableMethods : shippingMethods;
  const methodsToDisplay = rawMethods.map((m: ShippingMethod) => {
    const isExpress = m.code?.toUpperCase().includes("EXPRESS");
    if (isAllFreeShipping && !isExpress) {
      return {
        ...m,
        isFree: true,
        finalCharge: "0.00",
        charge: "0.00",
        regularCharge: m.regularCharge ?? m.charge ?? "60.00",
      };
    }
    return m;
  });

  const selectedMethod = methodsToDisplay.find((m: ShippingMethod) => m.id === shippingMethodId);
  const isSelectedExpress = Boolean(selectedMethod?.code?.toUpperCase().includes("EXPRESS"));
  const baseShippingFee =
    selectedMethod?.finalCharge !== undefined
      ? Number(selectedMethod.finalCharge)
      : selectedMethod?.charge !== undefined
      ? Number(selectedMethod.charge)
      : isSelectedExpress
      ? 120.0
      : 60.0;
  const shippingFee = (isAllFreeShipping && !isSelectedExpress) ? 0 : baseShippingFee;

  let advanceRequiredAmount = 0;
  if (anyRequiresAdvance) {
    for (const x of items) {
      if (x.product?.requiresAdvancePayment) {
        const perProductAdvance =
          Number(x.product?.advancePaymentAmount) > 0
            ? Number(x.product?.advancePaymentAmount)
            : shippingFee > 0
              ? shippingFee
              : 100;
        advanceRequiredAmount += perProductAdvance;
      }
    }
  } else if (anyCodDisabled) {
    advanceRequiredAmount = shippingFee > 0 ? shippingFee : 100;
  }

  const isAdvanceRequired = advanceRequiredAmount > 0;
  const subtotalNum = Number(summary?.subtotal || 0);
  const grandTotalNum = Math.max(0, subtotalNum + shippingFee - Number(couponDiscount || 0));
  const advanceAmountNum = isAdvanceRequired ? Math.min(advanceRequiredAmount, grandTotalNum) : 0;
  const dueAmountNum = Math.max(0, grandTotalNum - advanceAmountNum);

  // Auto-switch away from COD if advance payment is strictly required
  useEffect(() => {
    if (isAdvanceRequired && paymentMethodCode === "cod") {
      setPaymentMethodCode("bkash");
      setPaymentMethod("ONLINE");
      setPaymentMethodType("MANUAL_MFS");
    }
  }, [isAdvanceRequired, paymentMethodCode]);

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!shippingMethodId) {
      toast.error("Please select a delivery method");
      return;
    }

    if (isAdvanceRequired && paymentMethodCode === "cod") {
      toast.error(
        `Full Cash on Delivery is unavailable. A minimum advance payment of ৳${advanceAmountNum.toFixed(2)} is required for this order.`
      );
      return;
    }

    const isManual =
      paymentMethodType === "MANUAL_MFS" || paymentMethodType === "MANUAL_BANK";

    if (isManual) {
      if (!senderNumber.trim()) {
        toast.error("Please enter the mobile number you sent the payment from");
        return;
      }
      if (!transactionId.trim()) {
        toast.error("Please enter the Transaction ID (TrxID) for your payment");
        return;
      }
    }

    try {
      if (user) {
        // Authenticated Checkout
        let targetAddressId = selectedAddressId;

        if (savedAddresses.length === 0 || useCustomAddress) {
          if (!shippingAddress.fullName.trim()) {
            toast.error("Please enter recipient's full name");
            return;
          }
          if (!shippingAddress.phone.trim()) {
            toast.error("Please enter recipient's delivery phone number");
            return;
          }
          if (!shippingAddress.addressLine1.trim()) {
            toast.error("Please enter your street address");
            return;
          }
          if (!shippingAddress.district.trim()) {
            toast.error("Please select your District");
            return;
          }

          // Auto-save this address to user's account seamlessly
          try {
            const savedAddrRes = await createAddress({
              fullName: shippingAddress.fullName.trim(),
              phone: shippingAddress.phone.trim(),
              addressLine1: shippingAddress.addressLine1.trim(),
              addressLine2: shippingAddress.addressLine2?.trim() || undefined,
              divisionId: shippingAddress.divisionId || undefined,
              districtId: shippingAddress.districtId || undefined,
              upazilaId: shippingAddress.upazilaId || undefined,
              unionId: shippingAddress.unionId || undefined,
              division: shippingAddress.division?.trim() || undefined,
              district: shippingAddress.district.trim(),
              upazila: shippingAddress.upazila?.trim() || undefined,
              thana: shippingAddress.thana?.trim() || undefined,
              area: shippingAddress.area?.trim() || undefined,
              postalCode: shippingAddress.postalCode?.trim() || undefined,
              countryCode: shippingAddress.countryCode || "BD",
            }).unwrap();

            targetAddressId = savedAddrRes.data.id;
            setSelectedAddressId(targetAddressId);
            setUseCustomAddress(false);
          } catch (addrErr: any) {
            toast.error(
              addrErr?.data?.message || addrErr?.message || "Failed to save delivery address"
            );
            return;
          }
        }

        if (!targetAddressId) {
          toast.error("Please select a delivery address");
          return;
        }

        const res = await checkoutAuthenticated({
          shippingAddressId: targetAddressId,
          billingSameAsShipping,
          shippingMethodId,
          paymentMethod,
          paymentMethodCode,
          senderNumber: paymentMethodCode !== "cod" ? senderNumber.trim() : undefined,
          transactionId: paymentMethodCode !== "cod" ? transactionId.trim() : undefined,
          couponCode: couponCode || undefined,
          customerNote: customerNote || undefined,
          paidInFull: isAdvanceRequired ? paidInFull : true,
        }).unwrap();

        // Clean up applied coupon from session
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkout_coupon_code");
          sessionStorage.removeItem("checkout_coupon_discount");
        }

        // If automated gateway, initiate session and redirect customer to gateway portal
        if (
          res.data.paymentMethodType === "AUTOMATED_GATEWAY" &&
          res.data.id
        ) {
          const toastId = toast.loading("Connecting to secure payment gateway...");
          try {
            const initRes = await initiateGateway(res.data.id).unwrap();
            if (initRes.data?.gatewayUrl) {
              toast.dismiss(toastId);
              window.location.href = initRes.data.gatewayUrl;
              return;
            }
            throw new Error("Payment gateway did not provide a redirect URL.");
          } catch (initErr: any) {
            toast.dismiss(toastId);
            const errMsg =
              initErr?.data?.message ||
              initErr?.message ||
              "Failed to initialize payment gateway.";
            toast.error(errMsg);
            return;
          }
        }

        toast.success("Order placed successfully!");
        router.push(`/order-success/${res.data.orderNumber}`);
      } else {
        // Guest Checkout
        if (!customer.name.trim()) {
          toast.error("Please enter your name");
          return;
        }
        if (!customer.phone.trim()) {
          toast.error("Please enter your phone number");
          return;
        }
        if (!shippingAddress.addressLine1.trim()) {
          toast.error("Please enter your street address");
          return;
        }
        if (!shippingAddress.district.trim()) {
          toast.error("Please specify your city or district");
          return;
        }

        // Fill recipient name and phone from customer
        const guestAddress: CheckoutAddress = {
          ...shippingAddress,
          fullName: (deliverToSomeoneElse && shippingAddress.fullName.trim())
            ? shippingAddress.fullName.trim()
            : customer.name.trim(),
          phone: (deliverToSomeoneElse && shippingAddress.phone.trim())
            ? shippingAddress.phone.trim()
            : customer.phone.trim(),
        };

        const res = await checkoutGuest({
          customer: {
            name: customer.name.trim(),
            email: customer.email?.trim() || undefined,
            phone: customer.phone.trim(),
          },
          createAccount,
          shippingAddress: guestAddress,
          billingSameAsShipping,
          billingAddress: billingSameAsShipping ? undefined : billingAddress,
          shippingMethodId,
          paymentMethod,
          paymentMethodCode,
          senderNumber: paymentMethodCode !== "cod" ? senderNumber.trim() : undefined,
          transactionId: paymentMethodCode !== "cod" ? transactionId.trim() : undefined,
          couponCode: couponCode || undefined,
          customerNote: customerNote || undefined,
          paidInFull: isAdvanceRequired ? paidInFull : true,
        }).unwrap();

        // Clean up applied coupon from session
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkout_coupon_code");
          sessionStorage.removeItem("checkout_coupon_discount");
        }

        // Store guest access token for accessing guest order status
        if (res.data.guestAccessToken) {
          sessionStorage.setItem(`order_token_${res.data.orderNumber}`, res.data.guestAccessToken);
        }

        // If automated gateway, initiate session and redirect customer to gateway portal
        if (
          res.data.paymentMethodType === "AUTOMATED_GATEWAY" &&
          res.data.id
        ) {
          const toastId = toast.loading("Connecting to secure payment gateway...");
          try {
            const initRes = await initiateGateway(res.data.id).unwrap();
            if (initRes.data?.gatewayUrl) {
              toast.dismiss(toastId);
              window.location.href = initRes.data.gatewayUrl;
              return;
            }
            throw new Error("Payment gateway did not provide a redirect URL.");
          } catch (initErr: any) {
            toast.dismiss(toastId);
            const errMsg =
              initErr?.data?.message ||
              initErr?.message ||
              "Failed to initialize payment gateway.";
            toast.error(errMsg);
            return;
          }
        }

        toast.success("Order placed successfully!");
        const tokenQuery = res.data.guestAccessToken ? `?token=${res.data.guestAccessToken}` : "";
        router.push(`/order-success/${res.data.orderNumber}${tokenQuery}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to place order. Please try again.");
    }
  };

  // If cart is empty
  if (!isCartLoading && items.length === 0) {
    return (
      <StoreContainer className="py-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          Your Cart is Empty
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          Browse Products
        </Link>
      </StoreContainer>
    );
  }

  return (
    <StoreContainer className="py-8 md:py-12">
      {/* ── Breadcrumb & Back Link ───────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Return to Cart
        </Link>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Cart</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Checkout</span>
        </nav>
      </div>

      {paymentQuery === "cancelled" && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-bold">অনলাইন পেমেন্ট বাতিল করা হয়েছে</p>
            <p className="text-xs mt-0.5 opacity-90">
              গেটওয়ে থেকে পেমেন্ট বাতিল করা হয়েছে। কোনো অর্ডার তৈরি করা হয়নি এবং আপনার কার্টের সমস্ত পণ্য অক্ষত রয়েছে। আপনি পুনরায় চেষ্টা করতে পারেন অথবা ক্যাশ অন ডেলিভারি বেছে নিতে পারেন।
            </p>
          </div>
        </div>
      )}

      {paymentQuery === "failed" && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="size-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="font-bold">পেমেন্ট সম্পন্ন হয়নি</p>
            <p className="text-xs mt-0.5 opacity-90">
              পেমেন্ট গেটওয়েতে ত্রুটি হয়েছে। কোনো অর্ডার তৈরি হয়নি এবং আপনার কার্টের পণ্যগুলো অক্ষত রয়েছে। অনুগ্রহ করে অন্য মাধ্যমে চেষ্টা করুন অথবা ক্যাশ অন ডেলিভারি বেছে নিন।
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] lg:items-start">
        {/* ════════════════════════════════════════
            LEFT COLUMN — Checkout Steps
        ════════════════════════════════════════ */}
        <div className="space-y-8">
          {/* ── STEP 1: Contact Information ───────────────────────────────── */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Contact Information
              </h2>
            </div>

            <CheckoutContactStep
              user={user}
              customer={customer}
              onChangeCustomer={setCustomer}
              createAccount={createAccount}
              onChangeCreateAccount={setCreateAccount}
            />
          </section>

          {/* ── STEP 2: Delivery Address ──────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Shipping Address
                </h2>
              </div>

              {user && savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseCustomAddress(!useCustomAddress)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {useCustomAddress ? "Select saved address" : "+ Add new address"}
                </button>
              )}
            </div>

            {user && savedAddresses.length > 0 && !useCustomAddress ? (
              <div className="space-y-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "group relative flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border bg-card hover:border-foreground/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin
                          className={cn(
                            "size-5 mt-0.5 shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                            <span>{addr.fullName}</span>
                            {addr.isDefaultShipping && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground">{addr.phone}</p>
                          <p className="text-foreground">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.district}, Bangladesh {addr.postalCode ? `(${addr.postalCode})` : ""}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors mt-1",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <CheckoutAddressForm
                  address={shippingAddress}
                  onChange={setShippingAddress}
                  showContactFields={user ? true : deliverToSomeoneElse}
                />
                {!user && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={deliverToSomeoneElse}
                        onChange={(e) => setDeliverToSomeoneElse(e.target.checked)}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>Deliver to someone else (different recipient name or phone)</span>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* ── Billing Address Checkbox ────────────────────────────────── */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Billing address is the same as shipping address</span>
              </label>

              {!billingSameAsShipping && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Billing Address
                  </h3>
                  <CheckoutAddressForm
                    address={billingAddress}
                    onChange={setBillingAddress}
                    showContactFields={true}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── STEP 3: Delivery Options ──────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Delivery Method
              </h2>
            </div>

            <CheckoutShippingMethods
              methods={methodsToDisplay}
              selectedMethodId={shippingMethodId}
              onSelectMethod={setShippingMethodId}
              isLoading={isShippingMethodsLoading || isCalculatingShipping}
              zoneName={resolvedZoneName}
            />
          </section>

          {/* ── STEP 4: Payment Method ────────────────────────────────────── */}
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Payment Method
              </h2>
            </div>

            <CheckoutPaymentMethod
              selectedCode={paymentMethodCode}
              onSelectMethod={(code, type, methodType) => {
                setPaymentMethodCode(code);
                setPaymentMethod(type);
                if (methodType) setPaymentMethodType(methodType);
              }}
              senderNumber={senderNumber}
              onChangeSenderNumber={setSenderNumber}
              transactionId={transactionId}
              onChangeTransactionId={setTransactionId}
              totalAmount={grandTotalNum}
              isAdvanceRequired={isAdvanceRequired}
              advanceAmount={advanceAmountNum}
              dueAmount={dueAmountNum}
              isCodAvailable={isCodAvailableForAll}
              paidInFull={paidInFull}
              onTogglePaidInFull={setPaidInFull}
            />
          </section>

          {/* ── STEP 5: Delivery Note ─────────────────────────────────────── */}
          <section className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-muted-foreground" />
              <span>Order Notes & Delivery Instructions (Optional)</span>
            </div>
            <Textarea
              placeholder="e.g. Please call before delivery, leave near front gate, or ring doorbell twice."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="resize-none text-xs"
              rows={3}
            />
          </section>
        </div>

        {/* ════════════════════════════════════════
            RIGHT COLUMN — Sticky Order Summary
        ════════════════════════════════════════ */}
        <div className="lg:sticky lg:top-24">
          <CheckoutOrderSummary
            items={items}
            summary={summary}
            shippingFee={shippingFee}
            couponCode={couponCode}
            discountAmount={couponDiscount}
            isFreeShipping={isAllFreeShipping && !isSelectedExpress}
            isAdvanceRequired={isAdvanceRequired}
            advanceAmount={advanceAmountNum}
            dueAmount={dueAmountNum}
            paidInFull={paidInFull}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </StoreContainer>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <StoreContainer className="py-12">
          <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
        </StoreContainer>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
