import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${siteConfig.contact.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="safe-bottom safe-right fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-xl active:translate-y-0 md:h-16 md:w-16"
      aria-label="WhatsApp Chat öffnen"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
