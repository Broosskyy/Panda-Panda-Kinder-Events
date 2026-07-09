export type PushPermissionState = "default" | "granted" | "denied";

export type PushUiStatus =
  | "unsupported"
  | "not_configured"
  | "not_asked"
  | "blocked"
  | "granted"
  | "granted_not_registered"
  | "activated";

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface PushDiagnostics {
  userActiveSubscriptionCount: number;
  totalAdminSubscriptionCount: number;
  receivesInquiryPush: boolean;
  roleSlug: string;
  dbSubscription: {
    id: string;
    endpoint: string;
    enabled: boolean;
    revokedAt: string | null;
  } | null;
}

export interface PushSendErrorDetail {
  subscriptionId: string;
  endpoint: string;
  statusCode?: number;
  message: string;
  expired: boolean;
}

export interface PushSendDetailedResult {
  sent: number;
  failed: number;
  errors: PushSendErrorDetail[];
}

export interface InquiryPushResult extends PushSendDetailedResult {
  recipientsCount: number;
  skippedReason?: string;
}

export interface PushStatusResponse {
  configured: boolean;
  publicKey: string | null;
  status: PushUiStatus;
  subscribed: boolean;
  canActivate: boolean;
  canTest: boolean;
  canDeactivate: boolean;
  permission: string;
  setupGuide: string;
  diagnostics?: PushDiagnostics;
}

export interface PushTestResponse {
  success?: boolean;
  sent?: number;
  failed?: number;
  errors?: PushSendErrorDetail[];
  error?: string;
  warning?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: {
    url?: string;
    type?: string;
  };
}

export interface StoredPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
