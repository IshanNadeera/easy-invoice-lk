const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Today's date in the user's local time zone as YYYY-MM-DD (what <input type="date"> uses). */
export function todayISO(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function parseParts(iso: string): { y: number; m: number; d: number } | null {
  const match = ISO_DATE.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return { y, m, d };
}

/** True for a real calendar date between 2000 and 2100 in YYYY-MM-DD form. */
export function isValidISODate(iso: string): boolean {
  const parts = parseParts(iso);
  return parts !== null && parts.y >= 2000 && parts.y <= 2100;
}

/** "2026-11-02" -> "2 Nov 2026". Locale-independent so preview and PDF always match. Empty for invalid input. */
export function formatDisplayDate(iso: string): string {
  const parts = parseParts(iso);
  if (!parts) return '';
  return `${parts.d} ${MONTHS[parts.m - 1]} ${parts.y}`;
}
