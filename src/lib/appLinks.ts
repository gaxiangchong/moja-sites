/** Member app — all ordering happens here. */
export const MEMBER_APP_URL =
  process.env.NEXT_PUBLIC_MEMBER_APP_URL?.trim().replace(/\/$/, "") ||
  "https://app.mojamaison.com";

/** Set NEXT_PUBLIC_ORDERING_ENABLED=false to block ordering until launch. */
export const ORDERING_ENABLED =
  process.env.NEXT_PUBLIC_ORDERING_ENABLED?.trim().toLowerCase() !== "false";

/**
 * Shown when NEXT_PUBLIC_ORDERING_ENABLED=false. It now points at WhatsApp,
 * which still takes orders while in-app checkout is closed — a dead end here
 * loses a visitor who was ready to buy.
 */
export const ORDERING_CLOSED_MESSAGE =
  "In-app ordering isn't open yet — our official launch is coming soon. In the meantime, message us on WhatsApp and we'll take your order personally. Thank you for your patience!";
