import type { Product } from "@/modules/product/types";

export interface LandingPageFeature {
  icon?: string;
  title: string;
  description?: string;
}

export interface LandingPageFaq {
  question: string;
  answer: string;
}

export interface LandingPage {
  id: number;
  title: string;
  slug: string;
  productId: number;
  product?: Product;
  badgeText: string | null;
  headline: string | null;
  subHeadline: string | null;
  videoUrl: string | null;
  countdownTarget: string | null;
  features: LandingPageFeature[];
  gallery: string[];
  faqs: LandingPageFaq[];
  customContent: string | null;
  isPublished: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLandingPageInput {
  title: string;
  slug?: string;
  productId: number;
  badgeText?: string | null;
  headline?: string | null;
  subHeadline?: string | null;
  videoUrl?: string | null;
  countdownTarget?: string | null;
  features?: LandingPageFeature[];
  gallery?: string[];
  faqs?: LandingPageFaq[];
  customContent?: string | null;
  isPublished?: boolean;
}

export type UpdateLandingPageInput = Partial<CreateLandingPageInput>;

export interface LandingPageQuery {
  page?: number;
  limit?: number;
  search?: string;
  productId?: number;
  isPublished?: boolean;
}
