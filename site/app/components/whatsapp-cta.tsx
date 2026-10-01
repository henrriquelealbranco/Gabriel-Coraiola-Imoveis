import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/properties/format";
import type { Property } from "@/lib/properties/types";

export function WhatsAppCta({ property, phone }: { property: Pick<Property, "title" | "code">; phone: string }) {
  return <a className="conversion-whatsapp" href={buildWhatsAppUrl(property, phone)} target="_blank" rel="noreferrer"><MessageCircle /> Clique aqui para receber mais informações</a>;
}
