import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { computeStreak, hasStartedToday } from '../../src/streak';

function local(y: number, m: number, d: number, h = 12): number {
  return new Date(y, m - 1, d, h).getTime();
}

describe('computeStreak', () => {
  it('geeft 0 zonder sessies', () => {
    expect(computeStreak([], local(2024, 6, 15))).toBe(0);
  });

  it('geeft 1 als er alleen vandaag begonnen is', () => {
    const now = local(2024, 6, 15, 18);
    expect(computeStreak([local(2024, 6, 15, 9)], now)).toBe(1);
  });

  it('telt door tot gisteren als vandaag nog niets gestart is (niet gebroken)', () => {
    const now = local(2024, 6, 15, 8);
    const starts = [local(2024, 6, 13, 10), local(2024, 6, 14, 10)];
    expect(computeStreak(starts, now)).toBe(2);
  });

  it('breekt de reeks bij een gat van een hele dag', () => {
    const now = local(2024, 6, 15, 12);
    // 13 juni ontbreekt: 14 en 15 juni tellen nog mee, 12 juni niet meer.
    const starts = [
      local(2024, 6, 11, 10),
      local(2024, 6, 12, 10),
      local(2024, 6, 14, 10),
      local(2024, 6, 15, 10),
    ];
    expect(computeStreak(starts, now)).toBe(2);
  });

  it('telt meerdere sessies op één dag als één dag', () => {
    const now = local(2024, 6, 15, 20);
    const starts = [
      local(2024, 6, 15, 8),
      local(2024, 6, 15, 12),
      local(2024, 6, 15, 19),
      local(2024, 6, 14, 9),
    ];
    expect(computeStreak(starts, now)).toBe(2);
  });

  describe('zomer- en wintertijd', () => {
    const originalTz = process.env.TZ;

    beforeEach(() => {
      process.env.TZ = 'Europe/Amsterdam';
    });

    afterEach(() => {
      process.env.TZ = originalTz;
    });

    it('blijft correct doortellen over de overgang naar zomertijd (31 maart 2024)', () => {
      // In de nacht van 31 maart springt de klok van 02:00 naar 03:00 (23-urige dag).
      const now = local(2024, 4, 1, 12);
      const starts = [
        local(2024, 3, 29, 10),
        local(2024, 3, 30, 10),
        local(2024, 3, 31, 10),
        local(2024, 4, 1, 10),
      ];
      expect(computeStreak(starts, now)).toBe(4);
    });

    it('blijft correct doortellen over de overgang naar wintertijd (27 oktober 2024)', () => {
      // In de nacht van 27 oktober springt de klok terug van 03:00 naar 02:00 (25-urige dag).
      const now = local(2024, 10, 28, 12);
      const starts = [
        local(2024, 10, 25, 10),
        local(2024, 10, 26, 10),
        local(2024, 10, 27, 10),
        local(2024, 10, 28, 10),
      ];
      expect(computeStreak(starts, now)).toBe(4);
    });
  });
});

describe('hasStartedToday', () => {
  it('is waar als er een sessie vandaag is', () => {
    const now = local(2024, 6, 15, 12);
    expect(hasStartedToday([local(2024, 6, 15, 8)], now)).toBe(true);
  });

  it('is onwaar zonder sessie vandaag', () => {
    const now = local(2024, 6, 15, 12);
    expect(hasStartedToday([local(2024, 6, 14, 8)], now)).toBe(false);
  });
});
