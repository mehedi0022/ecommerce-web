export type ReturnStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

export type ReturnReason =
  | "DAMAGED"
  | "DEFECTIVE"
  | "WRONG_ITEM"
  | "NOT_AS_DESCRIBED"
  | "SIZE_OR_FIT"
  | "CHANGED_MIND"
  | "OTHER";

export type ReturnItemCondition =
  | "UNOPENED"
  | "GOOD"
  | "DAMAGED"
  | "DEFECTIVE"
  | "USED";

export type ReturnItemRestockStatus =
  | "PENDING"
  | "RESTOCKED"
  | "NOT_RESTOCKABLE";

export interface ReturnOrderItem {
  id: number;
  productName: string;
  sku: string;
  unitPrice: string | number;
  quantity: number;
  variantId: number | null;
}

export interface ReturnItem {
  id: number;
  orderItemId: number;
  quantity: number;
  reason: ReturnReason;
  customerNote: string | null;
  adminNote: string | null;
  condition: ReturnItemCondition | null;
  restockStatus: ReturnItemRestockStatus;
  restockQuantity: number;
  orderItem: ReturnOrderItem;
}

export interface ReturnStatusHistory {
  id: number;
  fromStatus: ReturnStatus | null;
  toStatus: ReturnStatus;
  note: string | null;
  changedById: number | null;
  createdAt: string;
}

export interface ReturnRefund {
  id: number;
  refundNumber: string;
  amount: string | number;
  status: string;
  method: string | null;
  createdAt: string;
}

export interface ReturnOrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  grandTotal: string;
  paymentMethod: string;
}

export interface Return {
  id: number;
  returnNumber: string;
  orderId: number;
  userId: number | null;
  status: ReturnStatus;
  customerNote: string | null;
  adminNote: string | null;
  requestedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: ReturnItem[];
  statusHistory: ReturnStatusHistory[];
  order?: ReturnOrderSummary;
  refunds?: ReturnRefund[];
}

export interface CreateReturnItemInput {
  orderItemId: number;
  quantity: number;
  reason: ReturnReason;
  customerNote?: string;
}

export interface CreateReturnInput {
  customerNote?: string;
  items: CreateReturnItemInput[];
}

export interface TransitionReturnInput {
  status: ReturnStatus;
  note?: string;
}

export interface InspectReturnItemInput {
  condition: ReturnItemCondition;
  adminNote?: string | null;
  restockQuantity: number;
}
