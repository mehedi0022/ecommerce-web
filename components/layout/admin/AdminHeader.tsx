"use client";

import { Bell, Search, Command, Menu, LogOut, User, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminNavigation } from "@/constants/admin-navigation";
import { useMeQuery, useLogoutMutation } from "@/modules/auth/authApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const AdminHeader = () => {
  const router = useRouter();
  const { data: meData } = useMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = meData?.data;
  const isSuperAdmin =
    user?.role?.key === "SUPER_ADMIN" ||
    (user?.role?.rank !== undefined && user.role.rank >= 8);
  const userPermissions = new Set(user?.permissions || []);

  const hasAccess = (req?: string | string[]) => {
    if (isSuperAdmin || !req) return true;
    if (Array.isArray(req)) {
      return req.some((p) => userPermissions.has(p));
    }
    return userPermissions.has(req);
  };

  const mobileNavLinks = adminNavigation
    .flatMap((item) => {
      if (item.children) {
        return item.children.filter((child) =>
          hasAccess(child.requiredPermission)
        );
      }
      return hasAccess(item.requiredPermission) ? [item] : [];
    });

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "AD";
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out successfully.");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile Menu */}
      <details className="relative md:hidden">
        <summary
          aria-label="Open admin navigation"
          className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border hover:bg-muted"
        >
          <Menu className="size-4" />
        </summary>
        <nav
          aria-label="Mobile admin navigation"
          className="absolute left-0 top-12 z-50 max-h-[70vh] w-64 overflow-auto rounded-xl border bg-background p-2 shadow-xl"
        >
          {mobileNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-muted font-medium"
              onClick={(event) =>
                event.currentTarget.closest("details")?.removeAttribute("open")
              }
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </details>

      {/* Search Input */}
      <div className="relative min-w-0 max-w-96 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products, orders, staff..."
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
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-muted/60 transition-colors focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs ring-2 ring-primary/20">
              {getInitials(user?.fullName, user?.email ?? undefined)}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold leading-none text-foreground truncate max-w-28">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {user?.role?.name || "Staff"}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">
                  {user?.fullName || "Account"}
                </span>
                <span className="text-[11px] font-normal text-muted-foreground truncate">
                  {user?.email}
                </span>
                <span className="text-[10px] text-primary font-semibold mt-1">
                  Role: {user?.role?.name || "Staff"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/admin/users")}
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              <Shield className="size-3.5 text-muted-foreground" />
              Staff Accounts
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/roles")}
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              <Shield className="size-3.5 text-muted-foreground" />
              Roles & Permissions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs text-destructive cursor-pointer flex items-center gap-2 focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="size-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
