import { describe, expect, it } from 'vitest';
import {
  createTimer,
  creditedMinutes,
  formatClock,
  isFinished,
  remainingSeconds,
} from '../../src/timer';

describe('createTimer / remainingSeconds', () => {
  it('geeft de resterende tijd bij een gegeven now', () => {
    const t0 = 1_000_000;
    const timer = createTimer('start', 's1', 2, t0);
    expect(remainingSeconds(timer, t0)).toBe(120);
    expect(remainingSeconds(timer, t0 + 30_000)).toBe(90);
    expect(remainingSeconds(timer, t0 + 120_000)).toBe(0);
  });

  it('gaat niet onder 0 na afloop', () => {
    const t0 = 0;
    const timer = createTimer('block', 's1', 10, t0);
    expect(remainingSeconds(timer, t0 + 999_000)).toBe(0);
  });
});

describe('isFinished', () => {
  it('is onwaar terwijl de timer nog loopt', () => {
    const timer = createTimer('start', 's1', 2, 0);
    expect(isFinished(timer, 60_000)).toBe(false);
  });

  it('is waar zodra endAt bereikt of gepasseerd is', () => {
    const timer = createTimer('start', 's1', 2, 0);
    expect(isFinished(timer, 120_000)).toBe(true);
    expect(isFinished(timer, 500_000)).toBe(true);
  });
});

describe('formatClock', () => {
  it('formatteert minuten en seconden als m:ss', () => {
    expect(formatClock(120)).toBe('2:00');
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(5)).toBe('0:05');
    expect(formatClock(0)).toBe('0:00');
  });
});

describe('creditedMinutes', () => {
  it('telt de volledige duur mee bij een natuurlijk afgelopen timer', () => {
    const timer = createTimer('start', 's1', 2, 0);
    expect(creditedMinutes(timer, 120_000)).toBe(2);
  });

  it('telt de verstreken minuten mee bij eerder stoppen', () => {
    const timer = createTimer('block', 's1', 25, 0);
    expect(creditedMinutes(timer, 90_000)).toBe(1.5);
  });

  it('levert nooit negatieve of te hoge minuten op', () => {
    const timer = createTimer('start', 's1', 2, 0);
    expect(creditedMinutes(timer, -5_000)).toBe(0);
    expect(creditedMinutes(timer, 500_000)).toBe(2);
  });

  it('telt geen minuten voor een pauze', () => {
    const timer = createTimer('break', 's1', 5, 0);
    expect(creditedMinutes(timer, 300_000)).toBe(0);
  });
});

describe('een verlopen timer bij het hervatten', () => {
  it('herkent een timer die al voorbij endAt is als afgelopen', () => {
    const timer = createTimer('block', 's1', 10, 0);
    const resumeAt = 700_000; // ruim voorbij de 10 minuten
    expect(isFinished(timer, resumeAt)).toBe(true);
    expect(remainingSeconds(timer, resumeAt)).toBe(0);
    expect(creditedMinutes(timer, resumeAt)).toBe(10);
  });
});
