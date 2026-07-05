import type { LucideIcon } from "lucide-react";
import {
  Award,
  Building2,
  Cake,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Paintbrush,
  Palette,
  PartyPopper,
  Shield,
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
  Award,
  Shield,
  MapPin,
  Palette,
  Calendar,
  Clock,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICON_MAP);

export function resolveServiceIcon(key: string): LucideIcon {
  return SERVICE_ICON_MAP[key] ?? Star;
}

export function resolveContentIcon(key: string): LucideIcon {
  return resolveServiceIcon(key);
}
