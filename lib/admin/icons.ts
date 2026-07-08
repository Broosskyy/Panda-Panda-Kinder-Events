import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Cpu,
  FileText,
  HelpCircle,
  History,
  Home,
  Image,
  Inbox,
  Layout,
  Mail,
  Monitor,
  Newspaper,
  Receipt,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Star,
  UserCog,
  Users,
} from "lucide-react";

export const ADMIN_ICON_MAP: Record<string, LucideIcon> = {
  Home,
  BookOpen,
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
  Monitor,
  History,
  ScrollText,
  Mail,
  Cpu,
};

export function resolveAdminIcon(key: string): LucideIcon {
  return ADMIN_ICON_MAP[key] ?? Star;
}
