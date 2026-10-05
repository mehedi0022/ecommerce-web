import { buildMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  ArrowLeft,
  Compass,
  Tag,
  Sparkles,
  Flame,
  Truck,
  RotateCcw,
  Headphones,
} from "lucide-react";

export const metadata = buildMetadata({
  title: "Page Not Found | Store",
  description:
    "Oops! The page or product you are looking for is no longer available.",
  noIndex: true,
});

export default function NotFound() {
  const popularCategories = [
    { name: "New Arrivals", href: "/new-arrivals", icon: Sparkles },
    { name: "Best Sellers", href: "/best-sellers", icon: Flame },
    { name: "Special Deals", href: "/deals", icon: Tag },
    { name: "Explore All", href: "/shop", icon: Compass },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Error 404
          </div>

          {/* Glowing 404 Heading */}
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-900 drop-shadow-sm">
            404
          </h1>

          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Looks like this item or page is out of stock.
          </h2>

          <p className="mt-3 text-base text-slate-600 max-w-md mx-auto">
            The link might be broken, or the item may have been moved. Try
            searching or browse our trending collections below.
          </p>

          {/* E-Commerce Search Bar */}
          <form action="/search" method="GET" className="mt-8 max-w-md mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                name="q"
                placeholder="Search products, brands, or categories..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pl-11 pr-24 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <button
                type="submit"
                className="absolute right-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Nav Options */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Popular E-Commerce Quick Links */}
          <div className="mt-12 pt-8 border-t border-slate-200/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Or explore our popular destinations
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200/60 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm transition group"
                  >
                    <Icon className="h-5 w-5 text-slate-500 group-hover:text-indigo-600 mb-1.5 transition" />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-900">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Features Footer Banner */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Free Worldwide Delivery
              </p>
              <p className="text-[11px] text-slate-500">
                On all orders over $75
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                30-Day Easy Returns
              </p>
              <p className="text-[11px] text-slate-500">
                Hassle-free return policy
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                24/7 Dedicated Support
              </p>
              <p className="text-[11px] text-slate-500">
                Contact us anytime for help
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
