import './styles/app.css';
import { registerSW } from 'virtual:pwa-register';
import { getStore, updateStore } from './state';
import { createId, emptyStore, exportJson, importJson } from './storage';
import { computeStreak } from './streak';
import {
  createTimer,
  creditedMinutes,
  formatClock,
  isFinished,
  progressRatio,
  remainingSeconds,
} from './timer';
import * as feedback from './feedback';
import { laterCopy, parkCopy, progressCopy } from './copy';
import type { ActiveTimer, Note, Session, TimerKind } from './types';
import type { AppController, Draft, NavigateOptions, Screen } from './views/context';

import * as blockView from './views/block';
import * as breakDoneView from './views/breakdone';
import * as doneView from './views/done';
import * as laterView from './views/later';
import * as parkView from './views/park';
import * as progressView from './views/progress';
import * as startView from './views/start';
import * as startedView from './views/started';
import * as timerView from './views/timer';

const root = document.getElementById('app');
const toastEl = document.getElementById('toast');
const announcerEl = document.getElementById('announcer');

if (!root) {
  throw new Error('Root-element #app niet gevonden');
}
const appRoot: HTMLElement = root;

let currentScreen: Screen = 'start';
let draft: Draft = { subject: '', firstStep: '' };
let currentSessionId: string | null = null;
let tickHandle: ReturnType<typeof setInterval> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function findSession(id: string | null): Session | null {
  if (!id) return null;
  return getStore().sessions.find((s) => s.id === id) ?? null;
}

function stopTick(): void {
  if (tickHandle !== null) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

function tick(): void {
  const active = getStore().active;
  if (!active) {
    stopTick();
    return;
  }
  const now = Date.now();
  if (isFinished(active, now)) {
    stopTick();
    concludeTimer(active, true);
    return;
  }
  const clockText = document.getElementById('clockText');
  const clock = document.getElementById('clock');
  const remaining = remainingSeconds(active, now);
  if (clockText) clockText.textContent = formatClock(remaining);
  if (clock) clock.style.setProperty('--p', progressRatio(active, now).toFixed(3));
  document.title = `${formatClock(remaining)} · Begin nu`;
}

function startTick(): void {
  stopTick();
  tick();
  tickHandle = setInterval(tick, 250);
}

function announceCurrentScreen(): void {
  if (!announcerEl || currentScreen === 'timer') return;
  const heading = appRoot.querySelector('h1');
  announcerEl.textContent = heading?.textContent ?? '';
}

function renderScreen(): void {
  const store = getStore();
  switch (currentScreen) {
    case 'start':
      startView.render(appRoot, app);
      break;
    case 'later':
      laterView.render(appRoot, app);
      break;
    case 'timer': {
      const active = store.active;
      const session = findSession(active?.sessionId ?? currentSessionId);
      if (!active || !session) {
        currentScreen = 'start';
        startView.render(appRoot, app);
        break;
      }
      timerView.render(appRoot, app, active, session.subject, session.firstStep);
      tick();
      break;
    }
    case 'park':
      parkView.render(appRoot, app);
      break;
    case 'started':
      startedView.render(appRoot, app);
      break;
    case 'block': {
      const session = findSession(currentSessionId);
      blockView.render(
        appRoot,
        app,
        session ? Math.round(session.minutes) : 0,
        session?.subject ?? '',
      );
      break;
    }
    case 'breakdone':
      breakDoneView.render(appRoot, app);
      break;
    case 'done': {
      const session = findSession(currentSessionId);
      const minutes = session ? Math.round(session.minutes) : 0;
      const subject = session?.subject ?? '';
      const streak = computeStreak(store.sessions.map((s) => s.startedAt));
      const openNotes: Note[] = session
        ? store.notes.filter((n) => n.sessionId === session.id && n.doneAt === null)
        : [];
      doneView.render(appRoot, app, minutes, subject, streak, openNotes);
      break;
    }
    case 'progress':
      progressView.render(appRoot, app);
      break;
  }
  window.scrollTo(0, 0);
  announceCurrentScreen();
}

function navigate(screen: Screen, opts: NavigateOptions = {}): void {
  currentScreen = screen;
  if (opts.replace) {
    history.replaceState({ screen }, '');
  } else {
    history.pushState({ screen }, '');
  }
  renderScreen();
}

window.addEventListener('popstate', (event) => {
  const state = event.state as { screen?: Screen } | null;
  currentScreen = state?.screen ?? 'start';
  renderScreen();
});

function toast(message: string): void {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('on');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2200);
}

function getDraft(): Draft {
  return draft;
}

function setDraft(patch: Partial<Draft>): void {
  draft = { ...draft, ...patch };
}

function beginTimerForSession(sessionId: string, kind: TimerKind, minutes: number): void {
  currentSessionId = sessionId;
  feedback.unlockAudio();
  const timer = createTimer(kind, sessionId, minutes);
  updateStore((s) => ({ ...s, active: timer }));
  void feedback.requestWakeLock();
  navigate('timer');
  startTick();
}

function beginSessionInternal(): void {
  const subject = draft.subject.trim();
  const firstStep = draft.firstStep.trim();
  const id = createId();
  const session: Session = { id, subject, firstStep, startedAt: Date.now(), minutes: 0, blocks: 0 };
  updateStore((s) => ({ ...s, sessions: [...s.sessions, session] }));
  beginTimerForSession(id, 'start', 2);
}

function beginSession(): void {
  if (!draft.subject.trim() || !draft.firstStep.trim()) return;
  beginSessionInternal();
}

function goLater(): void {
  navigate('later');
}

