"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@/modules/checkout/checkoutApi";
import { CheckoutContactStep } from "@/modules/checkout/components/CheckoutContactStep";
import { CheckoutAddressForm } from "@/modules/checkout/components/CheckoutAddressForm";
import { CheckoutShippingMethods } from "@/modules/checkout/components/CheckoutShippingMethods";
import { CheckoutPaymentMethod } from "@/modules/checkout/components/CheckoutPaymentMethod";
import { CheckoutOrderSummary } from "@/modules/checkout/components/CheckoutOrderSummary";
import type {
  CheckoutAddress,
  CheckoutCustomer,
  SavedAddress,
} from "@/modules/checkout/checkout.types";

const INITIAL_ADDRESS: CheckoutAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  district: "Dhaka",
  division: "",
  upazila: "",
  thana: "",
  area: "",
  postalCode: "",
  countryCode: "BD",
};

export default function CheckoutPage() {
  const router = useRouter();

  // Queries
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();
  const { data: userData } = useMeQuery();
  const { data: shippingMethodsData, isLoading: isShippingMethodsLoading } =
    useGetPublicShippingMethodsQuery();
  const { data: savedAddressesData } = useGetSavedAddressesQuery(undefined, {
    skip: !userData?.data,
  });

  // Mutations
  const [checkoutAuthenticated, { isLoading: isSubmittingAuth }] =
    useCheckoutAuthenticatedMutation();
  const [checkoutGuest, { isLoading: isSubmittingGuest }] =
    useCheckoutGuestMutation();

  const isSubmitting = isSubmittingAuth || isSubmittingGuest;

  // Cart & User Data
  const user = userData?.data ?? null;
  const cart = cartData?.data;
  const items = cart?.items ?? [];
  const summary = cart?.summary ?? { itemCount: 0, subtotal: "0.00" };
  const shippingMethods = (shippingMethodsData?.data ?? []).filter(
    (m) => m.isActive
  );
  const savedAddresses = savedAddressesData?.data ?? [];

  // Form State
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    name: "",
    email: "",
    phone: "",
  });

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
  const [couponCode, setCouponCode] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");

  // Sync default shipping method when loaded
  useEffect(() => {
    if (shippingMethods.length > 0 && !shippingMethodId) {
      setShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, shippingMethodId]);

  // Sync user info when logged in
  useEffect(() => {
    if (user) {
      setCustomer({
        name: user.fullName || user.userName || "",
        email: user.email ?? "",
        phone: "",
      });
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

  // Calculate selected shipping fee
  const selectedMethod = shippingMethods.find((m) => m.id === shippingMethodId);
  const isExpress = selectedMethod?.code.toUpperCase().includes("EXPRESS");
  const shippingFee = isExpress ? 10.0 : 5.0;

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

    try {
      if (user) {
        // Authenticated Checkout
        let targetAddressId = selectedAddressId;

        if (savedAddresses.length === 0 || useCustomAddress) {
          if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.district) {
            toast.error("Please fill in all required shipping address fields");
            return;
          }
          // Note: If no saved addresses exist, we inform user
          toast.error("Please save an address to your account or select an existing one.");
          return;
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
          couponCode: couponCode || undefined,
          customerNote: customerNote || undefined,
        }).unwrap();

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
          shippingAddress: guestAddress,
          billingSameAsShipping,
          billingAddress: billingSameAsShipping ? undefined : billingAddress,
          shippingMethodId,
          paymentMethod,
          couponCode: couponCode || undefined,
          customerNote: customerNote || undefined,
        }).unwrap();

        // Store guest access token for accessing guest order status
        if (res.data.guestAccessToken) {
          sessionStorage.setItem(`order_token_${res.data.orderNumber}`, res.data.guestAccessToken);
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
                  showContactFields={deliverToSomeoneElse}
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
              methods={shippingMethods}
              selectedMethodId={shippingMethodId}
              onSelectMethod={setShippingMethodId}
              isLoading={isShippingMethodsLoading}
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
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
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
            onApplyCoupon={setCouponCode}
            onRemoveCoupon={() => setCouponCode("")}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </StoreContainer>
  );
}
