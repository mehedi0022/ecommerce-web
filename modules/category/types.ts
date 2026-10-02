import type { PaginatedApiResponse } from "@/types/api.types";
export interface Category { id: number; name: string; slug: string; description: string | null; image: string | null; parentId: number | null; isActive: boolean; sortOrder: number; isLeaf?: boolean; path?: string; children?: Category[]; }
export interface CategoryInput { name: string; description?: string | null; image?: string | null; parentId?: number | null; sortOrder?: number; }
export interface CategoryQuery { page?: number; limit?: number; search?: string; parentId?: number | null; status?: "ACTIVE" | "INACTIVE"; }
export type CategoryListResponse = PaginatedApiResponse<Category>;
