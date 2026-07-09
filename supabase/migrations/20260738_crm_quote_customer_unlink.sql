-- Allow detaching draft/sent quotes from a customer (invoices stay bound).
ALTER TABLE crm_quotes
  ALTER COLUMN customer_id DROP NOT NULL;
