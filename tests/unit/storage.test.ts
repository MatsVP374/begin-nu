import { beforeEach, describe, expect, it } from 'vitest';
import { emptyStore, exportJson, importJson, load, migrate, save } from '../../src/storage';
import type { Store } from '../../src/types';

const KEY = 'begin-nu';
const PROTOTYPE_KEY = 'begin-nu-v1';

beforeEach(() => {
  localStorage.clear();
});

const RECENT = Date.now() - 60_000;

function storeWithData(): Store {
  return {
    version: 1,
    sessions: [
      {
        id: 's1',
        subject: 'Statistiek',
        firstStep: 'Boek openen',
        startedAt: RECENT,
        minutes: 12,
        blocks: 1,
      },
    ],
    notes: [
      { id: 'n1', createdAt: RECENT, text: 'Appje beantwoorden', sessionId: 's1', doneAt: null },
    ],
    events: [{ id: 'e1', at: RECENT, outcome: 'accepted' }],
    active: null,
  };
}

describe('load/save', () => {
  it('geeft een lege store terug als er niets is opgeslagen', () => {
    expect(load()).toEqual(emptyStore());
  });

  it('bewaart wat er opgeslagen is', () => {
    const store = storeWithData();
    save(store);
    expect(load()).toEqual(store);
  });

  it('crasht niet op kapotte JSON in de opslag', () => {
    localStorage.setItem(KEY, '{niet geldige json');
    expect(() => load()).not.toThrow();
    expect(load()).toEqual(emptyStore());
  });
});

describe('migrate', () => {
  it('laat een geldige store van versie 1 ongewijzigd', () => {
    const store = storeWithData();
    expect(migrate(store)).toEqual(store);
  });

  it('geeft een lege store terug voor onherkenbare data', () => {
    expect(migrate({ foo: 'bar' })).toEqual(emptyStore());
    expect(migrate(null)).toEqual(emptyStore());
    expect(migrate(42)).toEqual(emptyStore());
  });
});

describe('migratie van het prototypeformaat', () => {
  it('zet vak/step/start/t/text om en wist de oude sleutel', () => {
    const start = Date.now() - 60_000;
    localStorage.setItem(
      PROTOTYPE_KEY,
      JSON.stringify({
        sessions: [{ id: 'p1', vak: 'Frans', step: 'Pdf openen', start, minutes: 8, blocks: 1 }],
        notes: [{ id: 'pn1', t: start, text: 'Iets checken', sessionId: 'p1', done: false }],
        active: null,
        updated: start,
      }),
    );

    const store = load();

    expect(store.sessions).toEqual([
      {
        id: 'p1',
        subject: 'Frans',
        firstStep: 'Pdf openen',
        startedAt: start,
        minutes: 8,
        blocks: 1,
      },
    ]);
    expect(store.notes).toEqual([
      { id: 'pn1', createdAt: start, text: 'Iets checken', sessionId: 'p1', doneAt: null },
    ]);
    expect(localStorage.getItem(PROTOTYPE_KEY)).toBeNull();
  });

  it('crasht niet op kapotte prototypedata', () => {
    localStorage.setItem(PROTOTYPE_KEY, 'niet-geldig');
    expect(() => load()).not.toThrow();
  });
});

describe('export/import', () => {
  it('levert bij een ronde export → import identieke data op', () => {
    const store = storeWithData();
    const json = exportJson(store);
    const result = importJson(store, json);
    expect(result).toEqual(store);
  });

  it('voegt geïmporteerde data samen zonder dubbelen', () => {
    const current = storeWithData();
    const incoming: Store = {
      version: 1,
      sessions: [
        // zelfde id als bestaande sessie: geen dubbele entry
        ...current.sessions,
        {
          id: 's2',
          subject: 'Frans',
          firstStep: 'Woordjes',
          startedAt: 9000,
          minutes: 4,
          blocks: 1,
        },
      ],
      notes: [],
      events: [],
      active: null,
    };
    const result = importJson(current, exportJson(incoming));
    expect(result.sessions).toHaveLength(2);
    expect(result.sessions.map((s) => s.id).sort()).toEqual(['s1', 's2']);
  });
});
