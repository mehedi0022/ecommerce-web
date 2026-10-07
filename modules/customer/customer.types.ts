export interface CustomerRole {
  id: number;
  key: string;
  name: string;
}

export interface CustomerItem {
  id: number;
  fullName: string;
  userName: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  role: CustomerRole;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CustomerListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: {
    items: CustomerItem[];
    summary: CustomerSummary;
    pagination: CustomerListPagination;
  };
}

export interface CustomerOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CustomerRecentOrder {
  id: number;
  orderNumber: string;
  placedAt: string;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  itemsCount: number;
  items: CustomerOrderItem[];
}

export interface CustomerAddress {
  id: number;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  division: string | null;
  district: string | null;
  upazila: string | null;
  thana: string | null;
  postalCode: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface CustomerDetailResponse {
  success: boolean;
  data: {
    customer: {
      id: number;
      fullName: string;
      userName: string | null;
      email: string;
      phone: string | null;
      isActive: boolean;
      emailVerifiedAt: string | null;
      role: CustomerRole;
      createdAt: string;
      updatedAt: string;
    };
    metrics: {
      totalOrders: number;
      totalSpent: number;
      averageOrderValue: number;
      deliveredOrders: number;
      cancelledOrders: number;
      pendingOrders: number;
    };
    recentOrders: CustomerRecentOrder[];
    addresses: CustomerAddress[];
  };
}

export interface CustomerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  sortBy?: "createdAt" | "totalSpent" | "totalOrders" | "fullName";
  sortOrder?: "asc" | "desc";
}
