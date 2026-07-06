/** Member app — all ordering happens here. */
export const MEMBER_APP_URL =
  process.env.NEXT_PUBLIC_MEMBER_APP_URL?.trim().replace(/\/$/, "") ||
  "https://app.mojamaison.com";

/** Set NEXT_PUBLIC_ORDERING_ENABLED=false to block ordering until launch. */
export const ORDERING_ENABLED =
  process.env.NEXT_PUBLIC_ORDERING_ENABLED?.trim().toLowerCase() !== "false";

export const ORDERING_CLOSED_MESSAGE =
  "Our website is still under development. Ordering isn't open yet — please come back once our official launch is announced. Thank you for your patience!";
