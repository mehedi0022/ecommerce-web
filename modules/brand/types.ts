export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandInput {
  name: string;
  logo?: string | null;
  description?: string | null;
  sortOrder?: number;
}

export interface BrandQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  sortBy?: "name" | "id" | "createdAt" | "sortOrder";
  sortOrder?: "asc" | "desc";
}
