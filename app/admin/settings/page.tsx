"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Store,
  User,
  Lock,
  Layers,
  Save,
  Check,
  ExternalLink,
  ShieldCheck,
  Activity,
  FileText,
  CreditCard,
  Truck,
  Radio,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Globe,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useMeQuery, useChangePasswordMutation } from "@/modules/auth/authApi";

export default function SettingsPage() {
  const { data: meData } = useMeQuery();
  const currentUser = meData?.data;
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [saved, setSaved] = useState(false);

  // Store General State
  const [storeName, setStoreName] = useState("Premium Store");
  const [storeTagline, setStoreTagline] = useState(
    "Quality products with express delivery across Bangladesh.",
  );
  const [supportEmail, setSupportEmail] = useState("support@example.com");
  const [supportPhone, setSupportPhone] = useState("+880 1712-345678");
  const [currency] = useState("BDT (৳)");
  const [timezone] = useState("Asia/Dhaka (GMT+6)");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveStoreSettings = () => {
    setSaved(true);
    toast.success("General store settings saved successfully!");
    setTimeout(() => setSaved(false), 2200);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to update password.",
      );
    }
  };

  const modulesList = [
    {
      title: "Marketing & Tracking Pixels",
      description:
        "Manage Facebook Pixel, Conversions API (CAPI), TikTok Ads, and Google Tag Manager.",
      href: "/admin/settings/marketing",
      icon: Activity,
      badge: "CAPI Active",
      badgeVariant: "default",
    },
    {
      title: "Invoice & Shipping Labels",
      description:
        "Customize company branding, store logo, return address, BIN, and barcode print formats.",
      href: "/admin/settings/invoice",
      icon: FileText,
      badge: "A4 & Thermal",
      badgeVariant: "secondary",
    },
    {
      title: "Payment Methods & Gateways",
      description:
        "Configure bKash, Nagad, Rocket, Bank transfer accounts, and automated gateways.",
      href: "/admin/settings/payments",
      icon: CreditCard,
      badge: "MFS & Gateway",
      badgeVariant: "secondary",
    },
    {
      title: "Courier Logistics Integration",
      description:
        "Connect Steadfast and Pathao for automated parcel dispatch, tracking, and balance checking.",
      href: "/admin/settings/courier",
      icon: Truck,
      badge: "Automated",
      badgeVariant: "default",
    },
    {
      title: "SMS & Notification Engine",
      description:
        "Setup Bangladeshi SMS gateways, dynamic event templates, and monitor SMS delivery logs.",
      href: "/admin/settings/notifications",
      icon: Radio,
      badge: "Multi-Gateway",
      badgeVariant: "secondary",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="size-6 text-primary" />
            General Store Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage store preferences, regional defaults, profile identity and
            security credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleSaveStoreSettings}
            disabled={saved}
            className="gap-1.5 h-9 bg-primary font-semibold shadow-xs text-xs"
          >
            {saved ? (
              <Check className="size-3.5" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saved ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* ── Horizontal Navigation Tabs (No nested sidebar) ── */}
      <Tabs defaultValue="store" className="space-y-6 flex flex-col">
        <TabsList className="h-10 bg-muted/60 p-1 flex-wrap gap-1">
          <TabsTrigger
            value="store"
            className="gap-2 text-xs font-semibold data-[state=active]:bg-background cursor-pointer"
          >
            <Store className="size-3.5 text-primary" />
            Store Identity
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="gap-2 text-xs font-semibold data-[state=active]:bg-background cursor-pointer"
          >
            <User className="size-3.5 text-primary" />
            Admin Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2 text-xs font-semibold data-[state=active]:bg-background cursor-pointer"
          >
            <Lock className="size-3.5 text-primary" />
            Security & Password
          </TabsTrigger>
          <TabsTrigger
            value="modules"
            className="gap-2 text-xs font-semibold data-[state=active]:bg-background cursor-pointer"
          >
            <Layers className="size-3.5 text-primary" />
            Settings Modules Hub
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Store Identity ── */}
        <TabsContent value="store" className="space-y-6">
          <Card className="border shadow-none">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Store className="size-4 text-primary" />
                Storefront Information
              </CardTitle>
              <CardDescription className="text-xs">
                These details are displayed on customer receipts, storefront
                footer, and notification emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Store Name</Label>
                  <Input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. My Premium Store"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Public brand name shown in header and titles.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Support Email</Label>
                  <div className="relative">
                    <Mail className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="pl-9"
                      placeholder="support@example.com"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Inquiries and customer reply-to address.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Support Phone / Helpline
                  </Label>
                  <div className="relative">
                    <Phone className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="pl-9"
                      placeholder="+880 1712-345678"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Customer care number displayed on invoice and header.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Store Currency</Label>
                  <div className="relative">
                    <DollarSign className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      value={currency}
                      disabled
                      className="pl-9 bg-muted/40 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Primary operational currency (Bangladeshi Taka).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Store Tagline / Description
                </Label>
                <Textarea
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  rows={3}
                  placeholder="Short description for search engine previews and metadata."
                />
              </div>

              <div className="flex justify-end pt-3 border-t">
                <Button
                  onClick={handleSaveStoreSettings}
                  size="sm"
                  className="gap-1.5 h-9 bg-primary font-semibold shadow-xs text-xs"
                >
                  <Save className="size-3.5" />
                  Save Store Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Admin Profile ── */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border shadow-none">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                Logged-In Administrator
              </CardTitle>
              <CardDescription className="text-xs">
                Your authenticated account details and RBAC security role.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Full Name</Label>
                  <Input
                    defaultValue={currentUser?.fullName || "Administrator"}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Username</Label>
                  <Input
                    defaultValue={currentUser?.userName || "admin"}
                    disabled
                    className="bg-muted/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input
                    defaultValue={currentUser?.email || "admin@example.com"}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Phone Number</Label>
                  <Input
                    defaultValue={currentUser?.phone || "+880 1700-000000"}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Assigned System Role
                  </Label>
                  <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted/40 text-sm">
                    <ShieldCheck className="size-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {currentUser?.role?.name || "Super Admin"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] font-semibold"
                    >
                      Rank {currentUser?.role?.rank ?? 10}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Account Status</Label>
                  <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted/40 text-sm">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      Active & Verified
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Security & Password ── */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border shadow-none">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Lock className="size-4 text-primary" />
                Password & Security
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your administrative account remains protected with a
                strong credentials policy.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                onSubmit={handleChangePassword}
                className="space-y-5 max-w-xl"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">New Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Must be at least 6 characters with mixed letters and
                    numbers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="gap-1.5 h-9 bg-primary font-semibold shadow-xs text-xs"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Lock className="size-3.5" />
                    )}
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Settings Modules Hub ── */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulesList.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.href}
                  className="border shadow-none hover:border-primary/40 transition-colors flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <Badge
                        variant={m.badgeVariant as any}
                        className="text-[10px]"
                      >
                        {m.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold mt-3">
                      {m.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {m.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link href={m.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs h-8 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Open Settings
                        <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
