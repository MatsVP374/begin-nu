import type { ActiveTimer, TimerKind } from './types';

/**
 * Timerlogica op basis van een absoluut endAt-tijdstip. Nooit aftellen op
 * basis van intervallen: dat blijft goed lopen als de app naar de
 * achtergrond gaat, het scherm op slot gaat of de pagina herlaadt.
 */

export function createTimer(
  kind: TimerKind,
  sessionId: string,
  minutes: number,
  now: number = Date.now(),
): ActiveTimer {
  return {
    kind,
    sessionId,
    startedAt: now,
    endAt: now + minutes * 60_000,
    totalSeconds: minutes * 60,
  };
}

export function remainingSeconds(timer: ActiveTimer, now: number = Date.now()): number {
  return Math.max(0, (timer.endAt - now) / 1000);
}

export function isFinished(timer: ActiveTimer, now: number = Date.now()): boolean {
  return now >= timer.endAt;
}

export function progressRatio(timer: ActiveTimer, now: number = Date.now()): number {
  if (timer.totalSeconds <= 0) return 1;
  const elapsed = (now - timer.startedAt) / 1000;
  return Math.min(1, Math.max(0, elapsed / timer.totalSeconds));
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${rest < 10 ? '0' : ''}${rest}`;
}

/**
 * Minuten die meetellen voor de sessie, of de timer nu natuurlijk afliep of
 * halverwege gestopt is. Pauzes leveren geen minuten op. Afgerond op 1 decimaal.
 */
export function creditedMinutes(timer: ActiveTimer, now: number = Date.now()): number {
  if (timer.kind === 'break') return 0;
  const end = Math.min(timer.endAt, now);
  const ms = Math.max(0, end - timer.startedAt);
  return Math.round((ms / 60_000) * 10) / 10;
}
