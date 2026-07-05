import { z } from "zod";

export const crmCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.literal("")),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  status: z.enum(["active", "inactive", "lead"]).default("active"),
});

export const crmLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(9999),
  unit_price_cents: z.number().int().min(0),
  sort_order: z.number().int().min(0).optional(),
});

export const crmQuoteSchema = z.object({
  customer_id: z.string().uuid(),
  booking_request_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200).default("Angebot"),
  status: z.enum(["draft", "sent", "confirmed", "paid", "open", "cancelled"]).default("draft"),
  remarks: z.string().max(5000).optional().nullable(),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(19),
  valid_until: z.string().optional().nullable(),
  items: z.array(crmLineItemSchema).min(1),
});

export const crmInvoiceSchema = z.object({
  customer_id: z.string().uuid(),
  quote_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(200).default("Rechnung"),
  status: z.enum(["draft", "sent", "confirmed", "paid", "open", "cancelled"]).default("draft"),
  remarks: z.string().max(5000).optional().nullable(),
  discount_percent: z.number().min(0).max(100).default(0),
  tax_rate: z.number().min(0).max(100).default(19),
  issue_date: z.string().optional(),
  due_date: z.string().optional().nullable(),
  items: z.array(crmLineItemSchema).min(1),
});

export const crmStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "sent", "confirmed", "paid", "open", "cancelled"]),
});

export const createCustomerFromBookingSchema = z.object({
  booking_id: z.string().uuid(),
});
