import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Layout,
  Newspaper,
  Receipt,
  Settings,
  Shield,
  Sparkles,
  Star,
  UserCog,
  Users,
} from "lucide-react";

export const ADMIN_ICON_MAP: Record<string, LucideIcon> = {
  Home,
  BarChart3,
  Users,
  FileText,
  Receipt,
  Layout,
  Sparkles,
  Image,
  Newspaper,
  HelpCircle,
  Inbox,
  Star,
  UserCog,
  Settings,
  Shield,
};

export function resolveAdminIcon(key: string): LucideIcon {
  return ADMIN_ICON_MAP[key] ?? Star;
}
