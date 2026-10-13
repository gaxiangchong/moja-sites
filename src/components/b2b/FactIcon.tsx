/**
 * Icons for the "At a glance" cards on /business. The key comes from
 * config/b2b.json ("icon"), so new facts can pick an icon without touching
 * code — an unknown or missing key falls back to a neutral dot rather than
 * leaving a hole in the card.
 */

type IconKey = "box" | "clock" | "truck" | "gift" | "sparkles" | "document";

const PATHS: Record<IconKey, React.ReactNode> = {
  // Stacked boxes — minimum order quantity.
  box: (
    <>
      <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 12l9 4.5L21 12" />
      <path d="M3 16.5 12 21l9-4.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  // Delivery van — coverage / where we deliver.
  truck: (
    <>
      <path d="M3 7.5h10.5v9H3z" />
      <path d="M13.5 11h3.8l2.7 2.8v2.7h-6.5z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
    </>
  ),
  // Gift box — packaging and branding.
  gift: (
    <>
      <path d="M3.5 9.5h17V13h-17z" />
      <path d="M5 13h14v7.5H5z" />
      <path d="M12 9.5v11" />
      <path d="M12 9.5S10.8 4 8.4 4a2.2 2.2 0 0 0 0 5.5M12 9.5S13.2 4 15.6 4a2.2 2.2 0 0 1 0 5.5" />
    </>
  ),
  // Sparkles — tasting samples.
  sparkles: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 19l2.3.8-2.3.8-.7 2.4" />
    </>
  ),
  // Document — invoicing and paperwork.
  document: (
    <>
      <path d="M6 3.5h7.5L19 9v11.5H6z" />
      <path d="M13.5 3.5V9H19" />
      <path d="M9 13h7M9 16.5h7" />
    </>
  ),
};

function isIconKey(value: string): value is IconKey {
  return value in PATHS;
}

export function FactIcon({ name, className }: { name: string; className?: string }) {
  if (!isIconKey(name)) {
    return (
      <span
        className="h-2 w-2 rounded-full bg-gradient-to-br from-[#62a6ff] to-[#57f0ff]"
        aria-hidden
      />
    );
  }

  return (
    <svg
      className={className ?? "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
