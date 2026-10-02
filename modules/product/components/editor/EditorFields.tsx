"use client";

import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

export const selectClass = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({ label, name, error, hint, children, optional }: { label: string; name: string; error?: string; hint?: string; children: ReactNode; optional?: boolean }) {
  return <div className="space-y-1.5" data-field={name}>
    <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium">{label}{optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}</label>
    {children}
    {error ? <p id={`${name}-error`} className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
  </div>;
}

export function Section({ id, number, title, description, action, children }: { id: string; number: string; title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return <section id={id} data-field={id} tabIndex={-1} className="scroll-mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
      <div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{number}</span><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></div>{action}
    </header><div className="space-y-5 p-5 sm:p-6">{children}</div>
  </section>;
}

export function ChecklistItem({ complete, children }: { complete: boolean; children: ReactNode }) {
  return <li className="flex items-center gap-2.5 text-sm">{complete ? <CircleCheck className="size-4 shrink-0 text-emerald-600" /> : <span className="mx-0.5 size-3 shrink-0 rounded-full border-2 border-muted-foreground/30" />}<span className={complete ? "text-foreground" : "text-muted-foreground"}>{children}</span></li>;
}
