import { escapeHtml, qs } from '../dom';
import { brand, startCopy, streakLine } from '../copy';
import { computeStreak, hasStartedToday } from '../streak';
import type { Session } from '../types';
import type { AppController } from './context';

function uniqueRecentSubjects(sessions: Session[], max: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  [...sessions]
    .sort((a, b) => b.startedAt - a.startedAt)
    .forEach((s) => {
      if (!seen.has(s.subject) && result.length < max) {
        seen.add(s.subject);
        result.push(s.subject);
      }
    });
  return result;
}

function uniqueRecentSteps(sessions: Session[], subject: string, max: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  [...sessions]
    .filter((s) => s.subject === subject)
    .sort((a, b) => b.startedAt - a.startedAt)
    .forEach((s) => {
      if (!seen.has(s.firstStep) && result.length < max) {
        seen.add(s.firstStep);
        result.push(s.firstStep);
      }
    });
  return result;
}

export function render(root: HTMLElement, app: AppController): void {
  const store = app.getStore();
  const draft = app.getDraft();
  const starts = store.sessions.map((s) => s.startedAt);
  const streak = computeStreak(starts, app.now());
  const startedToday = hasStartedToday(starts, app.now());
  const recentSubjects = uniqueRecentSubjects(store.sessions, 5);

  root.innerHTML = `
    <div class="topbar">
      <span class="brand">${brand}</span>
      <button class="link" id="toProgress" type="button">${startCopy.progressLink}</button>
    </div>
    <h1>${startCopy.title}</h1>
    <p>${startCopy.subtitle}</p>

    <label for="inSubject">${startCopy.subjectLabel}</label>
    <input type="text" id="inSubject" autocomplete="off" placeholder="${startCopy.subjectPlaceholder}" value="${escapeHtml(draft.subject)}" />
    <div class="chips" id="subjectChips"></div>

    <label for="inStep">${startCopy.stepLabel} <span>${startCopy.stepLabelHint}</span></label>
    <input type="text" id="inStep" autocomplete="off" placeholder="${startCopy.stepPlaceholder}" value="${escapeHtml(draft.firstStep)}" />
    <div class="chips" id="stepChips"></div>

    <div class="streakline">${streakLine(streak, startedToday)}</div>

    <div class="actions">
      <button class="primary" id="btnStart" type="button" disabled>${startCopy.startButton}</button>
      <button class="quiet" id="btnLater" type="button">${startCopy.laterLink}</button>
    </div>
  `;

  const inSubject = qs<HTMLInputElement>(root, '#inSubject');
  const inStep = qs<HTMLInputElement>(root, '#inStep');
  const btnStart = qs<HTMLButtonElement>(root, '#btnStart');
  const subjectChipsEl = qs(root, '#subjectChips');
  const stepChipsEl = qs(root, '#stepChips');

  function addChip(container: Element, text: string, onClick: () => void): void {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = text;
    chip.addEventListener('click', onClick);
    container.appendChild(chip);
  }

  function renderSubjectChips(): void {
    subjectChipsEl.innerHTML = '';
    recentSubjects.forEach((subject) => {
      addChip(subjectChipsEl, subject, () => {
        inSubject.value = subject;
        validate();
        renderStepChips();
        inStep.focus();
      });
    });
  }

  function renderStepChips(): void {
    stepChipsEl.innerHTML = '';
    const subjectValue = inSubject.value.trim();
    const recentSteps = subjectValue ? uniqueRecentSteps(store.sessions, subjectValue, 3) : [];
    [...startCopy.stepSuggestions, ...recentSteps].forEach((text) => {
      addChip(stepChipsEl, text, () => {
        inStep.value = text;
        validate();
      });
    });
  }

  function validate(): void {
    app.setDraft({ subject: inSubject.value, firstStep: inStep.value });
    btnStart.disabled = !(inSubject.value.trim() && inStep.value.trim());
  }

  inSubject.addEventListener('input', () => {
    validate();
    renderStepChips();
  });
  inStep.addEventListener('input', validate);

  qs(root, '#toProgress').addEventListener('click', () => app.navigate('progress'));
  btnStart.addEventListener('click', () => app.beginSession());
  qs(root, '#btnLater').addEventListener('click', () => app.goLater());

  renderSubjectChips();
  renderStepChips();
  validate();
}
