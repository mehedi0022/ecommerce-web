"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryAttribute } from "@/modules/attribute/types";
import { useCatalogAttributesQuery, useCategoryAssignmentsQuery, useReplaceCategoryAssignmentsMutation } from "../catalogApi";
import { ActionNotice, ErrorPanel, LoadingPanel, selectStyle, useCatalogAction, useUnsavedCatalog } from "./CatalogShared";

export function CategoryAssignments({ id, enabled, onDirty }: { id: number; enabled: boolean; onDirty: (dirty: boolean) => void }) {
  const assignments = useCategoryAssignmentsQuery(id); const attributes = useCatalogAttributesQuery();
  if (assignments.isLoading || attributes.isLoading) return <LoadingPanel/>;
  if (assignments.isError || attributes.isError) return <ErrorPanel error={assignments.error ?? attributes.error} retry={() => { void assignments.refetch(); void attributes.refetch(); }}/>;
  return <AssignmentForm id={id} initial={assignments.data?.data ?? []} attributes={attributes.data ?? []} enabled={enabled} onDirty={onDirty}/>;
}
function AssignmentForm({ id, initial, attributes, enabled, onDirty }: { id: number; initial: CategoryAttribute[]; attributes: import("@/modules/attribute/types").Attribute[]; enabled: boolean; onDirty: (dirty: boolean) => void }) {
  const [rows, setRows] = useState(initial); const [baseline, setBaseline] = useState(JSON.stringify(initial.map(({ attributeId, isRequired, sortOrder }) => ({ attributeId, isRequired, sortOrder }))));
  const [choice, setChoice] = useState(""); const [save] = useReplaceCategoryAssignmentsMutation(); const action = useCatalogAction();
  const signature = (items: CategoryAttribute[]) => JSON.stringify(items.map(({ attributeId, isRequired, sortOrder }) => ({ attributeId, isRequired, sortOrder })));
  const dirty = signature(rows) !== baseline; useUnsavedCatalog(dirty);
  function change(next: CategoryAttribute[]) { const ordered = next.map((row, sortOrder) => ({ ...row, sortOrder })); setRows(ordered); onDirty(signature(ordered) !== baseline); }
  const available = attributes.filter(a => a.isActive && !rows.some(row => row.attributeId === a.id));
  return <section className="space-y-4"><div><h3 className="font-semibold">Category attributes</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Assign reusable options for product variants. All active values are available; parent attributes are not inherited.</p></div>
    {!enabled && <p className="rounded-lg bg-amber-500/10 p-3 text-sm">Attributes can be assigned to active leaf categories. Existing assignments can be cleared here.</p>}
    <fieldset disabled={action.busy} className="space-y-4">
      {enabled && <div className="flex gap-2"><select aria-label="Attribute to assign" className={selectStyle} value={choice} onChange={e => setChoice(e.target.value)}><option value="">Choose an attribute…</option>{available.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select><Button variant="outline" disabled={!choice} onClick={() => { change([...rows, { attributeId: Number(choice), isRequired: false, sortOrder: rows.length }]); setChoice(""); }}><Plus/>Assign</Button></div>}
      {!rows.length && <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No attributes assigned. Products can use a standard variant, or you can assign options such as Size and Color.</div>}
      {rows.map((row, index) => { const attribute = attributes.find(a => a.id === row.attributeId) ?? row.attribute; return <div key={row.attributeId} className="space-y-3 rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><span className="font-medium">{attribute?.name ?? `Attribute ${row.attributeId}`}</span>{attribute && !attribute.isActive && <span className="ml-2 text-xs text-amber-700">Inactive</span>}</div><div className="flex items-center gap-1"><label className="mr-2 flex items-center gap-2 text-xs"><input type="checkbox" disabled={!enabled} checked={row.isRequired} onChange={e => change(rows.map(item => item.attributeId === row.attributeId ? { ...item, isRequired: e.target.checked } : item))}/>Required</label>{[-1, 1].map(direction => <Button key={direction} variant="ghost" size="icon-sm" disabled={!enabled || index + direction < 0 || index + direction >= rows.length} aria-label={`Move ${attribute?.name} ${direction < 0 ? "up" : "down"}`} onClick={() => { const next = [...rows]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; change(next); }}>{direction < 0 ? <ArrowUp/> : <ArrowDown/>}</Button>)}<Button size="icon-sm" variant="ghost" aria-label={`Unassign ${attribute?.name}`} onClick={() => change(rows.filter(item => item.attributeId !== row.attributeId))}><X/></Button></div></div><div className="flex flex-wrap gap-1.5">{attribute?.values?.filter(value => value.isActive).map(value => <span key={value.id} className="rounded-md bg-muted px-2 py-1 text-xs">{value.value}</span>)}{!attribute?.values?.some(value => value.isActive) && <span className="text-xs text-amber-700">No active values. Add values before making this required.</span>}</div><Link href={`/admin/attributes?attribute=${row.attributeId}`} className="text-xs font-medium text-primary underline">Manage values →</Link></div>; })}
    </fieldset>
    <ActionNotice action={action}/><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><Link href="/admin/attributes" className="text-sm text-primary underline">Create attributes & values</Link><div className="flex gap-2"><Button variant="outline" disabled={!dirty || action.busy} onClick={() => { setRows(JSON.parse(baseline) as CategoryAttribute[]); onDirty(false); }}>Discard changes</Button><Button disabled={!dirty || action.busy || (!enabled && rows.length > 0)} onClick={async () => { if (await action.run(() => save({ id, attributes: rows }).unwrap(), "Category attributes saved.")) { setBaseline(signature(rows)); onDirty(false); } }}>{action.busy ? "Saving…" : "Save assignments"}</Button></div></div><p className="text-xs text-muted-foreground">Required options must be selected on every variant. For categories with existing products, assign new options as optional first.</p>
  </section>;
}
