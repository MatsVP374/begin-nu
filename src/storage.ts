import { addDays } from './streak';
import type { ActiveTimer, ExcuseEvent, Note, Session, Store } from './types';

const KEY = 'begin-nu';
const PROTOTYPE_KEY = 'begin-nu-v1';
const MAX_AGE_DAYS = 365;

export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function emptyStore(): Store {
  return { version: 1, sessions: [], notes: [], events: [], active: null };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of a) map.set(item.id, item);
  for (const item of b) map.set(item.id, item);
  return Array.from(map.values());
}

/** Zet een ruwe, ongecontroleerde waarde om naar de huidige Store-vorm. */
export function migrate(raw: unknown): Store {
  if (!isRecord(raw) || raw.version !== 1) return emptyStore();
  return {
    version: 1,
    sessions: asArray<Session>(raw.sessions),
    notes: asArray<Note>(raw.notes),
    events: asArray<ExcuseEvent>(raw.events),
    active: isRecord(raw.active) ? (raw.active as unknown as ActiveTimer) : null,
  };
}

interface PrototypeSession {
  id?: unknown;
  vak?: unknown;
  step?: unknown;
  start?: unknown;
  minutes?: unknown;
  blocks?: unknown;
}
interface PrototypeNote {
  id?: unknown;
  t?: unknown;
  text?: unknown;
  sessionId?: unknown;
  done?: unknown;
}

/** Zet data uit het prototype (sleutel begin-nu-v1, velden vak/step/start/t/text) om. */
function migratePrototype(raw: unknown): { sessions: Session[]; notes: Note[] } {
  if (!isRecord(raw)) return { sessions: [], notes: [] };
  const sessions: Session[] = asArray<PrototypeSession>(raw.sessions)
    .filter((s): s is PrototypeSession & { id: string } => isRecord(s) && typeof s.id === 'string')
    .map((s) => ({
      id: s.id,
      subject: typeof s.vak === 'string' ? s.vak : '',
      firstStep: typeof s.step === 'string' ? s.step : '',
      startedAt: typeof s.start === 'number' ? s.start : Date.now(),
      minutes: typeof s.minutes === 'number' ? s.minutes : 0,
      blocks: typeof s.blocks === 'number' ? s.blocks : 0,
    }));
  const notes: Note[] = asArray<PrototypeNote>(raw.notes)
    .filter((n): n is PrototypeNote & { id: string } => isRecord(n) && typeof n.id === 'string')
    .map((n) => ({
      id: n.id,
      createdAt: typeof n.t === 'number' ? n.t : Date.now(),
      text: typeof n.text === 'string' ? n.text : '',
      sessionId: typeof n.sessionId === 'string' ? n.sessionId : null,
      doneAt: n.done ? Date.now() : null,
    }));
  return { sessions, notes };
}

function pruneOld(store: Store, now: number = Date.now()): Store {
  const cutoff = addDays(now, -MAX_AGE_DAYS);
  return {
    ...store,
    sessions: store.sessions.filter((s) => s.startedAt >= cutoff),
    events: store.events.filter((e) => e.at >= cutoff),
  };
}

/** Laadt de store, migreert oudere versies en importeert eventuele prototypedata. */
export function load(): Store {
  let store = emptyStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) store = migrate(JSON.parse(raw));
  } catch {
    store = emptyStore();
  }

  try {
    const oldRaw = localStorage.getItem(PROTOTYPE_KEY);
    if (oldRaw) {
      const { sessions, notes } = migratePrototype(JSON.parse(oldRaw));
      store = {
        ...store,
        sessions: mergeById(store.sessions, sessions),
        notes: mergeById(store.notes, notes),
      };
      localStorage.removeItem(PROTOTYPE_KEY);
      save(store);
    }
  } catch {
    // Kapotte prototypedata negeren; de rest van de app blijft werken.
  }

  return pruneOld(store);
}

/** Slaat de store op. Faalt stil als opslag niet beschikbaar is. */
export function save(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Geen opslag beschikbaar: de app werkt door, zonder geheugen.
  }
}

export function exportJson(store: Store): string {
  return JSON.stringify(store, null, 2);
}

/** Voegt geïmporteerde data samen met de huidige store, zonder dubbelen (op id). */
export function importJson(current: Store, json: string): Store {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return current;
  }
  const incoming = migrate(parsed);
  const active =
    current.active ??
    (incoming.active && incoming.active.endAt > Date.now() ? incoming.active : null);
  return {
    version: 1,
    sessions: mergeById(current.sessions, incoming.sessions),
    notes: mergeById(current.notes, incoming.notes),
    events: mergeById(current.events, incoming.events),
    active,
  };
}
