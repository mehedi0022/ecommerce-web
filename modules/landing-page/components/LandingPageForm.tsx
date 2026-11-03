"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  Sparkles,
  Layers,
  HelpCircle,
  Video,
  Clock,
  Plus,
  Trash2,
  Check,
  Image as ImageIcon,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/rich-text/RichTextEditor";
import { useListPublicProductsQuery } from "@/modules/product/productApi";
import {
  useCreateLandingPageMutation,
  useUpdateLandingPageMutation,
  useUploadLandingPageImageMutation,
} from "@/modules/landing-page/landingPageApi";
import { useUploadDescriptionImageMutation } from "@/modules/product/editorApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type {
  LandingPage,
  CreateLandingPageInput,
  LandingPageFeature,
  LandingPageFaq,
} from "@/modules/landing-page/types";
import { getApiErrorMessage } from "@/lib/api/api-error";

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const DEFAULT_FAQS: LandingPageFaq[] = [
  {
    question: "পণ্যটি হাতে পাওয়ার পর কি মূল্য পরিশোধ করা যাবে?",
    answer: "হ্যাঁ, অবশ্যই। সারা বাংলাদেশে সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা রয়েছে। পণ্য ডেলিভারি ম্যানের কাছ থেকে বুঝে পেয়ে টাকা পরিশোধ করবেন।",
  },
  {
    question: "সাইজ না মিললে পরিবর্তন করা যাবে কি?",
    answer: "হ্যাঁ, সাইজ সংক্রান্ত যেকোনো সমস্যায় আপনি পণ্য হাতে পাওয়ার ৩ দিনের মধ্যে আমাদের কাস্টমার সাপোর্টে যোগাযোগ করে সহজেই সাইজ এক্সচেঞ্জ করে নিতে পারবেন।",
  },
  {
    question: "ডেলিভারি চার্জ কত এবং কতদিনে পণ্য হাতে পাব?",
    answer: "ঢাকার ভেতরে ডেলিভারি চার্জ সাধারণত ৭০ টাকা (১-২ দিনে) এবং ঢাকার বাইরে ১৩০ টাকা (২-৩ দিনে)। নিচের অর্ডার ফর্মে আপনার জেলা সিলেক্ট করলেই সঠিক চার্জ লাইভ দেখতে পাবেন।",
  },
];

const DEFAULT_FEATURES: LandingPageFeature[] = [
  { icon: "ShieldCheck", title: "১০০% কালার ও কোয়ালিটি গ্যারান্টি", description: "ধোয়ার পর রঙ উঠবে না বা কাপড় ছোট হবে না।" },
  { icon: "Sparkles", title: "প্রিমিয়াম সুতি ফেব্রিক", description: "অতিরিক্ত নরম, বাতাস চলাচলের উপযোগী ও অত্যন্ত আরামদায়ক।" },
  { icon: "Truck", title: "সারা বাংলাদেশে দ্রুত হোম ডেলিভারি", description: "২-৩ দিনের মধ্যে আপনার ঠিকানায় সরাসরি ডেলিভারি।" },
  { icon: "RotateCcw", title: "সহজ রিটার্ন পলিসি", description: "ডেলিভারি ম্যানের সামনে দেখে বুঝে নেওয়ার পূর্ণ সুবিধা।" },
];

interface LandingPageFormProps {
  initialData?: LandingPage;
  isEdit?: boolean;
}

