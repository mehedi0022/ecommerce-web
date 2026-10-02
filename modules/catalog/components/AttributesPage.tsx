"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Attribute, AttributeValue } from "@/modules/attribute/types";
import { useCatalogAttributesQuery, useCreateCatalogAttributeMutation, useUpdateCatalogAttributeMutation, useDeleteCatalogAttributeMutation, useSetCatalogAttributeStatusMutation, useCreateCatalogValueMutation, useUpdateCatalogValueMutation, useDeleteCatalogValueMutation } from "../catalogApi";
import { CatalogHeader, RecordDialog, DeleteDialog, StatusBadge, LoadingPanel, ErrorPanel, EmptyPanel, ActionNotice, useCatalogAction, SetupHint } from "./CatalogShared";

export function AttributesPage({ initialId }: { initialId?: number }) {
  const query = useCatalogAttributesQuery();
  const [selectedId, setSelectedId] = useState(initialId);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ kind: "attribute" | "value"; attribute?: Attribute; value?: AttributeValue }>();
  const [deleting, setDeleting] = useState<{ attribute: Attribute; value?: AttributeValue }>();
  const [createAttribute] = useCreateCatalogAttributeMutation(); const [updateAttribute] = useUpdateCatalogAttributeMutation();
  const [deleteAttribute] = useDeleteCatalogAttributeMutation(); const [status] = useSetCatalogAttributeStatusMutation();
  const [createValue] = useCreateCatalogValueMutation(); const [updateValue] = useUpdateCatalogValueMutation(); const [deleteValue] = useDeleteCatalogValueMutation();
  const action = useCatalogAction();
  const selected = query.data?.find(row => row.id === selectedId) ?? query.data?.[0];
  const rows = query.data?.filter(row => `${row.name} ${row.values?.map(v => v.value).join(" ")}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <div className="space-y-6">
    <CatalogHeader active="attributes" title="Attributes & values" description="Create reusable product options, add their values, then assign them to a leaf category." action={<Button onClick={() => setDialog({ kind: "attribute" })}><Plus/>New attribute</Button>}/>
    <SetupHint>For example: create <strong>Size</strong>, add <strong>Small, Medium, Large</strong>, then assign Size in <Link className="font-medium underline" href="/admin/catalog/categories">Categories → Attributes</Link>. Values are shared across every category using that attribute.</SetupHint>
    <ActionNotice action={action}/>
    {query.isLoading ? <LoadingPanel/> : query.isError ? <ErrorPanel error={query.error} retry={query.refetch}/> : <div className="grid items-start gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="overflow-hidden rounded-2xl border bg-card"><div className="border-b p-4"><Input aria-label="Search attributes" placeholder="Search attributes or values…" value={search} onChange={e => setSearch(e.target.value)}/><p className="mt-3 text-xs text-muted-foreground">{rows.length} attributes</p></div><div className="max-h-[65vh] overflow-y-auto p-2">{rows.map(row => <button key={row.id} onClick={() => setSelectedId(row.id)} aria-pressed={selected?.id === row.id} className={`flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left ${selected?.id === row.id ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted"}`}><span><span className="block text-sm font-semibold">{row.name}</span><span className="text-xs text-muted-foreground">{row.values?.filter(v => v.isActive).length ?? 0} active values</span></span><StatusBadge active={row.isActive}/></button>)}{!rows.length && <p className="p-5 text-sm text-muted-foreground">No matching attributes.</p>}</div></aside>
      {selected ? <section className="overflow-hidden rounded-2xl border bg-card"><div className="flex flex-wrap items-center justify-between gap-4 border-b p-5"><div><h2 className="text-xl font-semibold">{selected.name}</h2><p className="mt-1 text-xs text-muted-foreground">Display order {selected.sortOrder ?? 0} · {selected.values?.length ?? 0} values</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setDialog({ kind: "attribute", attribute: selected })}><Pencil/>Edit</Button><Button size="sm" variant="outline" disabled={action.busy} onClick={() => void action.run(() => status({ id: selected.id, isActive: !selected.isActive }).unwrap(), "Attribute status saved.")}>{selected.isActive ? "Deactivate" : "Activate"}</Button><Button size="icon-sm" variant="ghost" aria-label={`Delete ${selected.name}`} onClick={() => setDeleting({ attribute: selected })}><Trash2/></Button></div></div>
        <div className="space-y-4 p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Allowed values</h3><p className="mt-1 text-xs text-muted-foreground">Active values appear in the product variant editor.</p></div><Button size="sm" onClick={() => setDialog({ kind: "value", attribute: selected })}><Plus/>Add value</Button></div>
          {!selected.values?.length ? <EmptyPanel title="Add the first value" description="Give admins clear options to choose from, such as Small or Blue."/> : <ul className="divide-y rounded-xl border">{selected.values.map(value => <li key={value.id} className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{value.sortOrder ?? 0}</span><span className="text-sm font-medium">{value.value}</span><StatusBadge active={value.isActive}/></div><div className="flex gap-1"><Button size="sm" variant="ghost" disabled={action.busy} onClick={() => void action.run(() => updateValue({ attributeId: selected.id, id: value.id, isActive: !value.isActive }).unwrap(), "Value status saved.")}>{value.isActive ? "Deactivate" : "Activate"}</Button><Button size="icon-sm" variant="ghost" aria-label={`Edit ${value.value}`} onClick={() => setDialog({ kind: "value", attribute: selected, value })}><Pencil/></Button><Button size="icon-sm" variant="ghost" aria-label={`Delete ${value.value}`} onClick={() => setDeleting({ attribute: selected, value })}><Trash2/></Button></div></li>)}</ul>}
          <p className="text-xs leading-relaxed text-muted-foreground">Changes apply everywhere this attribute is used. Values referenced by variants or images cannot be deleted or deactivated.</p>
        </div></section> : <EmptyPanel title="Start with an attribute" description="Create Size, Color, Material or another option your products need."/>}
    </div>}
    {dialog && <RecordDialog title={dialog.kind === "attribute" ? dialog.attribute ? "Edit attribute" : "New attribute" : dialog.value ? "Edit value" : `Add value to ${dialog.attribute?.name}`} label={dialog.kind === "value" ? "Value" : "Name"} description="Choose a clear name and display order. Changes are shared across the catalog." showDescription={false} creating={dialog.kind === "attribute" ? !dialog.attribute : !dialog.value} initial={{ name: dialog.kind === "value" ? dialog.value?.value : dialog.attribute?.name, sortOrder: dialog.kind === "value" ? dialog.value?.sortOrder : dialog.attribute?.sortOrder }} onClose={() => setDialog(undefined)} onSave={async form => {
      if (dialog.kind === "attribute") { if (dialog.attribute) await updateAttribute({ id: dialog.attribute.id, name: form.name, sortOrder: form.sortOrder }).unwrap(); else { const result = await createAttribute({ name: form.name, sortOrder: form.sortOrder }).unwrap(); setSelectedId(result.data.id); } }
      else if (dialog.attribute) { const body = { attributeId: dialog.attribute.id, value: form.name, sortOrder: form.sortOrder }; if (dialog.value) await updateValue({ ...body, id: dialog.value.id }).unwrap(); else await createValue(body).unwrap(); }
    }}/>}
    {deleting && <DeleteDialog name={deleting.value?.value ?? deleting.attribute.name} explanation="Records used by categories, variants or images must be unassigned first." onClose={() => setDeleting(undefined)} onDelete={() => deleting.value ? deleteValue({ attributeId: deleting.attribute.id, id: deleting.value.id }).unwrap() : deleteAttribute(deleting.attribute.id).unwrap()}/>}
  </div>;
}
