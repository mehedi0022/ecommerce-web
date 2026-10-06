"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Home,
  Briefcase,
  Star,
  Package,
  Heart,
  RotateCcw,
  UserRound,
  LogOut,
  RefreshCw,
  Building,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useLogoutMutation } from "@/modules/auth/authApi";
import { useRouter } from "next/navigation";
import {
  useGetSavedAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultShippingAddressMutation,
  useSetDefaultBillingAddressMutation,
} from "@/modules/checkout/checkoutApi";
import { CheckoutAddressForm } from "@/modules/checkout/components/CheckoutAddressForm";
import type { CheckoutAddress, SavedAddress } from "@/modules/checkout/checkout.types";

const menuItems = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

const INITIAL_FORM_ADDRESS: CheckoutAddress = {
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

export default function CustomerAddressesPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Queries & Mutations
  const {
    data: addressesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetSavedAddressesQuery();
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultShipping] = useSetDefaultShippingAddressMutation();
  const [setDefaultBilling] = useSetDefaultBillingAddressMutation();

  const addresses = addressesData?.data ?? [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CheckoutAddress>(INITIAL_FORM_ADDRESS);
  const [addressLabel, setAddressLabel] = useState<string>("Home");

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      router.replace("/login");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAddressId(null);
    setFormData({
      ...INITIAL_FORM_ADDRESS,
      fullName: user?.fullName || user?.userName || "",
    });
    setAddressLabel("Home");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      divisionId: addr.divisionId || "6",
      districtId: addr.districtId || "47",
      upazilaId: addr.upazilaId || "",
      unionId: addr.unionId || "",
      division: addr.division || "Dhaka",
      district: addr.district || "Dhaka",
      upazila: addr.upazila || "",
      thana: addr.thana || "",
      area: addr.area || "",
      postalCode: addr.postalCode || "",
      countryCode: addr.countryCode || "BD",
    });
    setAddressLabel(addr.label || "Home");
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter recipient's full name");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!formData.addressLine1.trim()) {
      toast.error("Please enter your street address");
      return;
    }
    if (!formData.district.trim()) {
      toast.error("Please select a District");
      return;
    }

    try {
      if (editingAddressId) {
        // Update
        await updateAddress({
          addressId: editingAddressId,
          data: {
            ...formData,
            label: addressLabel,
          },
        }).unwrap();
        toast.success("Address updated successfully");
      } else {
        // Create
        await createAddress({
          ...formData,
          label: addressLabel,
        }).unwrap();
        toast.success("Address added successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to save address"
      );
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id).unwrap();
      toast.success("Address deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete address");
    }
  };

  const handleSetDefaultShipping = async (id: number) => {
    try {
      await setDefaultShipping(id).unwrap();
      toast.success("Default shipping address updated");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update default address");
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-12">
      <StoreContainer>
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Addresses</span>
        </nav>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Saved Addresses
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your delivery and billing addresses for fast and seamless checkout.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-semibold"
              )}
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </button>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenCreateModal}
              className="gap-1.5 text-xs font-bold"
            >
              <Plus className="size-4" />
              Add New Address
            </Button>
          </div>
        </div>

        {/* ── Layout Grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Account Sidebar Navigation */}
          <aside className="hidden lg:block">
            <Card className="overflow-hidden">
              <div className="border-b bg-primary p-4 text-primary-foreground">
                <p className="font-semibold text-sm truncate">
                  {user?.fullName || user?.userName}
                </p>
                <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                  {user?.email}
                </p>
              </div>
              <nav className="p-2 space-y-0.5" aria-label="Account navigation">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/account/addresses";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Addresses Grid */}
          <section className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-6 space-y-4"
                  >
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                  <MapPin className="size-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  No Saved Addresses Found
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto">
                  Add your home or office address now so you won&apos;t have to re-enter your details on checkout.
                </p>
                <Button
                  onClick={handleOpenCreateModal}
                  size="default"
                  className="mt-5 gap-1.5 font-bold"
                >
                  <Plus className="size-4" />
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => {
                  const isHome = (addr.label || "").toLowerCase().includes("home");
                  const isOffice = (addr.label || "").toLowerCase().includes("office") || (addr.label || "").toLowerCase().includes("work");
                  const LabelIcon = isHome ? Home : isOffice ? Briefcase : Building;

                  return (
                    <div
                      key={addr.id}
                      className={cn(
                        "group relative flex flex-col justify-between rounded-2xl border bg-card p-5 sm:p-6 transition-all duration-200 shadow-xs hover:border-primary/40 hover:shadow-sm",
                        addr.isDefaultShipping && "border-primary/50 bg-primary/[0.015]"
                      )}
                    >
                      <div>
                        {/* Top Label & Badges */}
                        <div className="flex items-center justify-between gap-2 border-b pb-3">
                          <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                            <LabelIcon className="size-4 text-primary" />
                            <span>{addr.label || "Address"}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {addr.isDefaultShipping && (
                              <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5">
                                Default Shipping
                              </Badge>
                            )}
                            {addr.isDefaultBilling && (
                              <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5">
                                Default Billing
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="mt-4 space-y-1.5 text-xs">
                          <p className="font-bold text-sm text-foreground">
                            {addr.fullName}
                          </p>
                          <p className="font-medium text-foreground">
                            {addr.phone}
                          </p>
                          <p className="text-muted-foreground leading-relaxed pt-1">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          </p>
                          <p className="text-muted-foreground font-medium">
                            {addr.upazila ? `${addr.upazila}, ` : ""}
                            {addr.district}, Bangladesh {addr.postalCode ? `(${addr.postalCode})` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs">
                        <div>
                          {!addr.isDefaultShipping ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultShipping(addr.id)}
                              className="text-[11px] font-medium text-primary hover:underline"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3.5" />
                              Primary Address
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditModal(addr)}
                            className="size-8 text-muted-foreground hover:text-foreground"
                            aria-label="Edit address"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="size-8 text-muted-foreground hover:text-destructive"
                            aria-label="Delete address"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </StoreContainer>

      {/* ── Address Add/Edit Modal ────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4 py-2">
            {/* Address Label Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Address Tag / Label
              </label>
              <div className="flex gap-2">
                {["Home", "Office", "Other"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAddressLabel(label)}
                    className={cn(
                      "rounded-lg border px-3.5 py-1.5 text-xs font-medium transition",
                      addressLabel === label
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Bangladesh Cascading Form */}
            <CheckoutAddressForm
              address={formData}
              onChange={setFormData}
              showContactFields={true}
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating || isUpdating}
                className="font-bold"
              >
                {isCreating || isUpdating ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