function logExcuseEvent(outcome: 'accepted' | 'back'): void {
  updateStore((s) => ({
    ...s,
    events: [...s.events, { id: createId(), at: Date.now(), outcome }],
  }));
}

function laterAccept(): void {
  const subjectMissing = !draft.subject.trim();
  const stepMissing = !draft.firstStep.trim();
  if (subjectMissing || stepMissing) {
    navigate('start');
    toast(laterCopy.emptyFieldsToast);
    queueMicrotask(() => {
      const el = document.getElementById(subjectMissing ? 'inSubject' : 'inStep');
      el?.focus();
    });
    return;
  }
  logExcuseEvent('accepted');
  beginSessionInternal();
}

function laterBack(): void {
  logExcuseEvent('back');
  navigate('start');
}

function startFollowUpTimer(kind: TimerKind, minutes: number): void {
  if (!currentSessionId) {
    navigate('start');
    return;
  }
  beginTimerForSession(currentSessionId, kind, minutes);
}

function startBlock(minutes: number): void {
  startFollowUpTimer('block', minutes);
}

function startBreak(): void {
  startFollowUpTimer('break', 5);
}

function continueStart(): void {
  startFollowUpTimer('start', 2);
}

function creditAndClear(active: ActiveTimer, now: number = Date.now()): void {
  const minutes = creditedMinutes(active, now);
  updateStore((s) => {
    const sessions =
      active.kind === 'break'
        ? s.sessions
        : s.sessions.map((session) =>
            session.id === active.sessionId
              ? {
                  ...session,
                  minutes: Math.round((session.minutes + minutes) * 10) / 10,
                  blocks: session.blocks + 1,
                }
              : session,
          );
    return { ...s, sessions, active: null };
  });
  feedback.releaseWakeLock();
  document.title = 'Begin nu';
}

function concludeTimer(active: ActiveTimer, natural: boolean): void {
  creditAndClear(active);
  if (natural) feedback.chime();
  if (active.kind === 'start') navigate('started', { replace: true });
  else if (active.kind === 'break') navigate('breakdone', { replace: true });
  else navigate('block', { replace: true });
}

function stopTimer(): void {
  const active = getStore().active;
  if (!active) {
    navigate('start');
    return;
  }
  stopTick();
  creditAndClear(active);
  if (active.kind === 'break') navigate('breakdone', { replace: true });
  else navigate('done', { replace: true });
}

function openPark(): void {
  navigate('park');
}

function savePark(text: string): void {
  const trimmed = text.trim();
  if (trimmed) {
    const note: Note = {
      id: createId(),
      createdAt: Date.now(),
      text: trimmed,
      sessionId: currentSessionId,
      doneAt: null,
    };
    updateStore((s) => ({ ...s, notes: [...s.notes, note] }));
    toast(parkCopy.savedToast);
  }
  navigate('timer');
}

function cancelPark(): void {
  navigate('timer');
}

function toggleNoteDone(id: string): void {
  updateStore((s) => ({
    ...s,
    notes: s.notes.map((n) => (n.id === id ? { ...n, doneAt: Date.now() } : n)),
  }));
  renderScreen();
}

function finishSession(): void {
  navigate('done', { replace: true });
}

function exportData(): void {
  const json = exportJson(getStore());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `begin-nu-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importData(file: File): Promise<void> {
  try {
    const text = await file.text();
    updateStore((s) => importJson(s, text));
    toast(progressCopy.importedToast);
    renderScreen();
  } catch {
    toast(progressCopy.importFailedToast);
  }
}

function resetAll(): void {
  updateStore(() => emptyStore());
  currentSessionId = null;
  draft = { subject: '', firstStep: '' };
  toast(progressCopy.resetToast);
  navigate('start');
}

function toStart(): void {
  // Baseer het te behouden vak op de zojuist afgeronde sessie (persistente data),
  // niet op het in-memory draft-veld: dat kan leeg zijn na een herlaad tijdens de sessie.
  const session = findSession(currentSessionId);
  draft = { subject: session?.subject ?? draft.subject, firstStep: '' };
  currentSessionId = null;
  navigate('start');
}

const app: AppController = {
  getStore,
  getDraft,
  setDraft,
  navigate,
  beginSession,
  goLater,
  laterAccept,
  laterBack,
  startBlock,
  startBreak,
  continueStart,
  stopTimer,
  openPark,
  savePark,
  cancelPark,
  toggleNoteDone,
  finishSession,
  toStart,
  toast,
  now: () => Date.now(),
  exportData,
  importData,
  resetAll,
};

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && getStore().active) {
    void feedback.requestWakeLock();
    startTick();
  }
});

function resumeOnStartup(): void {
  const active = getStore().active;
  if (!active) {
    currentScreen = 'start';
    history.replaceState({ screen: 'start' }, '');
    renderScreen();
    return;
  }
  currentSessionId = active.sessionId;
  const now = Date.now();
  if (isFinished(active, now)) {
    currentScreen = 'timer';
    concludeTimer(active, false);
  } else {
    currentScreen = 'timer';
    history.replaceState({ screen: 'timer' }, '');
    renderScreen();
    void feedback.requestWakeLock();
    startTick();
  }
}

resumeOnStartup();

if (import.meta.env.PROD) {
  // De app moet volledig offline werken na het eerste bezoek. We plannen hier
  // geen lokale meldingen voor het aflopen van een timer: dat is niet
  // betrouwbaar mogelijk in een web-app, zeker niet op iOS. Bij terugkeer
  // toont de app direct de juiste stand, omdat de timer op endAt gebaseerd is.
  registerSW({ immediate: true });
}
