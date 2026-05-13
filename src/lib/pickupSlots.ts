/** Malaysia wall-clock day + slot → UTC instants (stored as timestamptz). */

export type PickupSlotId = "12-14" | "14-16" | "16-18" | "sun-10-1230";

const SLOT_MY = {
  "12-14": { startH: 12, startM: 0, endH: 14, endM: 0 },
  "14-16": { startH: 14, startM: 0, endH: 16, endM: 0 },
  "16-18": { startH: 16, startM: 0, endH: 18, endM: 0 },
  "sun-10-1230": { startH: 10, startM: 0, endH: 12, endM: 30 },
} as const;

function parseYmd(ymd: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

/** 0 = Sunday … 6 = Saturday (UTC date parts — we use calendar date string only). */
function weekdayFromYmd(ymd: string): number | null {
  const p = parseYmd(ymd);
  if (!p) return null;
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d, 12, 0, 0));
  return dt.getUTCDay();
}

/**
 * Build pickup window in Asia/Kuala_Lumpur (fixed +08:00) for a calendar date.
 */
export function pickupWindowFromDateAndSlot(
  dateYmd: string,
  slot: PickupSlotId,
):
  | { ok: true; start: Date; end: Date }
  | { ok: false; error: string } {
  if (!(slot in SLOT_MY)) {
    return { ok: false, error: "Invalid pickup slot" };
  }
  const p = parseYmd(dateYmd);
  if (!p) {
    return { ok: false, error: "Invalid pickup date" };
  }

  const wd = weekdayFromYmd(dateYmd);
  if (wd === null) return { ok: false, error: "Invalid pickup date" };

  if (slot === "sun-10-1230") {
    if (wd !== 0) {
      return { ok: false, error: "Sunday slot is only valid on Sunday" };
    }
  } else if (wd === 0) {
    return { ok: false, error: "Sunday pickup uses the Sunday morning slot only" };
  }

  const { startH, startM, endH, endM } = SLOT_MY[slot];
  const pad = (n: number) => String(n).padStart(2, "0");
  const startIso = `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(startH)}:${pad(startM)}:00+08:00`;
  const endIso = `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(endH)}:${pad(endM)}:00+08:00`;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
    return { ok: false, error: "Invalid pickup window" };
  }

  const now = Date.now();
  if (+start < now - 60_000) {
    return { ok: false, error: "Pickup time must be in the future" };
  }

  return { ok: true, start, end };
}
