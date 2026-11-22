const DAY = 86_400_000;

function toUtcNoon(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** "Sunday 22 November 2026" */
export function formatLongDate(iso: string): string {
  return toUtcNoon(iso)
    .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .replace(',', '');
}

/** "Sat 21 Nov" */
export function formatShortDate(iso: string): string {
  return toUtcNoon(iso)
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .replace(',', '');
}

/** Norwegian weekday, lower case as written in Norwegian: "søndag" */
export function norwegianWeekday(iso: string): string {
  return toUtcNoon(iso).toLocaleDateString('nb-NO', { weekday: 'long', timeZone: 'UTC' });
}

export function dayOfMonth(iso: string): string {
  return String(toUtcNoon(iso).getUTCDate());
}

export function shortMonth(iso: string): string {
  return toUtcNoon(iso).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
}

/** "November 2026" */
export function monthYear(iso: string): string {
  return toUtcNoon(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Whole days from `fromIso` to `toIso` (both YYYY-MM-DD). */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((toUtcNoon(toIso).getTime() - toUtcNoon(fromIso).getTime()) / DAY);
}

/** "Today", "Tomorrow", "In 7 days" */
export function relativeDays(fromIso: string, toIso: string): string {
  const n = daysBetween(fromIso, toIso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return `In ${n} days`;
}
