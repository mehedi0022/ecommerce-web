"use client";

import { RichTextEditor } from "@/components/rich-text/RichTextEditor";
import { ImageCropModal } from "@/components/media/ImageCropModal";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import {
  duplicateSelection,
  generateVariants,
} from "@/modules/product/variant-generation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  ImagePlus,
  LoaderCircle,
  Package,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getApiErrorMessage,
  getApiValidationDetails,
} from "@/lib/api/api-error";
import {
  useCreateProductMutation,
  useCreateVariantMutation,
  useDeleteProductImageMutation,
  useDeleteVariantMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useUpdateVariantMutation,
  useUploadProductImageMutation,
} from "@/modules/product/productApi";
import {
  useUploadDescriptionImageMutation,
  useEditorAttributesQuery,
  useEditorInitialQuery,
  useEditorOptionsQuery,
  useInitializeEditorInventoryMutation,
  useLazyGetEditorInventoryQuery,
  useUpdateEditorImageMutation,
} from "@/modules/product/editorApi";
import {
  blankVariant,
  initialForm,
  newJournal,
  type EditorForm,
  type EditorImage,
  type EditorInitial,
  type SaveProgress,
  type VariantRow,
} from "@/modules/product/editor.types";
import {
  saveEditor,
  selectedValues,
  validateEditor,
  variantEntered,
  type SaveOperations,
} from "@/modules/product/editor-workflow";
import type { ProductStatus } from "@/modules/product/types";
import { ChecklistItem, Field, Section, selectClass } from "./EditorFields";

export function ProductEditor({
  edit = false,
  productId,
}: {
  edit?: boolean;
  productId?: number;
}) {
  const initial = useEditorInitialQuery(productId!, {
    skip: !edit || !productId,
    refetchOnMountOrArgChange: true,
  });
  if (edit && (!productId || !Number.isSafeInteger(productId) || productId < 1))
    return <p role="alert">This product link is invalid.</p>;
  if (edit && (initial.isLoading || (!initial.data && !initial.error)))
    return (
      <div
        className="mx-auto max-w-6xl space-y-5"
        aria-busy="true"
        aria-label="Loading product"
      >
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="h-96 animate-pulse rounded-2xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  if (edit && initial.error)
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl space-y-4 rounded-2xl border p-8"
      >
        <CircleAlert className="text-destructive" />
        <h1 className="text-xl font-semibold">We couldn’t load this product</h1>
        <p className="text-sm text-muted-foreground">
          {getApiErrorMessage(initial.error)} Make sure your account can read
          products and inventory.
        </p>
        <Button onClick={() => initial.refetch()}>Try again</Button>
        <Link className="ml-4 text-sm underline" href="/admin/products">
          Back to products
        </Link>
      </div>
    );
  return (
    <Editor
      key={productId ?? "new"}
      initial={edit ? initial.data : undefined}
    />
  );
}