export function LandingPageForm({ initialData, isEdit = false }: LandingPageFormProps) {
  const router = useRouter();
  const { data: productsData, isLoading: isProductsLoading } = useListPublicProductsQuery({
    limit: 100,
  });
  const products = productsData?.data || [];

  const [createLandingPage, { isLoading: isCreating }] = useCreateLandingPageMutation();
  const [updateLandingPage, { isLoading: isUpdating }] = useUpdateLandingPageMutation();
  const [uploadDescription] = useUploadDescriptionImageMutation();

  const [formData, setFormData] = useState<CreateLandingPageInput>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    productId: initialData?.productId || (products[0]?.id ?? 0),
    badgeText: initialData?.badgeText || "৫০% বিশেষ ছাড় · সীমিত সময়ের অফার!",
    headline: initialData?.headline || "",
    subHeadline: initialData?.subHeadline || "",
    videoUrl: initialData?.videoUrl || "",
    countdownTarget: initialData?.countdownTarget
      ? new Date(initialData.countdownTarget).toISOString().slice(0, 16)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    features: initialData?.features?.length ? initialData.features : DEFAULT_FEATURES,
    gallery: initialData?.gallery?.length ? initialData.gallery : [],
    faqs: initialData?.faqs?.length ? initialData.faqs : DEFAULT_FAQS,
    customContent: initialData?.customContent || "",
    isPublished: initialData?.isPublished ?? true,
  });

  const [uploadLandingPageImage] = useUploadLandingPageImageMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // When product is selected on new page, prefill title, slug, and gallery
  const handleProductChange = (productId: number) => {
    const selectedProd = products.find((p) => p.id === productId);
    if (!selectedProd) return;
    const prodSlug = toSlug(selectedProd.name);

    setFormData((prev) => ({
      ...prev,
      productId,
      // By default slug is the product name (e.g. yourdomain.com/deal/summer-panjabi)
      slug: !isEdit || !prev.slug ? prodSlug : prev.slug,
      title: prev.title || selectedProd.name,
      headline: prev.headline || selectedProd.name,
      subHeadline: prev.subHeadline || selectedProd.shortDescription || "",
      gallery: (prev.gallery || []).length
        ? prev.gallery
        : (selectedProd.images?.map((img) => img.imageUrl) || []),
    }));
  };

  // Auto-slugify from title if slug not manually edited
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEdit && !prev.slug ? toSlug(title) : prev.slug,
    }));
  };

  // Feature operations
  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), { icon: "Check", title: "", description: "" }],
    }));
  };

  const handleUpdateFeature = (index: number, field: keyof LandingPageFeature, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  // FAQ operations
  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const handleUpdateFaq = (index: number, field: keyof LandingPageFaq, value: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index),
    }));
  };

  // Gallery file upload operations
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadLandingPageImage(file).unwrap();
        if (res?.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          gallery: [...(prev.gallery || []), ...uploadedUrls],
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to upload image."));
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  };

  const handleImportProductImages = () => {
    const selectedProd = products.find((p) => p.id === formData.productId);
    if (!selectedProd?.images?.length) {
      toast.info("This product has no images to import.");
      return;
    }
    const newImgs = selectedProd.images.map((img) => img.imageUrl);
    setFormData((prev) => ({
      ...prev,
      gallery: Array.from(new Set([...(prev.gallery || []), ...newImgs])),
    }));
    toast.success(`${newImgs.length} images imported from product.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the landing page.");
      return;
    }
    if (!formData.productId) {
      toast.error("Please select a product for this landing page.");
      return;
    }

    try {
      const payload: CreateLandingPageInput = {
        title: formData.title.trim(),
        slug: formData.slug?.trim() || toSlug(formData.title.trim()),
        productId: Number(formData.productId),
        badgeText: formData.badgeText?.trim() || null,
        headline: formData.headline?.trim() || null,
        subHeadline: formData.subHeadline?.trim() || null,
        videoUrl: formData.videoUrl?.trim() || null,
        countdownTarget: formData.countdownTarget
          ? new Date(formData.countdownTarget).toISOString()
          : null,
        features: formData.features,
        gallery: formData.gallery,
        faqs: formData.faqs,
        customContent: formData.customContent?.trim() || null,
        isPublished: formData.isPublished,
      };

      if (isEdit && initialData?.id) {
        await updateLandingPage({ id: initialData.id, body: payload }).unwrap();
        toast.success("Landing page updated successfully!");
      } else {
        await createLandingPage(payload).unwrap();
        toast.success("Landing page created successfully!");
      }

      router.push("/admin/landing-pages");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save landing page."));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/landing-pages"
            className="flex size-9 items-center justify-center rounded-xl border bg-card hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit Landing Page" : "Create New Landing Page"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up high-converting marketing hooks, promo timer, and 1-click express checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/landing-pages"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="gap-2 rounded-xl font-bold"
          >
            {(isCreating || isUpdating) ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isEdit ? "Save Changes" : "Publish Landing Page"}</span>
          </Button>
        </div>
      </div>

      {/* ── Section 1: Product & URL ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Package className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Target Product & Public URL</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Product Select */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">
              Select Product <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => handleProductChange(Number(e.target.value))}
              disabled={isProductsLoading}
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose a product from your catalog</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.brand ? `(${p.brand.name})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Selecting a product automatically loads its variants (Color, Size) into the 1-click order form.
            </p>
          </div>

          {/* Internal Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Page Internal Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Cotton Polo T-Shirt Mega Offer"
              required
              className="h-10"
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Custom URL Slug <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center rounded-md border border-input bg-muted/40 px-3">
              <span className="text-xs text-muted-foreground font-mono">/deal/</span>
              <input
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  })
                }
                placeholder="summer-panjabi"
                required
                className="h-10 w-full bg-transparent px-1 text-sm font-mono focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Direct link (e.g. <code>yourdomain.com/deal/summer-panjabi</code>) for Facebook/TikTok ads. By default it uses the product name.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Marketing Hooks & Video ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b pb-3">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Marketing Hooks, Promo & Video</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Promo Badge */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Promotional Badge Text
            </label>
            <Input
              value={formData.badgeText || ""}
              onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
              placeholder="e.g. ৫০% বিশেষ ছাড় · সীমিত সময়ের অফার!"
              className="h-10"
            />
          </div>

          {/* Countdown Timer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              Offer Countdown End Time (FOMO Timer)
            </label>
            <Input
              type="datetime-local"
              value={formData.countdownTarget || ""}
              onChange={(e) => setFormData({ ...formData, countdownTarget: e.target.value })}
              className="h-10"
            />
          </div>

          {/* Headline */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">
              Main Landing Headline
            </label>
            <Input
              value={formData.headline || ""}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. ১০০% প্রিমিয়াম সুতি কম্বড কটন পোলো টি-শার্ট"
              className="h-10 font-semibold"
            />
          </div>

          {/* Sub-headline */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground">
              Sub-headline / Short Hook Description
            </label>
            <Textarea
              value={formData.subHeadline || ""}
              onChange={(e) => setFormData({ ...formData, subHeadline: e.target.value })}
              placeholder="e.g. গরমে আরামদায়ক ব্যবহারের জন্য উন্নত ফেব্রিক ও নিখুঁত স্টিচিং। ক্যাশ অন ডেলিভারিতে অর্ডার করুন, পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।"
              className="min-h-20 text-xs"
            />
          </div>

          {/* YouTube Video URL */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Video className="size-4 text-primary" />
              YouTube Video Embed URL (Optional)
            </label>
            <Input
              value={formData.videoUrl || ""}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-10"
            />
            <p className="text-[11px] text-muted-foreground">
              Paste a normal YouTube video URL. It will automatically embed a responsive video player on the landing page.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Key Features & Benefits ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Key Features & Benefit Points</h2>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddFeature}
            className="gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Point</span>
          </Button>
        </div>

        <div className="space-y-3">
          {(formData.features || []).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3">
              <div className="flex-1 grid gap-2 sm:grid-cols-2">
                <Input
                  value={feat.title}
                  onChange={(e) => handleUpdateFeature(idx, "title", e.target.value)}
                  placeholder="Feature Title (e.g. ১০০% কালার গ্যারান্টি)"
                  className="h-9 text-xs font-semibold"
                />
                <Input
                  value={feat.description || ""}
                  onChange={(e) => handleUpdateFeature(idx, "description", e.target.value)}
                  placeholder="Short explanation (e.g. ধোয়ার পর রঙ উঠবে না বা ফেড হবে না)"
                  className="h-9 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="text-muted-foreground hover:text-destructive p-1.5"
                title="Remove"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Showcase Photo Gallery ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Showcase Photo Gallery</h2>
              <p className="text-xs text-muted-foreground">Upload images from your device or import directly from product</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleImportProductImages}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Package className="size-3.5" />
              <span>Import Product Photos</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isUploadingFiles}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs font-bold cursor-pointer"
            >
              {isUploadingFiles ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              <span>{isUploadingFiles ? "Uploading..." : "Upload New Images"}</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Gallery Grid */}
        {(formData.gallery || []).length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-muted/20 hover:bg-muted/40 cursor-pointer transition text-center gap-2"
          >
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Upload className="size-5" />
            </div>
            <p className="text-xs font-bold text-foreground">Click here to upload showcase images from your computer</p>
            <p className="text-[11px] text-muted-foreground">Supports PNG, JPG, WEBP (Multiple files allowed)</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {(formData.gallery || []).map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl border bg-muted/40 overflow-hidden group shadow-xs"
              >
                <img
                  src={mediaUrl(imgUrl)}
                  alt={`Gallery item ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 5: FAQs ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Frequently Asked Questions (FAQs)</h2>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddFaq}
            className="gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Add Question</span>
          </Button>
        </div>

        <div className="space-y-4">
          {(formData.faqs || []).map((faq, idx) => (
            <div key={idx} className="rounded-xl border bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                  placeholder="Question (e.g. পণ্যটি হাতে পাওয়ার পর কি টাকা দেওয়া যাবে?)"
                  className="h-9 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="text-muted-foreground hover:text-destructive p-1.5"
                  title="Remove FAQ"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Textarea
                value={faq.answer}
                onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                placeholder="Answer explanation..."
                className="min-h-16 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 6: Additional Rich Text Content ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Layers className="size-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Custom Story / Rich Content (Optional)</h2>
        </div>
        <RichTextEditor
          id="customContent"
          imageTitle={formData.title}
          value={formData.customContent || ""}
          onChange={(html) => setFormData({ ...formData, customContent: html })}
          uploadImage={async (file) => {
            try {
              return mediaUrl((await uploadDescription(file).unwrap()).data.url);
            } catch (err) {
              throw new Error(getApiErrorMessage(err, "Failed to upload image"));
            }
          }}
        />
      </div>

      {/* ── Section 7: Publishing Status & Submit ── */}
      <div className="flex items-center justify-between rounded-2xl border bg-card p-5 shadow-xs">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-semibold">Publish this landing page immediately</span>
        </label>

        <Button
          type="submit"
          disabled={isCreating || isUpdating}
          className="gap-2 rounded-xl font-bold"
        >
          {(isCreating || isUpdating) && <Loader2 className="size-4 animate-spin" />}
          <span>{isEdit ? "Save Changes" : "Create & Launch Landing Page"}</span>
        </Button>
      </div>
    </form>
  );
}
