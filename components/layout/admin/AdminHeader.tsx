"use client";

import { Bell, Search, Command, Menu } from "lucide-react";
import Link from "next/link";
import { adminNavigation } from "@/constants/admin-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <details className="relative md:hidden">
        <summary aria-label="Open admin navigation" className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border"><Menu className="size-4"/></summary>
        <nav aria-label="Mobile admin navigation" className="absolute left-0 top-12 z-50 max-h-[70vh] w-64 overflow-auto rounded-xl border bg-background p-2 shadow-xl">
          {adminNavigation.flatMap(item => item.children ?? [item]).map(item => <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={event => event.currentTarget.closest("details")?.removeAttribute("open")}>{item.title}</Link>)}
        </nav>
      </details>
      {/* Search Input */}
      <div className="relative min-w-0 max-w-96 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/30 pl-9 pr-12 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Account menu" className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-muted/60 transition-colors focus:outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs ring-2 ring-primary/20">
                AD
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
