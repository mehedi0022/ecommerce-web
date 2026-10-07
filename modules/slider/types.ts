export interface Slider {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  storageKey?: string | null;
  mobileImage: string | null;
  mobileKey?: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSliderInput {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImage?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdateSliderInput {
  title?: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImage?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
}
