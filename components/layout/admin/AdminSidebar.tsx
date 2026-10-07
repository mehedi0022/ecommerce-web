"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavigation } from "@/constants/admin-navigation";
import { useMeQuery } from "@/modules/auth/authApi";

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [groups, setGroups] = useState<Record<string, boolean>>({
    Catalog: true,
  });
  const pathname = usePathname();

  const { data: meData } = useMeQuery();
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

  const filteredNavigation = adminNavigation
    .map((item) => {
      if (item.children) {
        const allowedChildren = item.children.filter((child) =>
          hasAccess(child.requiredPermission)
        );
        if (allowedChildren.length === 0) return null;
        return { ...item, children: allowedChildren };
      }
      return hasAccess(item.requiredPermission) ? item : null;
    })
    .filter(Boolean) as typeof adminNavigation;

  const active = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <aside
      className={cn(
        "group relative hidden h-screen shrink-0 flex-col border-r border-border/60 bg-card transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center border-b border-border/60 px-3">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 rounded-xl p-1.5 focus-visible:ring-2 focus-visible:ring-ring",
            collapsed && "mx-auto",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <ShieldCheck className="size-5" />
          </span>
          {!collapsed && (
            <span>
              <span className="block text-sm font-bold tracking-tight">
                Admin Console
              </span>
              <span className="block text-[10px] font-medium text-muted-foreground">
                v2.0 Management
              </span>
            </span>
          )}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
            Workspace
          </p>
        )}
        <nav aria-label="Admin navigation" className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const groupActive =
              active(item.href) ||
              Boolean(item.children?.some((child) => active(child.href)));
            const expanded = groups[item.title] ?? groupActive;
            if (!item.children)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    groupActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon className="size-[16px]" />}
                    {!collapsed && item.title}
                  </span>
                  {!collapsed && item.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            return (
              <div key={item.href}>
                <button
                  type="button"
                  title={collapsed ? item.title : undefined}
                  aria-expanded={expanded}
                  onClick={() => {
                    if (collapsed) setCollapsed(false);
                    setGroups((value) => ({
                      ...value,
                      [item.title]: !expanded,
                    }));
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    groupActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon className="size-[16px]" />}
                    {!collapsed && item.title}
                  </span>
                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        expanded && "rotate-180",
                      )}
                    />
                  )}
                </button>
                {!collapsed && expanded && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-border/70 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                          active(child.href)
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border/60 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && (
            <span className="text-xs font-medium">Collapse menu</span>
          )}
        </button>
      </div>
    </aside>
  );
};
