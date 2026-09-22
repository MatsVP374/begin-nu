export type TimerKind = 'start' | 'block' | 'break';

export interface Session {
  id: string;
  subject: string;
  firstStep: string;
  startedAt: number;
  minutes: number;
  blocks: number;
}

export interface ActiveTimer {
  kind: TimerKind;
  sessionId: string;
  startedAt: number;
  endAt: number;
  totalSeconds: number;
}

export interface Note {
  id: string;
  createdAt: number;
  text: string;
  sessionId: string | null;
  doneAt: number | null;
}

export type ExcuseOutcome = 'accepted' | 'back';

export interface ExcuseEvent {
  id: string;
  at: number;
  outcome: ExcuseOutcome;
}

export interface Store {
  version: 1;
  sessions: Session[];
  notes: Note[];
  events: ExcuseEvent[];
  active: ActiveTimer | null;
}
