-- Email templates: structured layout for enterprise template manager
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS layout_json jsonb DEFAULT NULL;
