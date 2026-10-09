import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Scale,
  Ban,
  UserCheck,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Store",
  description:
    "Review our Terms and Conditions regarding website usage, purchase agreements, shipping, and customer rights.",
};

export default function TermsPage() {
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
            Terms & Conditions
          </span>
        </nav>

        {/* ── Page Header ─── */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Scale className="size-3.5" />
            <span>User Agreement & Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            By accessing or placing an order on our platform, you acknowledge and agree to abide by these Terms and Conditions. Please review them carefully before placing an order.
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Last Updated: October 2026
          </p>
        </div>

        {/* ── Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* Main Legal Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserCheck className="size-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  1. Account & General Usage
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using this website, you represent that you are at least 18 years of age or accessing under the supervision of a parent or guardian.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>You must provide accurate, active, and complete contact details, phone numbers, and delivery addresses when placing an order.</li>
                <li>Delays or failed deliveries resulting from inaccurate contact or address details provided by the customer are the customer’s responsibility.</li>
                <li>You are responsible for maintaining the confidentiality of any user account credentials and passwords.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="size-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  2. Pricing & Payment Policy
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All prices displayed on the store are stated in Bangladeshi Taka (BDT ৳) and are inclusive of relevant statutory taxes where applicable.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Product inventory and listed prices are subject to change without prior notice.</li>
                <li>We support Cash on Delivery (COD) as well as authorized digital payment methods (bKash, Nagad, Rocket, Credit/Debit cards).</li>
                <li>In the rare event that an item is listed at an incorrect price due to technical error, we reserve the right to cancel any orders placed at that erroneous price.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Truck className="size-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  3. Order Confirmation & Shipping
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                After placing an order, our fulfillment team may contact you via phone or SMS for verification before dispatching your package.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground mb-1">
                    Inside Dhaka Metro
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Standard delivery typically completed within 24 to 48 hours.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground mb-1">
                    Outside Dhaka (All Bangladesh)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Delivery via partner courier within 2 to 4 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Ban className="size-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  4. Cancellation Policy
                </h2>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Orders can be cancelled at no fee prior to parcel packing and courier dispatch by calling our support line.</li>
                <li>Once a parcel has already been handed over to the courier (Dispatched), cancellation at the customer's request may incur courier shipping charges.</li>
                <li>We reserve the right to cancel orders in instances of stock unavailability, suspicious activity, or unreachability of the recipient.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="size-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  5. Intellectual Property
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All materials on this website—including brand logos, images, product copy, interface designs, icons, and software code—are the intellectual property of the store and protected under applicable copyright laws. Reproduction without prior written authorization is strictly prohibited.
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">
                Related Policies
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For additional details regarding your rights and procedures, please explore our guides:
              </p>
              <div className="space-y-2 pt-2">
                <Link
                  href="/return-policy"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition text-xs font-semibold text-foreground group"
                >
                  <span>Return & Refund Policy</span>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/privacy-policy"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition text-xs font-semibold text-foreground group"
                >
                  <span>Privacy Policy</span>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/track-order"
                  className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-muted/40 transition text-xs font-semibold text-foreground group"
                >
                  <span>Order Tracking</span>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/30 p-6 space-y-4">
              <h3 className="font-bold text-base text-foreground">
                Have Any Inquiries?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have questions regarding our terms or order procedures, feel free to reach out to our dedicated support team:
              </p>
              <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Phone className="size-4 text-primary shrink-0" />
                  <a
                    href="tel:+8801700000000"
                    className="font-medium text-foreground hover:text-primary transition"
                  >
                    +880 1700-000000
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="size-4 text-primary shrink-0" />
                  <a
                    href="mailto:support@store.com"
                    className="font-medium text-foreground hover:text-primary transition"
                  >
                    support@store.com
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StoreContainer>
    </div>
  );
}
