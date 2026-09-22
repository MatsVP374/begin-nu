/**
 * Kalenderdag-rekenwerk voor de reeks. Gebruikt Date#setDate/getDate zodat
 * zomer- en wintertijd-overgangen (die geen 24u duren) geen dagen overslaan
 * of dubbel tellen, in tegenstelling tot rekenen met vaste n * 86400000 ms.
 */

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(t: number, days: number): number {
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/**
 * Aantal opeenvolgende kalenderdagen tot en met vandaag waarop minstens één
 * sessie is gestart. Is er vandaag nog niets gestart, dan telt de reeks door
 * tot en met gisteren (niet gebroken); pas een hele dag zonder sessie breekt hem.
 */
export function computeStreak(sessionStartTimes: number[], now: number = Date.now()): number {
  const days = new Set(sessionStartTimes.map(dayKey));
  let cursor = now;
  if (!days.has(dayKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function hasStartedToday(sessionStartTimes: number[], now: number = Date.now()): boolean {
  return sessionStartTimes.some((t) => t >= startOfDay(now));
}
