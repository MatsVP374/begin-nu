import { addDays, startOfDay } from './streak';
import type { ExcuseEvent, Session } from './types';

export interface DayMinutes {
  date: Date;
  minutes: number;
}

/** Minuten per kalenderdag, de laatste `days` dagen, oudste eerst, vandaag laatst. */
export function minutesPerDay(
  sessions: Session[],
  now: number = Date.now(),
  days = 7,
): DayMinutes[] {
  const todayStart = startOfDay(now);
  const firstDayStart = addDays(todayStart, -(days - 1));
  const result: DayMinutes[] = [];
  for (let i = 0; i < days; i++) {
    const dayStart = addDays(firstDayStart, i);
    const dayEnd = addDays(dayStart, 1);
    const minutes = sessions
      .filter((s) => s.startedAt >= dayStart && s.startedAt < dayEnd)
      .reduce((sum, s) => sum + s.minutes, 0);
    result.push({ date: new Date(dayStart), minutes });
  }
  return result;
}

/** Start van de lopende 7-daagse week (vandaag en de 6 dagen ervoor). */
export function weekStart(now: number = Date.now()): number {
  return addDays(startOfDay(now), -6);
}

export function sessionsThisWeek(sessions: Session[], now: number = Date.now()): Session[] {
  const ws = weekStart(now);
  return sessions.filter((s) => s.startedAt >= ws);
}

export function minutesThisWeek(sessions: Session[], now: number = Date.now()): number {
  return sessionsThisWeek(sessions, now).reduce((sum, s) => sum + s.minutes, 0);
}

export function startsThisWeek(sessions: Session[], now: number = Date.now()): number {
  return sessionsThisWeek(sessions, now).length;
}

export interface SubjectMinutes {
  subject: string;
  minutes: number;
}

/** Minuten per vak deze week, hoog naar laag gesorteerd. */
export function minutesPerSubject(sessions: Session[], now: number = Date.now()): SubjectMinutes[] {
  const week = sessionsThisWeek(sessions, now);
  const map = new Map<string, number>();
  for (const s of week) {
    map.set(s.subject, (map.get(s.subject) ?? 0) + s.minutes);
  }
  return Array.from(map.entries())
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}

export interface ExcuseStats {
  /** Aantal keer dat "Ik begin straks…" gekozen is deze week. */
  chosenLater: number;
  /** Daarvan: aantal keer dat toch meteen begonnen is (via Terug). */
  startedAnyway: number;
}

export function excuseStats(events: ExcuseEvent[], now: number = Date.now()): ExcuseStats {
  const ws = weekStart(now);
  const week = events.filter((e) => e.at >= ws);
  return {
    chosenLater: week.length,
    startedAnyway: week.filter((e) => e.outcome === 'back').length,
  };
}
