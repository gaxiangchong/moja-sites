const DEFAULT_MS = 5_000;

export function memberApiTimeoutMs(): number {
  const raw = process.env.MEMBER_API_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_MS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MS;
}

/** fetch() that fails fast instead of hanging until the host gateway times out. */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Response> {
  const { next, ...rest } = init ?? {};
  return fetch(url, {
    ...rest,
    next,
    signal: AbortSignal.timeout(memberApiTimeoutMs()),
  });
}
