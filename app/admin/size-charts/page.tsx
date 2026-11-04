"use client";

import { useState } from "react";
import {
  Ruler,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  X,
  Sparkles,
  Info,
  Loader2,
  Table as TableIcon,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useListSizeChartsQuery,
  useCreateSizeChartMutation,
  useUpdateSizeChartMutation,
  useDeleteSizeChartMutation,
} from "@/modules/size-chart/sizeChartApi";
import type { SizeChart, CreateSizeChartInput } from "@/modules/size-chart/types";
import { getApiErrorMessage } from "@/lib/api/api-error";

// ─── Preset Templates ──────────────────────────────────────────────────────────

const PRESETS = [
  {
    name: "T-Shirt / Polo Standard",
    unit: "inches",
    columns: ["Size", "Chest", "Length", "Sleeve"],
    rows: [
      { Size: "S", Chest: "36-38", Length: "27", Sleeve: "8" },
      { Size: "M", Chest: "38-40", Length: "28", Sleeve: "8.5" },
      { Size: "L", Chest: "40-42", Length: "29", Sleeve: "9" },
      { Size: "XL", Chest: "42-44", Length: "30", Sleeve: "9.5" },
      { Size: "XXL", Chest: "44-46", Length: "31", Sleeve: "10" },
    ],
    tips: "Chest: Measure around the fullest part of the chest under the armpits. Length: Measure from the highest point of the shoulder down to the hem.",
  },
  {
    name: "Panjabi / Kurti",
    unit: "inches",
    columns: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      { Size: "38 (S)", Chest: "40", Length: "40", Shoulder: "17.5", Sleeve: "24.5" },
      { Size: "40 (M)", Chest: "42", Length: "42", Shoulder: "18.5", Sleeve: "25" },
      { Size: "42 (L)", Chest: "44", Length: "44", Shoulder: "19.5", Sleeve: "25.5" },
      { Size: "44 (XL)", Chest: "46", Length: "46", Shoulder: "20.5", Sleeve: "26" },
      { Size: "46 (XXL)", Chest: "48", Length: "48", Shoulder: "21.5", Sleeve: "26.5" },
    ],
    tips: "Chest: 3 to 4 inches loose fit added over actual body chest measurement. Length: Measured from high point shoulder to lower hem.",
  },
  {
    name: "Pants & Trousers",
    unit: "inches",
    columns: ["Size", "Waist", "Hip", "Length", "Thigh"],
    rows: [
      { Size: "30", Waist: "30-31", Hip: "38", Length: "39", Thigh: "23" },
      { Size: "32", Waist: "32-33", Hip: "40", Length: "40", Thigh: "24" },
      { Size: "34", Waist: "34-35", Hip: "42", Length: "41", Thigh: "25" },
      { Size: "36", Waist: "36-37", Hip: "44", Length: "42", Thigh: "26" },
      { Size: "38", Waist: "38-39", Hip: "46", Length: "42.5", Thigh: "27" },
    ],
    tips: "Waist: Measure around natural waistline where waistband sits. Length: Measured along outer seam from waistband to ankle.",
  },
  {
    name: "Footwear / Shoes",
    unit: "cm",
    columns: ["EU Size", "US Size", "UK Size", "Foot Length (cm)"],
    rows: [
      { "EU Size": "39", "US Size": "6.5", "UK Size": "6", "Foot Length (cm)": "24.5" },
      { "EU Size": "40", "US Size": "7.5", "UK Size": "7", "Foot Length (cm)": "25.0" },
      { "EU Size": "41", "US Size": "8.0", "UK Size": "7.5", "Foot Length (cm)": "26.0" },
      { "EU Size": "42", "US Size": "8.5", "UK Size": "8", "Foot Length (cm)": "26.5" },
      { "EU Size": "43", "US Size": "9.5", "UK Size": "9", "Foot Length (cm)": "27.5" },
      { "EU Size": "44", "US Size": "10.0", "UK Size": "9.5", "Foot Length (cm)": "28.0" },
    ],
    tips: "Place foot flat on a sheet of paper, mark heel and longest toe, and measure the distance in centimeters.",
  },
];

