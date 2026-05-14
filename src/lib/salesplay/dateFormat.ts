const KL_TZ = "Asia/Kuala_Lumpur";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Y-m-d in Kuala Lumpur */
export function formatDateKl(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

/** Y-m-d H:i:s in Kuala Lumpur */
export function formatDateTimeKl(d: Date): string {
  const dPart = formatDateKl(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: KL_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
  const [hh, mm, ss] = time.split(":");
  return `${dPart} ${pad2(Number(hh))}:${pad2(Number(mm))}:${pad2(Number(ss))}`;
}
