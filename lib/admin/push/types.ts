export type PushPermissionState = "default" | "granted" | "denied";

export type PushUiStatus =
  | "unsupported"
  | "not_configured"
  | "not_asked"
  | "blocked"
  | "granted"
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
