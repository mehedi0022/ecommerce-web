import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Server,
  UserCheck,
  Bell,
  CreditCard,
  Truck,
  ArrowRight,
  Cookie,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";

export const metadata: Metadata = {
  title: "Privacy Policy | Store",
  description:
    "Learn about our Privacy Policy. Discover how we protect your personal data, ensure payment security, and handle your information.",
};

export default function PrivacyPolicyPage() {
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
          <span className="font-semibold text-foreground">Privacy Policy</span>
        </nav>

        {/* ── Page Header ─── */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Lock className="size-3.5" />
            <span>Security & Privacy Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            We value your trust and prioritize the security and confidentiality of your personal information. This Privacy Policy outlines how we collect, use, protect, and handle your data when you visit our website or make a purchase.
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            Last Updated: October 2026
          </p>
        </div>

        {/* ── Content Grid ─── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Main Policy Content */}
          <div className="space-y-10 text-sm leading-relaxed text-foreground/90">
            {/* Section 1 */}
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <FileText className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  1. Introduction
                </h2>
              </div>
              <p className="text-muted-foreground">
                By accessing or using our website, you agree to the collection and use of information in accordance with this Privacy Policy. We are fully committed to protecting your privacy. We will never sell, rent, trade, or distribute your personal details to unauthorized third parties for promotional or commercial purposes.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Eye className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  2. Information We Collect
                </h2>
              </div>
              <p className="text-muted-foreground">
                To fulfill orders efficiently and offer an optimal shopping experience, we collect the following types of information:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <strong>Personal Identification:</strong> Full name, contact phone number, and email address.
                </li>
                <li>
                  <strong>Shipping Details:</strong> Delivery address, city, district/division, upazila/thana, and postal code.
                </li>
                <li>
                  <strong>Order & Transaction Records:</strong> Purchased products, chosen variants, order value, payment status, and courier consignment tracking codes.
                </li>
                <li>
                  <strong>Technical & Browsing Data:</strong> IP address, device type, browser specifications, and browsing actions gathered via secure session cookies.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Server className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  3. How We Use Your Information
                </h2>
              </div>
              <p className="text-muted-foreground">
                We utilize the collected information strictly for legitimate commercial and customer service purposes:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                    <Truck className="size-4 text-primary" />
                    <span>Order Fulfillment & Delivery</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accurate packaging, dispatching, and doorstep delivery through trusted courier partners.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                    <Bell className="size-4 text-primary" />
                    <span>Order Notifications & SMS</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sending invoice details, parcel dispatch notifications, and real-time live tracking links.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                    <UserCheck className="size-4 text-primary" />
                    <span>Customer Support & Inquiries</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promptly addressing questions, warranty claims, returns, or refund processing requests.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-xs">
                    <ShieldCheck className="size-4 text-primary" />
                    <span>Fraud Prevention & Security</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Detecting suspicious orders, preventing fraudulent transactions, and ensuring platform integrity.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <CreditCard className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  4. Payment & Financial Security
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your payment safety is our top priority. We do not store or host credit/debit card numbers, PINs, CVV codes, or mobile banking MPINs on our servers.
              </p>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <Lock className="size-4 text-emerald-600" />
                  <span>256-bit SSL Encrypted Payment Gateways</span>
                </p>
                <p className="leading-relaxed">
                  All online payments are processed through PCI-DSS certified, Bangladesh Bank-approved gateways (bKash, Nagad, Rocket, Visa, Mastercard) via encrypted, secure protocols.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Truck className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  5. Third-Party Sharing & Delivery Partners
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To guarantee timely delivery, we share only necessary contact and shipping details (recipient name, address, and phone number) with our authorized courier partners, including <strong>Pathao Courier</strong> and <strong>Steadfast Courier</strong>. These partners are legally bound to protect your information and may only use it for delivery coordination.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <Cookie className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  6. Cookies & Tracking Technologies
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to maintain your cart contents, retain user preferences, and analyze site performance. You can manage or disable cookie preferences directly through your web browser settings.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary">
                <UserCheck className="size-5" />
                <h2 className="text-lg font-bold text-foreground">
                  7. Your Rights & Data Choices
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                As a valued customer, you have the right to request access to the personal data we hold about you, request corrections to inaccurate information, or request the deletion of your account. Contact our support team anytime to exercise these rights.
              </p>
            </section>
          </div>

          {/* Right Sidebar: Quick Contact & Trust Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">
                Need Help?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have questions or inquiries regarding our Privacy Policy or your personal data, please contact our support team.
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
                  <span className="text-muted-foreground">
                    Dhaka, Bangladesh
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-foreground">
                Related Policies
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  href="/return-policy"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-card transition group"
                >
                  <span className="font-medium text-foreground">
                    Return & Refund Policy
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-card transition group"
                >
                  <span className="font-medium text-foreground">
                    Terms & Conditions
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/track-order"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-card transition group"
                >
                  <span className="font-medium text-foreground">
                    Order Tracking
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </StoreContainer>
    </div>
  );
}
