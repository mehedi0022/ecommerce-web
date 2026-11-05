"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FolderTree,
  Folder,
  FolderOpen,
  Layers,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ArrowRightLeft,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Category } from "@/modules/category/types";
import {
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} from "@/modules/category/categoryApi";
import { flattenCategories, eligibleParents, mediaUrl } from "../catalog.utils";
import {
  RecordDialog,
  DeleteDialog,
  StatusBadge,
  LoadingPanel,
  ErrorPanel,
  EmptyPanel,
  ActionNotice,
  useCatalogAction,
  CatalogMedia,
} from "./CatalogShared";
import { CategoryAssignments } from "./CategoryAssignments";
import { MigrateProductsDialog } from "./MigrateProductsDialog";

export function CategoriesPage({ initialId }: { initialId?: number }) {
  const query = useGetCategoryTreeQuery();
  const rawTree = query.data?.data ?? [];
  const rows = useMemo(() => flattenCategories(rawTree), [rawTree]);

  const [selectedId, setSelectedId] = useState<number | undefined>(initialId);
  const [activeTab, setActiveTab] = useState<"attributes" | "subcategories">("attributes");
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());

  // Dialog States
  const [dialog, setDialog] = useState<{ category?: Category; parentId?: number }>();
  const [deleting, setDeleting] = useState<Category>();
  const [migratingCategory, setMigratingCategory] = useState<Category | null>(null);

  // Mutations
  const [create] = useCreateCategoryMutation();
  const [update] = useUpdateCategoryMutation();
  const [status] = useUpdateCategoryStatusMutation();
  const [remove] = useDeleteCategoryMutation();
  const [upload] = useUploadCategoryImageMutation();
  const action = useCatalogAction();

  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];

  function leave() {
    if (dirty && !window.confirm("Discard unsaved attribute assignments?")) return false;
    setDirty(false);
    return true;
  }

  // Toggle Collapse in Tree
  const toggleCollapse = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setCollapsedCategories(new Set());
  const collapseAll = () => {
    const parentIds = rows.filter((r) => !r.isLeaf).map((r) => r.id);
    setCollapsedCategories(new Set(parentIds));
  };

  const rowsById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const isHiddenByAncestor = useCallback(
    (row: (typeof rows)[0], collapsed: Set<number>, byId: Map<number, (typeof rows)[0]>) => {
      let pId = row.parentId;
      const visited = new Set<number>();
      while (pId !== null && pId !== undefined && !visited.has(pId)) {
        visited.add(pId);
        if (collapsed.has(pId)) return true;
        const parent = byId.get(pId);
        if (!parent) break;
        pId = parent.parentId;
      }
      return false;
    },
    []
  );

  // Visible rows respecting search and collapse state
  const visibleRows = useMemo(() => {
    if (search.trim()) {
      const term = search.toLowerCase();
      return rows.filter(
        (row) =>
          row.name.toLowerCase().includes(term) ||
          row.path.toLowerCase().includes(term) ||
          row.slug.toLowerCase().includes(term)
      );
    }
    return rows.filter((row) => !isHiddenByAncestor(row, collapsedCategories, rowsById));
  }, [rows, search, collapsedCategories, rowsById, isHiddenByAncestor]);

  // Statistics
  const totalCategories = rows.length;
  const rootCount = rows.filter((r) => r.depth === 0).length;
  const subCount = rows.filter((r) => r.depth > 0).length;
  const leafCount = rows.filter((r) => r.isLeaf).length;

  // Selected Category's direct children
  const directChildren = useMemo(() => {
    if (!selected) return [];
    return rows.filter((r) => r.parentId === selected.id);
  }, [selected, rows]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderTree className="size-6 text-primary" />
            Categories & Taxonomy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize store hierarchy, configure attribute inheritance, and classify product departments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setDialog({})}
            className="gap-1.5 h-9 bg-primary font-semibold shadow-xs text-xs"
          >
            <Plus className="size-3.5" />
            New Category
          </Button>
        </div>
      </div>

      {/* ── Taxonomy Metrics Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FolderTree className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Categories</p>
              <p className="text-xl font-bold text-foreground">{totalCategories}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Folder className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Root Departments</p>
              <p className="text-xl font-bold text-foreground">{rootCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Subcategories</p>
              <p className="text-xl font-bold text-foreground">{subCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Product Leaves</p>
              <p className="text-xl font-bold text-foreground">{leafCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActionNotice action={action} />

      {query.isLoading ? (
        <LoadingPanel />
      ) : query.isError ? (
        <ErrorPanel error={query.error} retry={query.refetch} />
      ) : !rows.length ? (
        <EmptyPanel
          title="Create your first category"
          description="Start with a top-level department like Electronics or Clothing, then add subcategories to build your catalog."
          action={
            <Button onClick={() => setDialog({})} className="gap-1.5">
              <Plus className="size-3.5" />
              New category
            </Button>
          }
        />
      ) : (
        /* ── Main Two-Column Taxonomy Workspace ── */
        <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr]">
          {/* Left Column: Visual Tree Navigation */}
          <aside className="overflow-hidden rounded-2xl border bg-card shadow-none">
            {/* Search and Tree Controls */}
            <div className="border-b p-3.5 space-y-2.5 bg-muted/20">
              <div className="relative">
                <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  aria-label="Search categories"
                  placeholder="Search taxonomy..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-xs h-8 bg-background"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                <span>{visibleRows.length} visible categories</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-2"
                  >
                    Expand all
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-2"
                  >
                    Collapse all
                  </button>
                </div>
              </div>
            </div>

            {/* Tree Nodes List */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-2 space-y-1">
              {visibleRows.map((row) => {
                const isSelected = selected?.id === row.id;
                const hasChildren = !row.isLeaf;
                const isCollapsed = collapsedCategories.has(row.id);
                const indentClass =
                  row.depth === 0
                    ? ""
                    : row.depth === 1
                    ? "ml-4 border-l pl-2"
                    : row.depth === 2
                    ? "ml-7 border-l pl-2"
                    : "ml-10 border-l pl-2";

                return (
                  <div key={row.id} className={indentClass}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (selected?.id !== row.id && leave()) {
                          setSelectedId(row.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === " ") &&
                          selected?.id !== row.id &&
                          leave()
                        ) {
                          setSelectedId(row.id);
                        }
                      }}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-xl p-2 text-left text-xs transition-colors cursor-pointer select-none",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold shadow-2xs"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      {/* Expand / Collapse Chevron for Parent Categories */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={(e) => toggleCollapse(row.id, e)}
                          className="p-1 rounded hover:bg-muted-foreground/15 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                          title={isCollapsed ? "Expand category" : "Collapse category"}
                          aria-label={isCollapsed ? `Expand ${row.name}` : `Collapse ${row.name}`}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="size-3.5 shrink-0 ml-1.5 flex items-center justify-center">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}

                      {/* Folder Icon */}
                      {hasChildren ? (
                        isSelected ? (
                          <FolderOpen className="size-4 shrink-0 text-primary" />
                        ) : (
                          <Folder className="size-4 shrink-0 text-muted-foreground" />
                        )
                      ) : (
                        <Folder className="size-4 shrink-0 text-muted-foreground/80" />
                      )}

                      {/* Name & Slug */}
                      <div className="min-w-0 flex-1">
                        <span className="truncate block font-medium">
                          {row.name}
                        </span>
                      </div>

                      {/* Leaf or Child Count Badge */}
                      {hasChildren ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium shrink-0">
                          Group
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 font-semibold shrink-0">
                          Leaf
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {!visibleRows.length && (
                <p className="p-6 text-center text-xs text-muted-foreground">
                  {search.trim()
                    ? `No matching categories found for "${search}".`
                    : "No categories visible."}
                </p>
              )}
            </div>
          </aside>

          {/* Right Column: Selected Category Details Workspace */}
          {selected && (
            <section className="space-y-6">
              {/* Category Header Card */}
              <Card className="border shadow-none">
                <CardHeader className="p-5 border-b pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative size-16 rounded-xl overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                        {selected.image ? (
                          <img
                            src={mediaUrl(selected.image)}
                            alt={selected.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Folder className="size-7 text-muted-foreground" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground font-medium">
                            {selected.path}
                          </span>
                          <StatusBadge active={selected.isActive} />
                          {selected.isLeaf ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                            >
                              Leaf (Product Ready)
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Parent Group ({directChildren.length} children)
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
                          {selected.name}
                        </h2>

                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono bg-muted px-2 py-0.5 rounded text-[11px]">
                            /{selected.slug}
                          </span>
                          {selected.description && (
                            <span className="line-clamp-1 max-w-md">
                              · {selected.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                      <Link
                        href={`/category/${selected.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          title="View category page on live storefront"
                        >
                          <ExternalLink className="size-3.5" />
                          <span>View on Store</span>
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDialog({ category: selected })}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Pencil className="size-3.5" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDialog({ parentId: selected.id })}
                        className="h-8 gap-1.5 text-xs bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                      >
                        <Plus className="size-3.5" />
                        <span>Add Subcategory</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMigratingCategory(selected)}
                        className="h-8 gap-1.5 text-xs text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                        title="Transfer products from this category to another subcategory"
                      >
                        <ArrowRightLeft className="size-3.5" />
                        <span>Migrate Products</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={action.busy}
                        onClick={() =>
                          void action.run(
                            () =>
                              status({
                                id: selected.id,
                                isActive: !selected.isActive,
                              }).unwrap(),
                            "Category status saved."
                          )
                        }
                        className="h-8 text-xs"
                      >
                        {selected.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Delete ${selected.name}`}
                        onClick={() => {
                          if (
                            !dirty ||
                            window.confirm(
                              "This category has unsaved assignments. Continue to delete?"
                            )
                          ) {
                            setDeleting(selected);
                          }
                        }}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Media Uploader Mini Bar */}
                <CardContent className="p-4 bg-muted/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-4 text-primary" />
                    <span>
                      Upload a category icon/banner to showcase in storefront Bento Grid and Circle carousels.
                    </span>
                  </div>
                  <CatalogMedia
                    kind="category"
                    key={selected.id}
                    name={selected.name}
                    url={selected.image}
                    onUpload={(file) =>
                      upload({ id: selected.id, file }).unwrap()
                    }
                  />
                </CardContent>
              </Card>

              {/* ── Tabs Workspace: Attributes vs Subcategories ── */}
              <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl border">
                    <button
                      type="button"
                      onClick={() => setActiveTab("attributes")}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                        activeTab === "attributes"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Layers className="size-3.5 text-primary" />
                      <span>Variant Attributes & Inheritance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("subcategories")}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                        activeTab === "subcategories"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FolderTree className="size-3.5 text-primary" />
                      <span>Child Subcategories</span>
                      <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                        {directChildren.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Variant Attributes Assignment with Inheritance */}
                {activeTab === "attributes" && (
                  <Card className="border shadow-none w-full">
                    <CardContent className="p-6">
                      <CategoryAssignments
                        key={selected.id}
                        id={selected.id}
                        enabled={selected.isActive}
                        onDirty={setDirty}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Tab 2: Child Subcategories Grid */}
                {activeTab === "subcategories" && (
                  <Card className="border shadow-none w-full">
                    <CardHeader className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold">
                            Direct Children of {selected.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Subcategories inherit all variant attributes assigned to this category.
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setDialog({ parentId: selected.id })}
                          className="h-8 gap-1.5 text-xs bg-primary font-semibold shadow-xs"
                        >
                          <Plus className="size-3.5" />
                          Add Subcategory
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      {directChildren.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {directChildren.map((child) => (
                            <div
                              key={child.id}
                              className="rounded-xl border bg-card p-3.5 flex items-center justify-between hover:border-primary/40 transition-colors group"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <Folder className="size-3.5 text-primary shrink-0" />
                                  <h4 className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors">
                                    {child.name}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                  /{child.slug}
                                </p>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (leave()) setSelectedId(child.id);
                                }}
                                className="h-7 text-[11px] px-2.5 gap-1 shrink-0"
                              >
                                Select
                                <ArrowRight className="size-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 border border-dashed rounded-xl space-y-2">
                          <CheckCircle2 className="size-8 mx-auto text-emerald-600" />
                          <h4 className="text-sm font-semibold text-foreground">
                            This is currently a Leaf Category
                          </h4>
                          <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Products can be assigned here directly. If you want to turn this into a group with sub-branches, click &quot;Add Subcategory&quot; above.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Dialogs ── */}
      {dialog && (
        <RecordDialog
          title={dialog.category ? "Edit category" : "New category"}
          description="Build your catalog taxonomy. If the selected parent already has products, you can enable auto-migration so products always live in leaf categories."
          creating={!dialog.category}
          media={
            dialog.category ? (
              <CatalogMedia
                kind="category"
                name={dialog.category.name}
                url={
                  (
                    rows.find((row) => row.id === dialog.category?.id) ??
                    dialog.category
                  ).image
                }
                onUpload={(file) =>
                  upload({ id: dialog.category!.id, file }).unwrap()
                }
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Save the new category first. Then upload an image in its details panel.
              </p>
            )
          }
          initial={
            dialog.category
              ? {
                  ...dialog.category,
                  description: dialog.category.description ?? "",
                }
              : { parentId: dialog.parentId ?? null, migrateParentProducts: true }
          }
          parents={eligibleParents(rows, dialog.category?.id)}
          onClose={() => setDialog(undefined)}
          onSave={async (form) => {
            if (dialog.category) {
              await update({ id: dialog.category.id, body: form }).unwrap();
            } else {
              const result = await create(form).unwrap();
              if (!dirty) setSelectedId(result.data.id);
            }
          }}
        />
      )}

      {/* Delete Category Dialog */}
      {deleting && (
        <DeleteDialog
          name={deleting.name}
          explanation="Move its children and product references first before deleting."
          onClose={() => setDeleting(undefined)}
          onDelete={async () => {
            await remove(deleting.id).unwrap();
            setDirty(false);
          }}
        />
      )}

      {/* Manual Product Migration Dialog */}
      {migratingCategory && (
        <MigrateProductsDialog
          category={migratingCategory}
          categories={rows}
          onClose={() => setMigratingCategory(null)}
          onSuccess={() => {
            query.refetch();
          }}
        />
      )}
    </div>
  );
}