function Editor({ initial }: { initial?: EditorInitial }) {
  const [form, setForm] = useState(() => initialForm(initial));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{
    kind: "error" | "success";
    text: string;
  }>();
  const [progress, setProgress] = useState<SaveProgress>();
  const [lastTarget, setLastTarget] = useState<ProductStatus>();
  const [undo, setUndo] = useState<
    | { kind: "variant"; value: VariantRow; index: number }
    | { kind: "image"; value: EditorImage; index: number }
  >();
  const [dragging, setDragging] = useState(false);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [descriptionBusy, setDescriptionBusy] = useState(false);
  const [uploadDescription] = useUploadDescriptionImageMutation();
  const [journalView, setJournalView] = useState(() => newJournal(initial));
  const journal = useRef(newJournal(initial));
  const saveLock = useRef(false);
  const previews = useRef(new Set<string>());
  const options = useEditorOptionsQuery();
  const attributes = useEditorAttributesQuery(Number(form.primaryCategoryId), {
    skip: !form.primaryCategoryId,
  });
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [createVariant] = useCreateVariantMutation();
  const [updateVariant] = useUpdateVariantMutation();
  const [deleteVariant] = useDeleteVariantMutation();
  const [uploadImage] = useUploadProductImageMutation();
  const [updateImage] = useUpdateEditorImageMutation();
  const [deleteImage] = useDeleteProductImageMutation();
  const [getInventory] = useLazyGetEditorInventoryQuery();
  const [initializeInventory] = useInitializeEditorInventoryMutation();
  const [setStatus] = useUpdateProductStatusMutation();
  const currentAttributes = attributes.currentData ?? [];
  const entered = form.variants.filter(variantEntered);
  const cover = form.images.find((image) => image.isPrimary) ?? form.images[0];
  const categoryLocked = form.variants.some(
    (row) => row.id || journalView.variants[row.key],
  );
  const publishErrors = validateEditor(form, currentAttributes, "ACTIVE");
  const activeCount = entered.filter((row) => row.isActive).length;
  const photoCount = form.images.length;
  const canReview = journalView.productId;
  const price = entered
    .filter((row) => row.price !== "" && Number.isFinite(Number(row.price)))
    .map((row) => Number(row.price));

  useEffect(() => {
    const urls = previews.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const guardLink = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        (url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          url.hash)
      )
        return;
      if (
        saving ||
        !window.confirm(
          "Leave with unsaved changes? Completed saves will be kept.",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      } else window.removeEventListener("beforeunload", warn);
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guardLink, true);
    };
  }, [dirty, saving]);

  function change(update: (old: EditorForm) => EditorForm) {
    setForm(update);
    setDirty(true);
    setNotice(undefined);
  }
  function field<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    change((old) => ({ ...old, [key]: value }));
  }
  function rowField<K extends keyof VariantRow>(
    key: string,
    field: K,
    value: VariantRow[K],
  ) {
    change((old) => ({
      ...old,
      variants: old.variants.map((row) =>
        row.key === key ? { ...row, [field]: value } : row,
      ),
    }));
  }
  function imageField(key: string, value: Partial<EditorImage>) {
    change((old) => ({
      ...old,
      images: old.images.map((image) =>
        image.key === key ? { ...image, ...value } : image,
      ),
    }));
  }
  function chooseCover(key: string) {
    change((old) => ({
      ...old,
      images: old.images.map((image) => ({
        ...image,
        isPrimary: image.key === key,
      })),
    }));
  }
  function addFiles(files: FileList | File[]) {
    const filesToCrop = Array.from(files).filter(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size > 0 &&
        file.size <= 20 * 1024 * 1024,
    );
    if (filesToCrop.length !== files.length)
      setNotice({
        kind: "error",
        text: "Choose JPG, PNG or WebP files up to 20 MB each.",
      });
    setCropQueue((old) => [...old, ...filesToCrop]);
  }
  function addCroppedFiles(files: File[]) {
    if (saving) return;
    const valid: EditorImage[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        !file.size
      ) {
        rejected.push(file.name);
        continue;
      }
      const url = URL.createObjectURL(file);
      previews.current.add(url);
      valid.push({
        key: crypto.randomUUID(),
        file,
        url,
        altText: "",
        isPrimary: false,
        attributeValueIds: [],
      });
    }
    change((old) => ({
      ...old,
      images: [
        ...old.images,
        ...valid.map((image, index) => ({
          ...image,
          isPrimary: !old.images.some((i) => i.isPrimary) && index === 0,
        })),
      ],
    }));
    if (rejected.length)
      setNotice({
        kind: "error",
        text: `Choose a nonempty JPG, PNG or WebP file. Not added: ${rejected.join(", ")}`,
      });
  }
  function focusField(key: string) {
    const container = document.querySelector<HTMLElement>(
      `[data-field="${CSS.escape(key)}"]`,
    );
    container?.scrollIntoView({ behavior: "smooth", block: "center" });
    (
      container?.querySelector<HTMLElement>("input,select,textarea,button") ??
      container
    )?.focus({ preventScroll: true });
  }
  async function save(target: ProductStatus) {
    if (
      saveLock.current ||
      journal.current.needsReview ||
      descriptionBusy ||
      cropQueue.length
    )
      return;
    if (
      form.primaryCategoryId &&
      (!attributes.currentData || attributes.isFetching || attributes.isError)
    ) {
      setNotice({
        kind: "error",
        text: "Wait for the category options to load, or retry loading them before saving.",
      });
      return;
    }
    const validation = validateEditor(form, currentAttributes, target);
    setErrors(validation);
    setNotice(undefined);
    if (Object.keys(validation).length) {
      focusField(Object.keys(validation)[0]);
      return;
    }
    saveLock.current = true;
    setSaving(true);
    setLastTarget(target);
    setUndo(undefined);
    const checkpoint = () => {
      setJournalView(structuredClone(journal.current));
      if (!initial && journal.current.productId) {
        const url = new URL(window.location.href);
        url.searchParams.set("draft", String(journal.current.productId));
        // Keep pending files/form state mounted; refreshing this URL resumes the saved draft.
        window.history.replaceState(null, "", url.pathname + url.search);
      }
    };
    const ignoreMissing = async (operation: () => Promise<unknown>) => {
      try {
        return await operation();
      } catch (error) {
        if ((error as { status?: number }).status !== 404) throw error;
      }
    };
    const api: SaveOperations = {
      createProduct: async (body) => (await createProduct(body).unwrap()).data,
      updateProduct: (id, body) => updateProduct({ id, body }).unwrap(),
      createVariant: async (productId, body) =>
        (await createVariant({ productId, body }).unwrap()).data,
      updateVariant: (productId, variantId, body) =>
        updateVariant({ productId, variantId, body }).unwrap(),
      deleteVariant: (productId, variantId) =>
        ignoreMissing(() => deleteVariant({ productId, variantId }).unwrap()),
      getInventory: async (id) => {
        try {
          return (await getInventory(id, false).unwrap()).data;
        } catch (error) {
          const value = error as {
            status?: number;
            data?: { message?: string };
          };
          if (
            value.status === 404 &&
            value.data?.message === "Inventory is not initialized"
          )
            return null;
          throw error;
        }
      },
      initializeInventory: async (variantId, quantity, lowStockThreshold) =>
        (
          await initializeInventory({
            variantId,
            quantity,
            lowStockThreshold,
          }).unwrap()
        ).data,
      uploadImage: async (productId, image, sortOrder) => {
        if (!image.file) throw new Error("Please select the photo file again.");
        return (
          await uploadImage({
            productId,
            file: image.file,
            altText: image.altText,
            isPrimary: image.isPrimary,
            sortOrder,
            attributeValueIds: image.attributeValueIds,
          }).unwrap()
        ).data;
      },
      updateImage: (productId, imageId, image, sortOrder) =>
        updateImage({
          productId,
          imageId,
          body: {
            altText: image.altText,
            isPrimary: image.isPrimary,
            sortOrder,
            attributeValueIds: image.attributeValueIds,
          },
        }).unwrap(),
      deleteImage: (productId, imageId) =>
        ignoreMissing(() => deleteImage({ productId, imageId }).unwrap()),
      setStatus: (id, status) => setStatus({ id, status }).unwrap(),
    };
    try {
      await saveEditor(
        form,
        target,
        journal.current,
        initial,
        api,
        setProgress,
        checkpoint,
      );
      setForm((old) => ({ ...old, status: target }));
      setDirty(false);
      setLastTarget(undefined);
      setNotice({
        kind: "success",
        text:
          target === "ACTIVE"
            ? "Your product is published. All variants, opening stock and photos are saved."
            : target === "DRAFT"
              ? "Draft saved. You can continue editing whenever you’re ready."
              : "Product changes saved.",
      });
    } catch (error) {
      const details = getApiValidationDetails(error)
        .map((detail) => detail.message)
        .join(" ");
      setNotice({
        kind: "error",
        text: journal.current.needsReview
          ? "The connection was interrupted and we couldn’t confirm the last save. Review the saved product before trying again, so nothing is duplicated."
          : `${getApiErrorMessage(error, error instanceof Error ? error.message : "We couldn’t finish saving.")} ${details} Completed steps are saved; fix the issue and resume.`,
      });
    } finally {
      setSaving(false);
      saveLock.current = false;
      checkpoint();
    }
  }
  const target = form.status === "DRAFT" ? "ACTIVE" : form.status;
  const mainLabel =
    target === "ACTIVE"
      ? journalView.status === "ACTIVE"
        ? "Save changes"
        : "Publish product"
      : "Save changes";
  const blocked =
    saving ||
    Boolean(journalView.needsReview) ||
    descriptionBusy ||
    cropQueue.length > 0;

  return (
    <div className="mx-auto max-w-7xl pb-4">
      {cropQueue[0] && (
        <ImageCropModal
          kind="product"
          title={form.name}
          key={`${cropQueue[0].name}-${cropQueue[0].lastModified}-${cropQueue.length}`}
          file={cropQueue[0]}
          onCancel={() => setCropQueue((queue) => queue.slice(1))}
          onConfirm={(file) => {
            addCroppedFiles([file]);
            setCropQueue((queue) => queue.slice(1));
          }}
        />
      )}
      <header className="mb-7 space-y-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/admin/products">Products</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">
            {initial ? "Edit product" : "New product"}
          </span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {initial ? "Edit product" : "Create a product"}
              </h1>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${journalView.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
              >
                {journalView.status === "ACTIVE"
                  ? "Published"
                  : journalView.status === "ARCHIVED"
                    ? "Archived"
                    : journalView.status === "INACTIVE"
                      ? "Inactive"
                      : "Draft"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything your customers need, in one place.
            </p>
          </div>
          <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`}
            />
            {saving
              ? "Saving your product…"
              : dirty
                ? "Unsaved changes"
                : journalView.productId
                  ? "All changes saved"
                  : "Not saved yet"}
          </span>
        </div>
      </header>

      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.kind === "error" ? "border-destructive/25 bg-destructive/5" : "border-emerald-500/25 bg-emerald-500/5"}`}
        >
          {notice.kind === "error" ? (
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          ) : (
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          )}
          <div className="space-y-2">
            <p>{notice.text}</p>
            {canReview && (
              <a
                href={`/admin/products/${canReview}/edit`}
                className="inline-block text-xs font-medium underline"
              >
                Open saved product
              </a>
            )}
            {journalView.needsReview && !canReview && (
              <Link
                href="/admin/products"
                className="inline-block text-xs underline"
              >
                Check product list before creating another product
              </Link>
            )}
          </div>
        </div>
      )}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-destructive/25 bg-destructive/5 p-4"
        >
          <p className="text-sm font-semibold">
            A few details need your attention
          </p>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>
                <button
                  type="button"
                  className="text-left text-xs text-destructive underline underline-offset-2"
                  onClick={() => focusField(key)}
                >
                  {message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <fieldset
          disabled={blocked}
          className="min-w-0 space-y-6 disabled:opacity-75"
        >
          <Section
            id="details"
            number="01"
            title="Product details"
            description="Start with a name and a clear description."
          >
            <Field name="name" label="Product name" error={errors.name}>
              <Input
                id="name"
                value={form.name}
                maxLength={250}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                onChange={(e) => field("name", e.target.value)}
                placeholder="e.g. Everyday Cotton T-Shirt"
                className="h-11"
              />
            </Field>
            <Field
              name="shortDescription"
              label="Short description"
              optional
              error={errors.shortDescription}
              hint="A quick introduction for shoppers."
            >
              <Textarea
                id="shortDescription"
                value={form.shortDescription}
                maxLength={500}
                onChange={(e) => field("shortDescription", e.target.value)}
                placeholder="Soft cotton. An easy everyday fit."
                className="min-h-20"
              />
            </Field>
            <Field
              name="description"
              label="Description"
              optional
              error={errors.description}
            >
              <RichTextEditor
                imageTitle={form.name}
                imageKind="product"
                id="description"
                value={form.description}
                onChange={(html) => field("description", html)}
                disabled={saving || Boolean(journalView.needsReview)}
                onBusyChange={setDescriptionBusy}
                uploadImage={async (file) => {
                  try {
                    return mediaUrl(
                      (await uploadDescription(file).unwrap()).data.url,
                    );
                  } catch (error) {
                    throw new Error(
                      getApiErrorMessage(
                        error,
                        "Description image upload failed.",
                      ),
                    );
                  }
                }}
              />
            </Field>
            <div className="border-t pt-5">
              {options.isError ? (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-3 text-sm text-destructive"
                >
                  <p>
                    Categories and brands couldn’t load.{" "}
                    {getApiErrorMessage(options.error)}
                  </p>
                  <Button variant="outline" onClick={() => options.refetch()}>
                    Retry
                  </Button>
                </div>
              ) : options.isLoading ? (
                <p role="status" className="text-sm text-muted-foreground">
                  Loading categories and brands…
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    name="category"
                    label="Primary category"
                    error={errors.category}
                    hint={
                      categoryLocked
                        ? "The primary category is locked after variants are saved."
                        : "Choose a leaf category. This determines the available variant options."
                    }
                  >
                    <select
                      id="category"
                      disabled={categoryLocked}
                      className={selectClass}
                      value={form.primaryCategoryId}
                      aria-invalid={Boolean(errors.category)}
                      onChange={(e) => {
                        const value = e.target.value;
                        change((old) => ({
                          ...old,
                          primaryCategoryId: value,
                          categoryIds: value
                            ? Array.from(
                                new Set([
                                  ...old.categoryIds.filter(
                                    (id) =>
                                      id !== Number(old.primaryCategoryId),
                                  ),
                                  Number(value),
                                ]),
                              )
                            : [],
                          variants: old.variants.map((row) => ({
                            ...row,
                            selections: {},
                          })),
                        }));
                      }}
                    >
                      <option value="">Choose a category</option>
                      {form.primaryCategoryId &&
                        !options.data?.categories.some(
                          (c) => c.id === Number(form.primaryCategoryId),
                        ) && (
                          <option value={form.primaryCategoryId}>
                            Current category (unavailable)
                          </option>
                        )}
                      {options.data?.categories.map((category) => (
                        <option
                          value={category.id}
                          key={category.id}
                          disabled={
                            category.isLeaf === false &&
                            category.id !== Number(form.primaryCategoryId)
                          }
                        >
                          {category.path ?? category.name}
                          {category.isLeaf === false ? " (group)" : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field name="brand" label="Brand" optional>
                    <select
                      id="brand"
                      className={selectClass}
                      value={form.brandId}
                      onChange={(e) => field("brandId", e.target.value)}
                    >
                      <option value="">No brand</option>
                      {form.brandId &&
                        !options.data?.brands.some(
                          (b) => b.id === Number(form.brandId),
                        ) && (
                          <option value={form.brandId}>
                            Current brand (unavailable)
                          </option>
                        )}
                      {options.data?.brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {Boolean(form.primaryCategoryId) && (
                    <details className="sm:col-span-2">
                      <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                        Additional categories ·{" "}
                        {
                          form.categoryIds.filter(
                            (id) => id !== Number(form.primaryCategoryId),
                          ).length
                        }{" "}
                        selected
                      </summary>
                      <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                        {options.data?.categories
                          .filter(
                            (c) => c.id !== Number(form.primaryCategoryId),
                          )
                          .map((category) => (
                            <label
                              key={category.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={form.categoryIds.includes(category.id)}
                                onChange={(e) =>
                                  field(
                                    "categoryIds",
                                    e.target.checked
                                      ? [...form.categoryIds, category.id]
                                      : form.categoryIds.filter(
                                          (id) => id !== category.id,
                                        ),
                                  )
                                }
                              />
                              {category.name}
                            </label>
                          ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </Section>

          <Section
            id="shipping-payment"
            number="02"
            title="Shipping & Payment"
            description="Configure delivery charges, Cash on Delivery (COD), and advance payment requirements."
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <input
                  type="checkbox"
                  id="isFreeShipping"
                  checked={form.isFreeShipping}
                  onChange={(e) => field("isFreeShipping", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="isFreeShipping"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    🚚 Free Shipping (ফ্রি ডেলিভারি)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Orders containing only free shipping products will qualify
                    for free delivery (৳0), regardless of cart amount.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <input
                  type="checkbox"
                  id="isCodAvailable"
                  checked={form.isCodAvailable}
                  onChange={(e) => field("isCodAvailable", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="isCodAvailable"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    💵 Allow Cash on Delivery (ক্যাশ অন ডেলিভারি)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, customers can choose full Cash on Delivery
                    (unless minimum advance payment is required).
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="requiresAdvancePayment"
                    checked={form.requiresAdvancePayment}
                    onChange={(e) =>
                      field("requiresAdvancePayment", e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="requiresAdvancePayment"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      ⚡ Require Minimum Advance Payment (আংশিক অগ্রিম পেমেন্ট)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Disable full COD. Customer must pay a minimum advance
                      amount online or via MFS; the remaining balance will be
                      collected as Cash on Delivery upon arrival.
                    </p>
                  </div>
                </div>

                {form.requiresAdvancePayment && (
                  <div className="pt-2 pl-7 max-w-sm">
                    <Field
                      name="advancePaymentAmount"
                      label="Advance Payment Amount (BDT)"
                      optional
                      hint="Fixed advance amount (e.g. 150 or 200). If left empty, default delivery charge is required as advance."
                      error={errors.advancePaymentAmount}
                    >
                      <Input
                        id="advancePaymentAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.advancePaymentAmount}
                        placeholder="e.g. 150.00"
                        onChange={(e) =>
                          field("advancePaymentAmount", e.target.value)
                        }
                        className="h-10 bg-background"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section
            id="variants"
            number="03"
            title="Variants & stock"
            description="Set the price and opening stock for each option."
            action={
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={
                    !form.primaryCategoryId ||
                    attributes.isFetching ||
                    !currentAttributes.length
                  }
                  onClick={() => {
                    try {
                      const variants = generateVariants(
                        currentAttributes,
                        form.variants,
                        `${form.name}-${journalView.productId ?? "new"}`,
                      );
                      const added =
                        variants.length -
                        form.variants.filter(variantEntered).length;
                      change((old) => ({ ...old, variants }));
                      setNotice({
                        kind: "success",
                        text: `${added} new combinations generated. Review SKUs, prices and opening stock before saving.`,
                      });
                    } catch (error) {
                      setNotice({
                        kind: "error",
                        text:
                          error instanceof Error
                            ? error.message
                            : "Could not generate variants.",
                      });
                    }
                  }}
                >
                  Generate variants
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    !form.primaryCategoryId ||
                    (!currentAttributes.length && form.variants.length > 0)
                  }
                  onClick={() =>
                    change((old) => ({
                      ...old,
                      variants: [
                        ...old.variants,
                        blankVariant(crypto.randomUUID()),
                      ],
                    }))
                  }
                >
                  <Plus />
                  Add variant
                </Button>
              </div>
            }
          >
            {!form.primaryCategoryId ? (
              <div className="rounded-xl bg-muted/50 p-6 text-center">
                <Package className="mx-auto mb-3 size-6 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Choose a category to get started
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We’ll show the right options for your product. You can save a
                  draft now.
                </p>
              </div>
            ) : attributes.isFetching ? (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <LoaderCircle className="size-4 animate-spin" />
                Loading variant options…
              </p>
            ) : attributes.isError ? (
              <div role="alert" className="space-y-2 text-sm">
                <p className="text-destructive">
                  {getApiErrorMessage(
                    attributes.error,
                    "Couldn’t load variant options.",
                  )}
                </p>
                <Button variant="outline" onClick={() => attributes.refetch()}>
                  Retry options
                </Button>
              </div>
            ) : (
              <>
                {!currentAttributes.length && (
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    This category has no size or color options. Add one standard
                    variant with a SKU and price.{" "}
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`/admin/catalog/categories?category=${form.primaryCategoryId}`}
                    >
                      Configure category attributes →
                    </a>
                  </p>
                )}
                {form.variants.map((row, index) => {
                  const prefix = `variant-${row.key}`;
                  const stock = row.inventory ?? journalView.stock[row.key];
                  return (
                    <div
                      key={row.key}
                      className="rounded-xl border"
                      data-field={`${prefix}-attributes`}
                      tabIndex={-1}
                    >
                      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            Variant {index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {currentAttributes
                              .map(
                                (attr) =>
                                  attr.values.find(
                                    (value) =>
                                      value.id === row.selections[attr.id],
                                  )?.value,
                              )
                              .filter(Boolean)
                              .join(" / ") || "Standard"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={row.isActive}
                              onChange={(e) =>
                                rowField(row.key, "isActive", e.target.checked)
                              }
                            />
                            Active
                          </label>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove variant ${index + 1}`}
                            onClick={() => {
                              setUndo({ kind: "variant", value: row, index });
                              change((old) => ({
                                ...old,
                                variants: old.variants.filter(
                                  (r) => r.key !== row.key,
                                ),
                              }));
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4 p-4">
                        {currentAttributes.length > 0 && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {currentAttributes.map((attr) => {
                              const key = `${prefix}-attribute-${attr.id}`;
                              return (
                                <Field
                                  key={attr.id}
                                  name={key}
                                  label={attr.name}
                                  optional={!attr.isRequired}
                                  error={errors[key]}
                                >
                                  <select
                                    id={key}
                                    className={selectClass}
                                    value={row.selections[attr.id] ?? ""}
                                    aria-invalid={Boolean(errors[key])}
                                    onChange={(e) => {
                                      const selections = {
                                        ...row.selections,
                                        [attr.id]: Number(e.target.value),
                                      };
                                      if (
                                        duplicateSelection(
                                          form.variants,
                                          row.key,
                                          selections,
                                        )
                                      ) {
                                        setNotice({
                                          kind: "error",
                                          text: "This variant combination already exists. Choose another combination.",
                                        });
                                        return;
                                      }
                                      rowField(
                                        row.key,
                                        "selections",
                                        selections,
                                      );
                                    }}
                                  >
                                    <option value="">
                                      {attr.values.length
                                        ? `Select ${attr.name.toLowerCase()}`
                                        : "No available values"}
                                    </option>
                                    {attr.values.map((value) => (
                                      <option
                                        key={value.id}
                                        value={value.id}
                                        disabled={
                                          value.id !==
                                            row.selections[attr.id] &&
                                          duplicateSelection(
                                            form.variants,
                                            row.key,
                                            {
                                              ...row.selections,
                                              [attr.id]: value.id,
                                            },
                                          )
                                        }
                                      >
                                        {value.value}
                                      </option>
                                    ))}
                                  </select>
                                </Field>
                              );
                            })}
                          </div>
                        )}
                        {errors[`${prefix}-attributes`] && (
                          <p className="text-xs text-destructive">
                            {errors[`${prefix}-attributes`]}
                          </p>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            name={`${prefix}-sku`}
                            label="SKU"
                            error={errors[`${prefix}-sku`]}
                          >
                            <Input
                              id={`${prefix}-sku`}
                              value={row.sku}
                              maxLength={100}
                              placeholder="TSHIRT-BLUE-M"
                              className="h-10 font-mono text-xs"
                              aria-invalid={Boolean(errors[`${prefix}-sku`])}
                              onChange={(e) =>
                                rowField(row.key, "sku", e.target.value)
                              }
                            />
                          </Field>
                          <Field
                            name={`${prefix}-price`}
                            label="Selling price"
                            error={errors[`${prefix}-price`]}
                          >
                            <Input
                              id={`${prefix}-price`}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={row.price}
                              placeholder="0.00"
                              className="h-10"
                              aria-invalid={Boolean(errors[`${prefix}-price`])}
                              onChange={(e) =>
                                rowField(row.key, "price", e.target.value)
                              }
                            />
                          </Field>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            name={`${prefix}-compareAtPrice`}
                            label="Compare-at price"
                            optional
                            hint="Original price, if this item is on sale."
                            error={errors[`${prefix}-compareAtPrice`]}
                          >
                            <Input
                              id={`${prefix}-compareAtPrice`}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={row.compareAtPrice}
                              placeholder="0.00"
                              className="h-10"
                              onChange={(e) =>
                                rowField(
                                  row.key,
                                  "compareAtPrice",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field
                            name={`${prefix}-costPrice`}
                            label="Cost per item"
                            optional
                            hint="For your records. Not shown to customers."
                            error={errors[`${prefix}-costPrice`]}
                          >
                            <Input
                              id={`${prefix}-costPrice`}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={row.costPrice}
                              placeholder="0.00"
                              className="h-10"
                              onChange={(e) =>
                                rowField(row.key, "costPrice", e.target.value)
                              }
                            />
                          </Field>
                        </div>
                        {stock ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-3 text-xs">
                            <span>
                              <strong>{stock.availableQuantity}</strong>{" "}
                              available · {stock.reservedQuantity} reserved
                            </span>
                            <span className="text-muted-foreground">
                              Opening stock saved. Existing stock stays
                              unchanged here.
                            </span>
                          </div>
                        ) : (
                          <div className="grid gap-4 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
                            <Field
                              name={`${prefix}-stock`}
                              label="Opening stock"
                              hint="Zero is allowed for an out-of-stock product."
                              error={errors[`${prefix}-stock`]}
                            >
                              <Input
                                id={`${prefix}-stock`}
                                type="number"
                                min="0"
                                step="1"
                                value={row.stock}
                                className="h-10 bg-background"
                                onChange={(e) =>
                                  rowField(row.key, "stock", e.target.value)
                                }
                              />
                            </Field>
                            <Field
                              name={`${prefix}-threshold`}
                              label="Low-stock alert at"
                            >
                              <Input
                                id={`${prefix}-threshold`}
                                type="number"
                                min="0"
                                step="1"
                                value={row.threshold}
                                className="h-10 bg-background"
                                onChange={(e) =>
                                  rowField(row.key, "threshold", e.target.value)
                                }
                              />
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {form.variants.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No variants yet. Add one before publishing.
                  </p>
                )}
              </>
            )}
          </Section>

          <Section
            id="images"
            number="04"
            title="Product photos"
            description="A great first photo helps customers choose your product."
          >
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`relative flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/50"}`}
            >
              <span className="mb-3 flex size-11 items-center justify-center rounded-xl border bg-background shadow-sm">
                <Upload className="size-5 text-muted-foreground" />
              </span>
              <span className="text-sm font-medium">
                Drop photos here, or browse files
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG or WebP · Choose multiple photos
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload product photos"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {errors.images && (
              <p className="text-xs text-destructive">{errors.images}</p>
            )}
            {form.images.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {form.images.map((image, index) => (
                  <div
                    key={image.key}
                    className={`overflow-hidden rounded-xl border ${image.isPrimary ? "ring-1 ring-primary" : ""}`}
                  >
                    <div className="relative aspect-[4/3] bg-muted/30">
                      <Image
                        unoptimized
                        src={mediaUrl(image.url)}
                        alt={image.altText || `Product photo ${index + 1}`}
                        fill
                        sizes="320px"
                        className="object-contain p-3"
                      />
                      {image.isPrimary && (
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/95 px-2 py-1 text-[10px] font-semibold shadow-sm">
                          <Star className="size-3 fill-current" />
                          Cover
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="absolute right-2 top-2 bg-background/95"
                        aria-label={`Remove photo ${index + 1}`}
                        onClick={() => {
                          setUndo({ kind: "image", value: image, index });
                          change((old) => ({
                            ...old,
                            images: old.images.filter(
                              (i) => i.key !== image.key,
                            ),
                          }));
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                    <div className="space-y-3 border-t p-3">
                      <Input
                        aria-label={`Description for photo ${index + 1}`}
                        value={image.altText}
                        maxLength={500}
                        placeholder="Describe this photo"
                        onChange={(e) =>
                          imageField(image.key, { altText: e.target.value })
                        }
                      />
                      <select
                        aria-label={`Variant for photo ${index + 1}`}
                        className={selectClass}
                        value={
                          image.attributeValueIds.length
                            ? (entered.find(
                                (row) =>
                                  selectedValues(row).join(",") ===
                                  [...image.attributeValueIds]
                                    .sort((a, b) => a - b)
                                    .join(","),
                              )?.key ?? "existing")
                            : "general"
                        }
                        onChange={(e) => {
                          const row = entered.find(
                            (r) => r.key === e.target.value,
                          );
                          imageField(image.key, {
                            attributeValueIds: row ? selectedValues(row) : [],
                            ...(row ? { isPrimary: false } : {}),
                          });
                        }}
                      >
                        <option value="general">General product photo</option>
                        {image.attributeValueIds.length > 0 && (
                          <option value="existing" disabled>
                            Current option selection
                          </option>
                        )}
                        {entered
                          .filter((row) => selectedValues(row).length > 0)
                          .map((row) => (
                            <option key={row.key} value={row.key}>
                              {row.sku || "Unnamed variant"}
                            </option>
                          ))}
                      </select>
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          disabled={
                            Boolean(image.attributeValueIds.length) ||
                            image.isPrimary
                          }
                          onClick={() => chooseCover(image.key)}
                        >
                          <Star />
                          {image.isPrimary ? "Cover photo" : "Make cover"}
                        </Button>
                        <div className="flex gap-1">
                          {[-1, 1].map((direction) => (
                            <Button
                              key={direction}
                              variant="ghost"
                              size="icon-xs"
                              disabled={
                                index + direction < 0 ||
                                index + direction >= form.images.length
                              }
                              aria-label={`Move photo ${index + 1} ${direction < 0 ? "earlier" : "later"}`}
                              onClick={() =>
                                change((old) => {
                                  const images = [...old.images];
                                  [images[index], images[index + direction]] = [
                                    images[index + direction],
                                    images[index],
                                  ];
                                  return { ...old, images };
                                })
                              }
                            >
                              {direction < 0 ? <ArrowLeft /> : <ArrowRight />}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
          {undo && (
            <div
              role="status"
              className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm"
            >
              <span>
                {undo.kind === "variant" ? "Variant" : "Photo"} removed. Changes
                apply when saved.
              </span>
              <Button
                variant="ghost"
                onClick={() => {
                  const item = undo;
                  change((old) => {
                    if (item.kind === "variant") {
                      const variants = [...old.variants];
                      variants.splice(item.index, 0, item.value);
                      return { ...old, variants };
                    }
                    const images = [...old.images];
                    images.splice(item.index, 0, item.value);
                    return { ...old, images };
                  });
                  setUndo(undefined);
                }}
              >
                <RotateCcw />
                Undo
              </Button>
            </div>
          )}
        </fieldset>

        <aside className="space-y-5 xl:sticky xl:top-5">
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="text-sm font-semibold">Product preview</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A quick look at your product.
              </p>
            </div>
            <div className="p-4">
              <div className="relative flex aspect-square items-center justify-center rounded-xl bg-muted/40">
                {cover ? (
                  <Image
                    unoptimized
                    src={mediaUrl(cover.url)}
                    alt={cover.altText || form.name || "Product preview"}
                    fill
                    sizes="300px"
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImagePlus className="mx-auto mb-2 size-8 opacity-40" />
                    <p className="text-xs">Your cover photo appears here</p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {options.data?.brands.find(
                  (brand) => brand.id === Number(form.brandId),
                )?.name || "Your product"}
              </p>
              <h3 className="mt-1 break-words font-semibold">
                {form.name.trim() || "Product name"}
              </h3>
              <p className="mt-1 text-sm font-medium">
                {price.length
                  ? `${Math.min(...price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${Math.max(...price) !== Math.min(...price) ? " +" : ""}`
                  : "Add a selling price"}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {form.shortDescription ||
                  "Your short description will appear here."}
              </p>
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Ready to publish</h2>
            <ul className="mt-4 space-y-3">
              <ChecklistItem complete={Boolean(form.name.trim())}>
                Product name
              </ChecklistItem>
              <ChecklistItem complete={Boolean(form.primaryCategoryId)}>
                Primary category
              </ChecklistItem>
              <ChecklistItem
                complete={
                  activeCount > 0 &&
                  !Object.keys(publishErrors).some((key) =>
                    key.startsWith("variant"),
                  )
                }
              >
                Variants & opening stock
              </ChecklistItem>
              <ChecklistItem
                complete={form.images.some(
                  (i) => i.isPrimary && !i.attributeValueIds.length,
                )}
              >
                Cover photo
              </ChecklistItem>
            </ul>
            <div className="mt-5 border-t pt-4">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  disabled={blocked}
                  checked={form.isFeatured}
                  onChange={(e) => field("isFeatured", e.target.checked)}
                />
                Feature this product in the store
              </label>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Drafts stay private. Publishing makes your product visible after
              everything is saved.
            </p>
            {journalView.status === "ACTIVE" && (
              <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                This product is live. Saved edits apply to the published
                product.
              </p>
            )}
            {Boolean(initial || journalView.productId) && (
              <div className="mt-4">
                <label
                  htmlFor="publish-status"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Visibility after saving
                </label>
                <select
                  id="publish-status"
                  className={selectClass}
                  disabled={blocked}
                  value={form.status}
                  onChange={(e) =>
                    field("status", e.target.value as ProductStatus)
                  }
                >
                  <option value="DRAFT">Draft — private</option>
                  <option value="ACTIVE">Published — visible</option>
                  <option value="INACTIVE">Inactive — hidden</option>
                  <option value="ARCHIVED">Archived — hidden</option>
                </select>
              </div>
            )}
          </section>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 mt-7 rounded-2xl border bg-background/95 shadow-lg backdrop-blur">
        {progress && (
          <div className="border-b px-4 py-3 sm:px-5" aria-live="polite">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2">
                {saving ? (
                  <LoaderCircle className="size-3 animate-spin" />
                ) : progress.completed === 5 ? (
                  <Check className="size-3 text-emerald-600" />
                ) : (
                  <CircleAlert className="size-3 text-amber-600" />
                )}
                {saving
                  ? progress.label
                  : progress.completed === 5
                    ? progress.label
                    : `Paused: ${progress.label.toLowerCase()}`}
              </span>
              <span className="text-muted-foreground">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Product save progress"
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={progress.completed}
              className="h-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
          <div className="hidden text-xs text-muted-foreground sm:block">
            <span className="font-medium text-foreground">
              {entered.length}
            </span>{" "}
            variants <span className="mx-2">·</span>
            <span className="font-medium text-foreground">
              {photoCount}
            </span>{" "}
            photos
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              className="hidden sm:inline-flex"
              variant="ghost"
              nativeButton={false}
              disabled={saving}
              render={<Link href="/admin/products" />}
            >
              Cancel
            </Button>
            <Button
              className="h-11 flex-1 sm:h-9 sm:flex-none"
              variant="outline"
              disabled={blocked}
              onClick={() => save("DRAFT")}
            >
              <Save />
              Save draft
            </Button>
            {notice?.kind === "error" &&
            lastTarget &&
            !journalView.needsReview ? (
              <Button
                className="h-11 flex-1 sm:h-9 sm:flex-none"
                disabled={blocked}
                onClick={() => save(lastTarget)}
              >
                <RotateCcw />
                Resume save
              </Button>
            ) : (
              <Button
                className="h-11 flex-1 sm:h-9 sm:flex-none"
                disabled={blocked}
                onClick={() => save(target)}
              >
                {saving ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <ArrowRight />
                )}
                {saving ? "Saving…" : mainLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
