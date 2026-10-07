export type PopupDisplayType = "ON_LOAD" | "EXIT_INTENT" | "AFTER_DELAY";
export type PopupFrequency = "ONCE" | "DAILY" | "ALWAYS";

export interface Popup {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  storageKey?: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  displayType: PopupDisplayType;
  delaySeconds: number;
  frequency: PopupFrequency;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePopupInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  displayType?: PopupDisplayType;
  delaySeconds?: number;
  frequency?: PopupFrequency;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdatePopupInput {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  displayType?: PopupDisplayType;
  delaySeconds?: number;
  frequency?: PopupFrequency;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}
