import { whatsappOrderUrl } from "@/lib/whatsapp";

const defaultClassName =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#1f8f5f]/25 bg-[#eafaf1] px-6 py-3 text-sm font-semibold text-[#0f6b45] transition hover:bg-[#dcf5e8]";

/**
 * Secondary order path that needs no app install or login. Renders nothing
 * when no WhatsApp number is configured, so the layout never shows a dead CTA.
 */
export function OrderOnWhatsAppButton({
  className = defaultClassName,
  label = "Order on WhatsApp",
  productName,
  productPath,
}: {
  className?: string;
  label?: string;
  productName?: string;
  productPath?: string;
}) {
  const href = whatsappOrderUrl({ productName, productPath });
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-cta="whatsapp-order"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 fill-current"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.25.7-1.44 1.33-1.98 1.38-.55.05-1.06.25-3.56-.74-3-1.19-4.9-4.33-5.05-4.53-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.17 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.52.25.6.85 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.34 1.45.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
      </svg>
      {label}
    </a>
  );
}
