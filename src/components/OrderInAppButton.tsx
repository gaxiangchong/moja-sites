import { MEMBER_APP_URL } from "@/lib/appLinks";

type Props = {
  className?: string;
  label?: string;
};

const defaultClassName =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-6 py-3 text-sm font-semibold text-[#050a14] shadow-[0_12px_32px_rgba(98,166,255,0.22)] transition hover:brightness-110";

export function OrderInAppButton({
  className = defaultClassName,
  label = "Order in app",
}: Props) {
  return (
    <a
      href={MEMBER_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
