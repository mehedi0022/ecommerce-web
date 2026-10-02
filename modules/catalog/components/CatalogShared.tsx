"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, CircleAlert, FolderTree, ImagePlus, LoaderCircle, Tags, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApiErrorMessage, getApiValidationDetails } from "@/lib/api/api-error";
import { mediaUrl } from "../catalog.utils";

export const selectStyle = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50";
export function CatalogHeader({ active, title, description, action }: { active: "categories" | "brands" | "attributes"; title: string; description: string; action?: ReactNode }) {
  return <header className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Catalog setup</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>{action}</div><nav aria-label="Catalog setup" className="flex gap-1 overflow-x-auto border-b">{[{ id: "categories", label: "Categories", href: "/admin/catalog/categories", icon: FolderTree }, { id: "brands", label: "Brands", href: "/admin/brands", icon: Tags }, { id: "attributes", label: "Attributes & values", href: "/admin/attributes", icon: Tags }].map(item => <Link key={item.id} href={item.href} aria-current={active === item.id ? "page" : undefined} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${active === item.id ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><item.icon className="size-4"/>{item.label}</Link>)}</nav></header>;
}
export function StatusBadge({ active }: { active: boolean }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${active ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-muted-foreground/50"}`}/>{active ? "Active" : "Inactive"}</span>; }
export function LoadingPanel() { return <div role="status" className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border bg-card text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin"/>Loading catalog…</div>; }
export function ErrorPanel({ error, retry }: { error: unknown; retry?: () => void }) { return <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm"><CircleAlert className="size-4 shrink-0 text-destructive"/><p className="flex-1">{getApiErrorMessage(error, error instanceof Error ? error.message : "Something went wrong. Please try again.")}</p>{retry && <Button variant="outline" onClick={retry}>Try again</Button>}</div>; }
export function EmptyPanel({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center"><FolderTree className="mx-auto mb-4 size-8 text-muted-foreground/40"/><h2 className="font-semibold">{title}</h2><p className="mx-auto mb-5 mt-2 max-w-md text-sm text-muted-foreground">{description}</p>{action}</div>; }
export function useCatalogAction() {
  const lock = useRef(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(); const [message, setMessage] = useState("");
  async function run(action: () => Promise<unknown>, success: string) {
    if (lock.current) return false; lock.current = true; setBusy(true); setError(undefined); setMessage("");
    try { await action(); setMessage(success); return true; } catch (error) { setError(error); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  return { busy, error, message, run };
}
export function ActionNotice({ action }: { action: ReturnType<typeof useCatalogAction> }) { return action.error ? <ErrorPanel error={action.error}/> : action.message ? <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-2 text-sm"><Check className="size-4 text-emerald-600"/>{action.message}</p> : null; }
export function useUnsavedCatalog(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => event.preventDefault();
    const guard = (event: MouseEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.target === "_blank" || anchor.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm("Leave without saving your attribute assignments?")) { event.preventDefault(); event.stopPropagation(); }
      else window.removeEventListener("beforeunload", unload);
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", guard, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", guard, true); };
  }, [dirty]);
}
export interface RecordFields { name: string; description: string; sortOrder: number; parentId: number | null }
export function RecordDialog({ title, label = "Name", description, initial, parents, showDescription = true, creating = false, onSave, onClose }: { title: string; label?: string; description: string; initial?: Partial<RecordFields>; parents?: { id: number; path?: string; name: string }[]; showDescription?: boolean; creating?: boolean; onSave: (form: RecordFields) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<RecordFields>({ name: initial?.name ?? "", description: initial?.description ?? "", sortOrder: initial?.sortOrder ?? 0, parentId: initial?.parentId ?? null });
  const [uncertain, setUncertain] = useState(false); const action = useCatalogAction();
  const save = async () => {
    if (!form.name.trim()) return;
    const saved = await action.run(async () => { try { await onSave({ ...form, name: form.name.trim(), description: form.description.trim() }); } catch (error) { const status = (error as { status?: number | string }).status; if (creating && (typeof status === "string" || typeof status === "number" && status >= 500)) setUncertain(true); throw error; } }, "Saved");
    if (saved) onClose();
  };
  return <Dialog open onOpenChange={open => { if (!open && !action.busy) onClose(); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton={!action.busy}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><form onSubmit={event => { event.preventDefault(); void save(); }} className="space-y-5"><fieldset disabled={action.busy || uncertain} className="space-y-4"><label className="block space-y-1.5 text-sm font-medium">{label}<Input autoFocus required maxLength={150} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={label === "Value" ? "e.g. Medium" : "e.g. Everyday essentials"}/></label>{parents && <label className="block space-y-1.5 text-sm font-medium">Parent category<select className={selectStyle} value={form.parentId ?? ""} onChange={e => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}><option value="">None — top-level category</option>{parents.map(parent => <option key={parent.id} value={parent.id}>{parent.path ?? parent.name}</option>)}</select><span className="block text-xs font-normal text-muted-foreground">Self and descendant categories cannot be selected.</span></label>}{showDescription && <label className="block space-y-1.5 text-sm font-medium">Description <span className="font-normal text-muted-foreground">(optional)</span><Textarea maxLength={1000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label>}<label className="block space-y-1.5 text-sm font-medium">Display order<Input required type="number" min={0} step={1} value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })}/><span className="block text-xs font-normal text-muted-foreground">Lower numbers appear first.</span></label></fieldset><ActionNotice action={action}/>{action.error ? <p className="text-xs text-destructive">{getApiValidationDetails(action.error).map(item => item.message).join(" ")}</p> : null}{uncertain && <p role="alert" className="text-sm text-amber-700">The create request could not be confirmed. Close and refresh the list before creating another record.</p>}<DialogFooter><Button type="button" variant="outline" disabled={action.busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={action.busy || uncertain}>{action.busy && <LoaderCircle className="animate-spin"/>}{action.busy ? "Saving…" : "Save"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
export function DeleteDialog({ name, explanation, onDelete, onClose }: { name: string; explanation: string; onDelete: () => Promise<unknown>; onClose: () => void }) {
  const action = useCatalogAction();
  return <Dialog open onOpenChange={open => { if (!open && !action.busy) onClose(); }}><DialogContent showCloseButton={!action.busy}><DialogHeader><DialogTitle>Delete {name}?</DialogTitle><DialogDescription>{explanation} This cannot be undone.</DialogDescription></DialogHeader><ActionNotice action={action}/><DialogFooter><Button variant="outline" disabled={action.busy} onClick={onClose}>Cancel</Button><Button variant="destructive" disabled={action.busy} onClick={async () => { if (await action.run(onDelete, "Deleted")) onClose(); }}>{action.busy ? "Deleting…" : "Delete"}</Button></DialogFooter></DialogContent></Dialog>;
}
export function CatalogMedia({ url, name, onUpload }: { url?: string | null; name: string; onUpload: (file: File) => Promise<unknown> }) {
  const action = useCatalogAction(); const src = mediaUrl(url);
  return <div className="space-y-3"><div className="flex items-center gap-4"><div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/30">{src ? <Image unoptimized src={src} alt={name} fill sizes="80px" className="object-contain p-2"/> : <ImagePlus className="size-6 text-muted-foreground/40"/>}</div><label className="relative cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-ring"><span className="flex items-center gap-2">{action.busy ? <LoaderCircle className="size-4 animate-spin"/> : <Upload className="size-4"/>}{action.busy ? "Uploading…" : src ? "Replace image" : "Upload image"}</span><input aria-label={`Upload image for ${name}`} disabled={action.busy} type="file" accept="image/png,image/jpeg,image/webp" className="absolute inset-0 w-full cursor-pointer opacity-0" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void action.run(() => onUpload(file), "Image saved."); }}/></label></div><p className="text-xs text-muted-foreground">JPG, PNG or WebP. Image changes are saved immediately.</p><ActionNotice action={action}/></div>;
}
export function SetupHint({ children }: { children: ReactNode }) { return <div className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4 text-sm leading-relaxed"><ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground"/><div>{children}</div></div>; }
