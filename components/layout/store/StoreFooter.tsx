"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Lock,
  Package,
  HelpCircle,
  FileText,
  Heart,
  ShoppingCart,
  Send,
} from "lucide-react";

import { StoreContainer } from "./StoreContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StoreFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribed(true);
    toast.success("Successfully subscribed to newsletter! Thank you.");
    setEmail("");
  };

  return (
    <footer className="mt-auto border-t bg-card text-card-foreground">
      {/* ── 1. Value Propositions Banner ─── */}
      <div className="border-b border-border/60 bg-muted/30">
        <StoreContainer>
          <div className="grid grid-cols-2 gap-4 py-8 md:grid-cols-4 lg:gap-8">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Fast Delivery
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Across Bangladesh in 24–72 hrs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <RotateCcw className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  7-Day Easy Return
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hassle-free product exchange
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  100% Authentic
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quality verified products
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Cash on Delivery
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pay upon receiving your package
                </p>
              </div>
            </div>
          </div>
        </StoreContainer>
      </div>

      {/* ── 2. Main Footer Content ─── */}
      <StoreContainer className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Column 1 & 2: Brand Information & Contact */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-block text-2xl font-black tracking-tight"
            >
              Store<span className="text-primary">.</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              Your premier online shopping destination in Bangladesh. Supplying
              genuine quality products, rapid courier delivery, and 24/7 dedicated
              customer support.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>
                  Hotline:{" "}
                  <a
                    href="tel:+8801700000000"
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    +880 1700-000000
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>
                  Email:{" "}
                  <a
                    href="mailto:support@store.com"
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    support@store.com
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-primary" />
                <span>Saturday - Thursday: 9:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/track-order"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Package className="size-3.5" />
                  <span>Track Your Order</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Return & Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Lock className="size-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <FileText className="size-3.5" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <HelpCircle className="size-3.5" />
                  <span>Help & Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?isFeatured=true"
                  className="hover:text-primary transition-colors"
                >
                  Featured Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <ShoppingCart className="size-3.5" />
                  <span>Shopping Cart</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Heart className="size-3.5" />
                  <span>Wishlist</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-primary transition-colors"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter & Payment / Delivery */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Newsletter
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Subscribe to receive exclusive deals, new arrivals, and voucher codes.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-1.5">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-background border-border/80"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3 rounded-xl font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            </form>

            {/* Delivery & Payment Badges */}
            <div className="pt-2 space-y-2.5">
              <p className="text-[11px] font-semibold text-foreground/80">
                Delivery Partners
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-foreground">
                  Pathao Courier
                </span>
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-foreground">
                  Steadfast Courier
                </span>
              </div>

              <p className="text-[11px] font-semibold text-foreground/80 pt-1">
                Payment Methods
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-semibold text-foreground">
                  bKash
                </span>
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-semibold text-foreground">
                  Nagad
                </span>
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-semibold text-foreground">
                  Rocket
                </span>
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-semibold text-foreground">
                  Visa
                </span>
                <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 font-semibold text-foreground">
                  Mastercard
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  Cash on Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </StoreContainer>

      {/* ── 3. Bottom Copyright Bar ─── */}
      <div className="border-t border-border/60 bg-muted/20">
        <StoreContainer>
          <div className="flex flex-col gap-3 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Store. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <Link
                href="/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/return-policy"
                className="hover:text-foreground transition-colors"
              >
                Return Policy
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms & Conditions
              </Link>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Lock className="size-3 text-emerald-600" />
                SSL 256-bit Encrypted
              </span>
            </div>
          </div>
        </StoreContainer>
      </div>
    </footer>
  );
}