export default function AdminSizeChartsPage() {
  const { data, isLoading, refetch } = useListSizeChartsQuery();
  const sizeCharts = data?.data || [];

  const [createSizeChart, { isLoading: isCreating }] = useCreateSizeChartMutation();
  const [updateSizeChart, { isLoading: isUpdating }] = useUpdateSizeChartMutation();
  const [deleteSizeChart, { isLoading: isDeleting }] = useDeleteSizeChartMutation();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewChart, setPreviewChart] = useState<SizeChart | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateSizeChartInput>({
    name: "",
    description: "",
    unit: "inches",
    columns: ["Size", "Chest", "Length", "Sleeve"],
    rows: [
      { Size: "S", Chest: "38", Length: "27", Sleeve: "8" },
      { Size: "M", Chest: "40", Length: "28", Sleeve: "8.5" },
      { Size: "L", Chest: "42", Length: "29", Sleeve: "9" },
      { Size: "XL", Chest: "44", Length: "30", Sleeve: "9.5" },
    ],
    tips: "",
  });

  const [newColumnName, setNewColumnName] = useState("");

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      unit: "inches",
      columns: ["Size", "Chest", "Length", "Sleeve"],
      rows: [
        { Size: "S", Chest: "38", Length: "27", Sleeve: "8" },
        { Size: "M", Chest: "40", Length: "28", Sleeve: "8.5" },
        { Size: "L", Chest: "42", Length: "29", Sleeve: "9" },
        { Size: "XL", Chest: "44", Length: "30", Sleeve: "9.5" },
      ],
      tips: "Measure around fullest part of chest and from shoulder to bottom hem.",
    });
    setNewColumnName("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (chart: SizeChart) => {
    setEditingId(chart.id);
    setFormData({
      name: chart.name,
      description: chart.description || "",
      unit: chart.unit || "inches",
      columns: chart.columns.length ? chart.columns : ["Size"],
      rows: chart.rows.length ? chart.rows : [{ Size: "Standard" }],
      tips: chart.tips || "",
    });
    setNewColumnName("");
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormData({
      name: preset.name,
      description: `Standard size chart for ${preset.name.toLowerCase()}`,
      unit: preset.unit,
      columns: [...preset.columns],
      rows: preset.rows.map((r) => ({ ...r })),
      tips: preset.tips,
    });
    toast.success(`Preset "${preset.name}" loaded!`);
  };

  // Column operations
  const handleAddColumn = () => {
    const trimmed = newColumnName.trim();
    if (!trimmed) {
      toast.error("Please enter a column title (e.g. Waist, Shoulder)");
      return;
    }
    if (formData.columns.includes(trimmed)) {
      toast.error(`Column "${trimmed}" already exists.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      columns: [...prev.columns, trimmed],
      rows: prev.rows.map((row) => ({ ...row, [trimmed]: "" })),
    }));
    setNewColumnName("");
  };

  const handleRemoveColumn = (colToRemove: string) => {
    if (formData.columns.length <= 1) {
      toast.error("A size chart must have at least one column.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c !== colToRemove),
      rows: prev.rows.map((row) => {
        const copy = { ...row };
        delete copy[colToRemove];
        return copy;
      }),
    }));
  };

  const handleColumnRename = (oldCol: string, newCol: string) => {
    const trimmed = newCol.trim();
    if (!trimmed || trimmed === oldCol) return;
    if (formData.columns.includes(trimmed)) {
      toast.error(`Column "${trimmed}" already exists.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c === oldCol ? trimmed : c)),
      rows: prev.rows.map((row) => {
        const copy: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          copy[k === oldCol ? trimmed : k] = v;
        }
        return copy;
      }),
    }));
  };

  // Row operations
  const handleAddRow = () => {
    const newRow: Record<string, string> = {};
    for (const col of formData.columns) {
      newRow[col] = "";
    }
    setFormData((prev) => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  const handleRemoveRow = (index: number) => {
    if (formData.rows.length <= 1) {
      toast.error("A size chart must have at least one row.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.map((row, i) =>
        i === rowIndex ? { ...row, [column]: value } : row
      ),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a name for the size chart.");
      return;
    }
    if (!formData.columns.length) {
      toast.error("Please add at least one column.");
      return;
    }
    if (!formData.rows.length) {
      toast.error("Please add at least one row.");
      return;
    }

    try {
      if (editingId) {
        await updateSizeChart({
          id: editingId,
          body: {
            name: formData.name.trim(),
            description: formData.description?.trim() || null,
            unit: formData.unit,
            columns: formData.columns,
            rows: formData.rows,
            tips: formData.tips?.trim() || null,
          },
        }).unwrap();
        toast.success("Size chart updated successfully!");
      } else {
        await createSizeChart({
          name: formData.name.trim(),
          description: formData.description?.trim() || null,
          unit: formData.unit,
          columns: formData.columns,
          rows: formData.rows,
          tips: formData.tips?.trim() || null,
        }).unwrap();
        toast.success("New size chart created successfully!");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save size chart."));
    }
  };

  const handleDelete = async (chart: SizeChart) => {
    if (!confirm(`Are you sure you want to delete size chart "${chart.name}"? Products using it will lose their size guide.`)) {
      return;
    }
    try {
      await deleteSizeChart(chart.id).unwrap();
      toast.success("Size chart deleted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete size chart."));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Ruler className="size-6 text-primary" />
            Size Charts & Fit Guides
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create reusable size charts with custom columns, rows, and fit tips for apparel and lifestyle products.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="gap-2 shrink-0 h-9 font-semibold"
        >
          <Plus className="size-4" />
          <span>Create Size Chart</span>
        </Button>
      </div>

      {/* ── Size Charts Grid ── */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl border bg-muted/20 animate-pulse p-6" />
          ))}
        </div>
      ) : sizeCharts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-card">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
            <Ruler className="size-6" />
          </div>
          <h3 className="text-lg font-bold">No Size Charts Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
            Create reusable size charts for t-shirts, panjabis, trousers, and shoes so customers can view interactive size guides on product pages.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleOpenCreate} className="gap-2 rounded-xl">
              <Plus className="size-4" />
              <span>Create Your First Size Chart</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sizeCharts.map((chart) => (
            <div
              key={chart.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                    {chart.name}
                  </h3>
                  <Badge variant="outline" className="uppercase font-mono text-[10px] shrink-0">
                    {chart.unit}
                  </Badge>
                </div>

                {chart.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {chart.description}
                  </p>
                )}

                {/* Table Preview Snippet */}
                <div className="rounded-xl border bg-muted/30 overflow-hidden mb-3">
                  <table className="w-full text-[11px]">
                    <thead className="bg-muted/70 text-muted-foreground border-b">
                      <tr>
                        {chart.columns.slice(0, 4).map((col, idx) => (
                          <th key={idx} className="px-2.5 py-1.5 text-left font-semibold truncate max-w-[80px]">
                            {col}
                          </th>
                        ))}
                        {chart.columns.length > 4 && (
                          <th className="px-2 py-1.5 text-muted-foreground">+{chart.columns.length - 4}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {chart.rows.slice(0, 3).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/40">
                          {chart.columns.slice(0, 4).map((col, cIdx) => (
                            <td key={cIdx} className="px-2.5 py-1.5 font-medium truncate max-w-[80px]">
                              {row[col] || "—"}
                            </td>
                          ))}
                          {chart.columns.length > 4 && <td className="px-2 py-1.5 text-muted-foreground">…</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {chart.rows.length > 3 && (
                    <div className="bg-muted/40 px-3 py-1 text-[10px] text-muted-foreground text-center border-t">
                      +{chart.rows.length - 3} more sizes
                    </div>
                  )}
                </div>

                {chart.tips && (
                  <p className="text-[11px] text-muted-foreground/80 line-clamp-2 italic mb-2">
                    💡 {chart.tips}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t pt-3.5 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewChart(chart)}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Eye className="size-3.5" />
                  <span>Preview</span>
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(chart)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(chart)}
                    className="h-8 size-8 p-0 text-destructive hover:bg-destructive/10"
                    title="Delete size chart"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border bg-background shadow-2xl animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ruler className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {editingId ? "Edit Size Chart" : "Create New Size Chart"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Customize dimensions, add measurement tips, and configure columns and rows.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Presets Row */}
              {!editingId && (
                <div className="rounded-xl border bg-muted/20 p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Quick Start with Presets
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => handleApplyPreset(preset)}
                        className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        + {preset.name} ({preset.unit})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="chartName" className="text-xs font-bold text-foreground">
                    Chart Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="chartName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Men's Cotton T-Shirt Standard"
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="chartUnit" className="text-xs font-bold text-foreground">
                    Measurement Unit <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="chartUnit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="inches">Inches (in)</option>
                    <option value="cm">Centimeters (cm)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label htmlFor="chartDescription" className="text-xs font-semibold text-muted-foreground">
                    Description / Internal Notes (Optional)
                  </label>
                  <Input
                    id="chartDescription"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Suitable for slim-fit round neck tees and casual polos"
                    className="h-10"
                  />
                </div>
              </div>

              {/* ── Table Builder Section ── */}
              <div className="space-y-4 rounded-xl border p-5 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <TableIcon className="size-4 text-primary" />
                      Dynamic Measurements Table
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define headers (Chest, Length, etc.) and enter values for each size.
                    </p>
                  </div>

                  {/* Add Column Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddColumn();
                        }
                      }}
                      placeholder="New column (e.g. Collar)"
                      className="h-8 text-xs w-40"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddColumn}
                      className="h-8 gap-1 text-xs whitespace-nowrap"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Column</span>
                    </Button>
                  </div>
                </div>

                {/* Table Grid */}
                <div className="overflow-x-auto rounded-lg border bg-background">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/70 text-muted-foreground border-b">
                      <tr>
                        <th className="w-10 px-2 py-2 text-center text-[10px] font-bold">#</th>
                        {formData.columns.map((col, idx) => (
                          <th key={idx} className="px-3 py-2 text-left font-semibold min-w-[120px]">
                            <div className="flex items-center justify-between gap-1 group/header">
                              <input
                                type="text"
                                defaultValue={col}
                                onBlur={(e) => handleColumnRename(col, e.target.value)}
                                className="w-full bg-transparent font-bold focus:outline-hidden focus:border-b focus:border-primary text-foreground"
                                title="Click to rename column header"
                              />
                              {formData.columns.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColumn(col)}
                                  className="text-muted-foreground/50 hover:text-destructive opacity-0 group-hover/header:opacity-100 transition-opacity p-0.5"
                                  title="Delete column"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="w-12 px-2 py-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/20">
                          <td className="px-2 py-1.5 text-center text-muted-foreground font-mono text-[11px]">
                            {rIdx + 1}
                          </td>
                          {formData.columns.map((col, cIdx) => (
                            <td key={cIdx} className="px-2 py-1.5">
                              <Input
                                value={row[col] ?? ""}
                                onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
                                placeholder={col}
                                className="h-8 text-xs bg-background"
                              />
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center">
                            {formData.rows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(rIdx)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                                title="Remove row"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Plus className="size-3.5" />
                  <span>Add Size Row</span>
                </Button>
              </div>

              {/* Measuring Tips */}
              <div className="space-y-1.5">
                <label htmlFor="chartTips" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <HelpCircle className="size-4 text-primary" />
                  Measuring Tips & Guidelines (Visible to shoppers)
                </label>
                <Textarea
                  id="chartTips"
                  value={formData.tips || ""}
                  onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                  placeholder="e.g. Chest: Measure under arms around the fullest part. Length: Measure from shoulder high point to bottom hem."
                  className="min-h-20 text-xs"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="gap-2 font-bold"
                >
                  {(isCreating || isUpdating) && <Loader2 className="size-4 animate-spin" />}
                  <span>{editingId ? "Update Size Chart" : "Save Size Chart"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Customer View Preview Modal ── */}
      {previewChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border bg-background p-6 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ruler className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{previewChart.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Storefront Customer Preview · All dimensions in{" "}
                    <strong className="uppercase">{previewChart.unit}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewChart(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-card mb-4">
              <table className="w-full text-xs text-left">
                <thead className="border-b bg-muted/60 text-muted-foreground font-semibold">
                  <tr>
                    {previewChart.columns.map((col, idx) => (
                      <th key={idx} className="px-3.5 py-2.5">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewChart.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/30">
                      {previewChart.columns.map((col, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 font-medium">
                          {row[col] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewChart.tips && (
              <div className="rounded-xl border bg-muted/30 p-3.5 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <span>📏</span> How to measure
                </p>
                <p className="leading-relaxed">{previewChart.tips}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => setPreviewChart(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
