/**
 * White-label tenant context — prepared for multi-tenant runtime.
 * Current deployment uses a single tenant (null id) with CMS in site_settings.
 */

export interface EmailTenantContext {
  tenantId: string | null;
  siteSettingsKey: string;
}

let cachedTenant: EmailTenantContext | null = null;

/** Resolve tenant for the current request/deployment */
export function getEmailTenantContext(): EmailTenantContext {
  if (cachedTenant) return cachedTenant;

  const tenantId = process.env.EMAIL_TENANT_ID?.trim() || null;
  cachedTenant = {
    tenantId,
    siteSettingsKey: tenantId ? `email:${tenantId}` : "email",
  };
  return cachedTenant;
}

export function clearEmailTenantCache(): void {
  cachedTenant = null;
}
