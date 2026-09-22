import type { ActiveTimer, Store } from '../types';

export type Screen =
  'start' | 'later' | 'timer' | 'park' | 'started' | 'block' | 'breakdone' | 'done' | 'progress';

export interface Draft {
  subject: string;
  firstStep: string;
}

export interface NavigateOptions {
  replace?: boolean;
}

/**
 * De state-machine (in main.ts) implementeert dit contract. Viewbestanden
 * kennen alleen deze interface, nooit main.ts zelf, om circulaire imports
 * te voorkomen.
 */
export interface AppController {
  getStore(): Store;
  getDraft(): Draft;
  setDraft(patch: Partial<Draft>): void;
  navigate(screen: Screen, opts?: NavigateOptions): void;
  beginSession(): void;
  goLater(): void;
  laterAccept(): void;
  laterBack(): void;
  startBlock(minutes: number): void;
  startBreak(): void;
  continueStart(): void;
  stopTimer(): void;
  openPark(): void;
  savePark(text: string): void;
  cancelPark(): void;
  toggleNoteDone(id: string): void;
  finishSession(): void;
  toStart(): void;
  toast(message: string): void;
  now(): number;
  exportData(): void;
  importData(file: File): Promise<void>;
  resetAll(): void;
}

export interface ActiveTimerView {
  timer: ActiveTimer;
  subject: string;
  step: string;
}
