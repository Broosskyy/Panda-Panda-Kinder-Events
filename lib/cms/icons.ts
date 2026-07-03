import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cake,
  Heart,
  Paintbrush,
  PartyPopper,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  Paintbrush,
  Heart,
  Cake,
  Building2,
  PartyPopper,
  Sparkles,
  Users,
  Star,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICON_MAP);

export function resolveServiceIcon(key: string): LucideIcon {
  return SERVICE_ICON_MAP[key] ?? Star;
}
