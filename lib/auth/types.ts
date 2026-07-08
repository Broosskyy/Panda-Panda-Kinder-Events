export type AdminRoleSlug =
  | "administrator"
  | "manager"
  | "employee"
  | "editor"
  | "accounting"
  | "readonly";

export interface AdminRole {
  id: string;
  slug: AdminRoleSlug;
  label: string;
  is_system: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  role_id: string;
  active: boolean;
  avatar: string | null;
  phone: string | null;
  totp_enabled: boolean;
  totp_secret: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface AdminUserPublic {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role_id: string;
  role_slug: AdminRoleSlug;
  role_label: string;
  active: boolean;
  avatar: string | null;
  phone: string | null;
  totp_enabled: boolean;
  last_login: string | null;
  team_member_id: string | null;
  team_member_name: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent: string | null;
  device_label: string | null;
  ip_hash: string | null;
  trusted_until: string | null;
  last_active_at: string;
  expires_at: string;
  created_at: string;
}

export interface AdminContext {
  userId: string;
  displayName: string;
  email: string;
  roleSlug: AdminRoleSlug;
  permissions: string[];
  sessionId: string;
}

export interface LoginPolicy {
  maxAttempts: number;
  lockoutMinutes: number;
  sessionHours: number;
  rememberDays: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
}

export interface RateLimitPolicy {
  loginPerIp: number;
  windowMinutes: number;
}

export interface AuditLogInput {
  action: string;
  area: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  success?: boolean;
  errorMessage?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceLabel?: string | null;
  osLabel?: string | null;
  browserLabel?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
}

export interface LoginHistoryFilters {
  userId?: string;
  from?: string;
  to?: string;
  ipMasked?: string;
  device?: string;
  success?: boolean;
  limit?: number;
}

export interface AuditLogFilters {
  limit?: number;
  area?: string;
  action?: string;
  userId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface TeamSocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}
