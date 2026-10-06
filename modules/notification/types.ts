export interface SmsProviderConfig {
  id: number;
  code: string;
  name: string;
  senderId: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  apiUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  settings: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: number;
  event: string;
  name: string;
  smsEnabled: boolean;
  smsTemplate: string | null;
  emailEnabled: boolean;
  emailSubject: string | null;
  emailTemplate: string | null;
  availableVars: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SmsLog {
  id: number;
  smsProviderConfigId: number | null;
  providerCode: string;
  recipientPhone: string;
  message: string;
  status: "PENDING" | "SENT" | "FAILED";
  responsePayload: any;
  orderId: number | null;
  createdAt: string;
}

export interface CreateSmsProviderInput {
  code: string;
  name: string;
  senderId?: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  isActive?: boolean;
}

export interface UpdateSmsProviderInput {
  name?: string;
  senderId?: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  isActive?: boolean;
  isDefault?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateNotificationTemplateInput {
  name?: string;
  smsEnabled?: boolean;
  smsTemplate?: string | null;
  emailEnabled?: boolean;
  emailSubject?: string | null;
  emailTemplate?: string | null;
}

export interface ProviderBalanceResult {
  balance: string | number;
  currency?: string;
  raw?: any;
}

export interface SendTestSmsResult {
  success: boolean;
  status: "PENDING" | "SENT" | "FAILED";
  errorMessage?: string;
  responsePayload?: any;
}
