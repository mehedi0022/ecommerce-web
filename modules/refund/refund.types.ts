export type RefundStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type RefundMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "MOBILE_BANKING"
  | "ORIGINAL_PAYMENT_METHOD"
  | "OTHER";

export interface RefundStatusHistory {
  id: number;
  fromStatus: RefundStatus | null;
  toStatus: RefundStatus;
  note: string | null;
  changedById: number | null;
  createdAt: string;
}

export interface RefundOrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
}

export interface RefundReturnSummary {
  id: number;
  returnNumber: string;
  status: string;
}

export interface Refund {
  id: number;
  refundNumber: string;
  orderId: number;
  returnId: number | null;
  amount: string | number;
  status: RefundStatus;
  method: RefundMethod | null;
  reason: string | null;
  note: string | null;
  processedById: number | null;
  processedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  order?: RefundOrderSummary;
  return?: RefundReturnSummary;
  statusHistory?: RefundStatusHistory[];
}

export interface CreateRefundInput {
  amount: number;
  method?: RefundMethod;
  reason?: string;
  note?: string;
}

export interface TransitionRefundInput {
  status: RefundStatus;
  note?: string;
}
