export type Attribute = { id: number; name: string; slug: string; isActive: boolean; sortOrder?: number; values?: AttributeValue[] };
export type AttributeValue = { id: number; attributeId: number; value: string; slug: string; isActive: boolean; sortOrder?: number };
export type AttributeQuery = { page?: number; limit?: number; search?: string; status?: "ACTIVE" | "INACTIVE"; sortOrder?: "asc" | "desc" };
export type CategoryAttribute = { attributeId: number; isRequired: boolean; sortOrder: number; attribute?: Attribute };
