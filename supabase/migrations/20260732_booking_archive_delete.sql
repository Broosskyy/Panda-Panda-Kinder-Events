-- Booking archive + delete permission
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_booking_requests_archived ON booking_requests (archived_at);

INSERT INTO admin_permissions (slug, label, area)
VALUES ('inquiries:delete', 'Anfragen löschen', 'crm')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.slug = 'inquiries:delete'
WHERE r.slug IN ('administrator', 'manager')
ON CONFLICT DO NOTHING;
