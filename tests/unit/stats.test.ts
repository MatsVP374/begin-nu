import { describe, expect, it } from 'vitest';
import {
  excuseStats,
  minutesPerDay,
  minutesPerSubject,
  minutesThisWeek,
  startsThisWeek,
} from '../../src/stats';
import type { ExcuseEvent, Session } from '../../src/types';

function local(y: number, m: number, d: number, h = 12): number {
  return new Date(y, m - 1, d, h).getTime();
}

function session(overrides: Partial<Session>): Session {
  return {
    id: overrides.id ?? Math.random().toString(36),
    subject: 'Statistiek',
    firstStep: 'Boek openen',
    startedAt: local(2024, 6, 10),
    minutes: 0,
    blocks: 0,
    ...overrides,
  };
}

describe('minutesPerDay', () => {
  it('geeft 7 dagen terug, oudste eerst, met minuten per dag', () => {
    const now = local(2024, 6, 15, 20);
    const sessions: Session[] = [
      session({ startedAt: local(2024, 6, 15, 9), minutes: 12 }),
      session({ startedAt: local(2024, 6, 13, 9), minutes: 5 }),
      session({ startedAt: local(2024, 6, 1, 9), minutes: 99 }), // buiten bereik
    ];
    const days = minutesPerDay(sessions, now, 7);
    expect(days).toHaveLength(7);
    expect(days[0]?.date.getDate()).toBe(9);
    expect(days[6]?.date.getDate()).toBe(15);
    expect(days[6]?.minutes).toBe(12);
    expect(days[4]?.minutes).toBe(5);
    expect(days[0]?.minutes).toBe(0);
  });

  it('telt meerdere sessies op dezelfde dag bij elkaar op', () => {
    const now = local(2024, 6, 15, 20);
    const sessions: Session[] = [
      session({ startedAt: local(2024, 6, 15, 9), minutes: 10 }),
      session({ startedAt: local(2024, 6, 15, 15), minutes: 20 }),
    ];
    const days = minutesPerDay(sessions, now, 7);
    expect(days[6]?.minutes).toBe(30);
  });
});

describe('week-statistieken', () => {
  const now = local(2024, 6, 15, 20);
  const sessions: Session[] = [
    session({ subject: 'Statistiek', startedAt: local(2024, 6, 15, 9), minutes: 10 }),
    session({ subject: 'Statistiek', startedAt: local(2024, 6, 12, 9), minutes: 15 }),
    session({ subject: 'Frans', startedAt: local(2024, 6, 11, 9), minutes: 40 }),
    session({ subject: 'Statistiek', startedAt: local(2024, 5, 1, 9), minutes: 999 }), // buiten de week
  ];

  it('telt het aantal keer begonnen deze week', () => {
    expect(startsThisWeek(sessions, now)).toBe(3);
  });

  it('telt de minuten deze week op', () => {
    expect(minutesThisWeek(sessions, now)).toBe(65);
  });

  it('sorteert minuten per vak van hoog naar laag', () => {
    const perSubject = minutesPerSubject(sessions, now);
    expect(perSubject).toEqual([
      { subject: 'Frans', minutes: 40 },
      { subject: 'Statistiek', minutes: 25 },
    ]);
  });
});

describe('excuseStats', () => {
  it('telt hoe vaak "straks" gekozen is en hoe vaak er toch meteen begonnen is', () => {
    const now = local(2024, 6, 15, 20);
    const events: ExcuseEvent[] = [
      { id: '1', at: local(2024, 6, 14, 9), outcome: 'accepted' },
      { id: '2', at: local(2024, 6, 13, 9), outcome: 'back' },
      { id: '3', at: local(2024, 6, 13, 10), outcome: 'back' },
      { id: '4', at: local(2024, 5, 1, 9), outcome: 'back' }, // buiten de week
    ];
    expect(excuseStats(events, now)).toEqual({ chosenLater: 3, startedAnyway: 2 });
  });

  it('geeft nullen zonder events', () => {
    expect(excuseStats([], local(2024, 6, 15))).toEqual({ chosenLater: 0, startedAnyway: 0 });
  });
});
