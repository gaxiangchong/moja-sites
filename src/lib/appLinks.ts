/** Member app — all ordering happens here. */
export const MEMBER_APP_URL =
  process.env.NEXT_PUBLIC_MEMBER_APP_URL?.trim().replace(/\/$/, "") ||
  "https://app.mojamaison.com";
