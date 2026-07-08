import { z } from "zod";

export const cmsServiceSchema = z.object({
  icon_key: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  detail_text: z.string().trim().max(5000).optional(),
  image_url: z.string().trim().max(2000).optional(),
  button_label: z.string().trim().max(80).optional(),
  button_link: z.string().trim().max(500).optional(),
  category: z.string().trim().max(80).optional(),
  price_from: z.string().trim().max(40).optional(),
  highlights: z.array(z.string().trim().max(120)).max(12).optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  visible: z.boolean().optional(),
});

export const cmsServicePatchSchema = cmsServiceSchema.partial();

export const cmsFaqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(5000),
  sort_order: z.number().int().min(0).max(9999).optional(),
  visible: z.boolean().optional(),
});

export const cmsFaqPatchSchema = cmsFaqSchema.partial();

export const galleryImageInsertSchema = z.object({
  storage_path: z.string().trim().min(1).max(300),
  title: z.string().trim().max(120).optional(),
  alt_text: z.string().trim().max(200).optional(),
  category: z.string().trim().max(50).optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  visible: z.boolean().optional(),
});

export const galleryImagePatchSchema = z.object({
  title: z.string().trim().max(120).optional(),
  alt_text: z.string().trim().max(200).optional(),
  category: z.string().trim().max(50).optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  visible: z.boolean().optional(),
  storage_path: z.string().trim().min(1).max(300).optional(),
});
