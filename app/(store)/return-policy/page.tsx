import type { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Truck,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Package,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Store",
  description:
    "Read our 7-day hassle-free return and refund policy. Easy courier return pickup and transparent refund procedures.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="py-10 sm:py-16">
      <StoreContainer>
        {/* ── Breadcrumb ─── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-foreground">
            Return & Refund Policy
          </span>
        </nav>

        {/* ── Page Header ─── */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
            <RotateCcw className="size-3.5" />
            <span>7-Day Hassle-Free Returns</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Return & Refund Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Customer satisfaction is our highest priority. If you encounter any issue with your purchase, we provide a smooth, transparent return, replacement, and refund process.
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Last Updated: October 2026
          </p>
        </div>

        {/* ── Content Grid ─── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Main Policy Content */}
          <div className="space-y-10 text-sm leading-relaxed text-foreground/90">
            {/* Highlights Bar */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
                <Clock className="size-6 text-primary" />
                <h3 className="font-bold text-foreground text-sm">7-Day Window</h3>
                <p className="text-xs text-muted-foreground">
                  Initiate a return request within 7 calendar days of parcel delivery.
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
                <Truck className="size-6 text-emerald-600" />
                <h3 className="font-bold text-foreground text-sm">Doorstep Pickup</h3>
                <p className="text-xs text-muted-foreground">
                  Convenient parcel collection by Pathao or Steadfast Couriers.
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
                <CreditCard className="size-6 text-sky-600" />
                <h3 className="font-bold text-foreground text-sm">3–5 Days Refund</h3>
                <p className="text-xs text-muted-foreground">
                  Rapid payout via bKash, Nagad, Rocket, or direct bank transfer.
                </p>
              </div>
            </div>

            {/* Section 1: Conditions */}
            <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <CheckCircle2 className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  1. Return Eligibility & Conditions
                </h2>
              </div>
              <p className="text-muted-foreground">
                To qualify for a valid return or exchange, the item must satisfy the following conditions:
              </p>
              <ul className="space-y-2.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    The item must be in its original, unworn, unwashed, and undamaged condition.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    All original manufacturer packaging, tags, stickers, warranty cards, manuals, and invoice receipts must be included.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Defective, damaged, or broken items upon delivery must be reported to our support team within 24 to 48 hours with photographic evidence.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Items delivered with wrong color, size, or incorrect model specifications are eligible for immediate complimentary replacement.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 2: Non-Returnable Items */}
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-destructive">
                <ShieldAlert className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  2. Non-Returnable Items
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Due to health, personal hygiene, and customized constraints, the following categories are strictly non-returnable:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs">
                <li>Personal hygiene items, undergarments, and intimate apparel</li>
                <li>Customized, engraved, or made-to-order products</li>
                <li>Items damaged through improper handling, customer misuse, or liquid spillage</li>
                <li>Electronic items with broken manufacturer security seals or tampered serial numbers</li>
              </ul>
            </section>

            {/* Section 3: Return Process Steps */}
            <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Package className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  3. Step-by-Step Return Process
                </h2>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex gap-3.5 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      Submit a Return Request
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Contact our support helpline or WhatsApp with your Order ID (e.g. ORD-1001), short description, and unboxing photo or video.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      Courier Pickup & Handover
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Our courier partner will schedule a doorstep pickup from your address or provide return consignment instructions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      Inspection & Settlement
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Once received at our hub, our quality inspection team verifies the package and promptly executes your preferred replacement or refund.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Refund Timelines */}
            <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <CreditCard className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  4. Refund Methods & Timelines
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Once the returned item passes quality verification, your refund will be disbursed according to the schedule below:
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                  <p className="font-semibold text-foreground text-xs">bKash / Nagad / Rocket</p>
                  <p className="text-base font-black text-primary mt-1">3–5 Business Days</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Direct wallet transfer
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                  <p className="font-semibold text-foreground text-xs">Cash on Delivery (COD)</p>
                  <p className="text-base font-black text-primary mt-1">3–5 Business Days</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Disbursed via MFS or Bank
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                  <p className="font-semibold text-foreground text-xs">Credit / Debit Cards</p>
                  <p className="text-base font-black text-primary mt-1">5–10 Business Days</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Subject to issuing bank timelines
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Delivery Charge Policy */}
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Truck className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  5. Return Shipping Fees
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If the return is due to our error (defective, damaged, or incorrect item sent), <strong>return shipping is 100% Free</strong>. If a return or size exchange is requested due to personal preference or change of mind, standard courier shipping fees may apply.
              </p>
            </section>
          </div>

          {/* Right Sidebar: Contact & Quick Links */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">
                Need to Request a Return?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have an issue with your delivered order, contact our support team directly. We are here to assist you promptly.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <Phone className="size-4 text-primary shrink-0" />
                  <a
                    href="tel:+8801700000000"
                    className="font-semibold text-foreground hover:underline"
                  >
                    +880 1700-000000
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="size-4 text-primary shrink-0" />
                  <a
                    href="mailto:support@store.com"
                    className="font-medium text-foreground hover:underline"
                  >
                    support@store.com
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Dhaka, Bangladesh</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/track-order"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span>Track Your Order</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-primary hover:underline font-semibold block"
                  >
                    → Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground block"
                  >
                    → Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-muted-foreground hover:text-foreground block"
                  >
                    → Browse Products
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </StoreContainer>
    </div>
  );
}
