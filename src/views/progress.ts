import { escapeHtml, qs } from '../dom';
import { dayLabels, progressCopy } from '../copy';
import { computeStreak } from '../streak';
import {
  excuseStats,
  minutesPerDay,
  minutesPerSubject,
  minutesThisWeek,
  startsThisWeek,
} from '../stats';
import type { AppController } from './context';

export function render(root: HTMLElement, app: AppController): void {
  const store = app.getStore();
  const now = app.now();
  const starts = store.sessions.map((s) => s.startedAt);

  const streak = computeStreak(starts, now);
  const startsCount = startsThisWeek(store.sessions, now);
  const minutesCount = Math.round(minutesThisWeek(store.sessions, now));

  const days = minutesPerDay(store.sessions, now, 7);
  const maxDay = Math.max(1, ...days.map((d) => d.minutes));
  const weekHtml = days
    .map((d) => {
      const hasMinutes = d.minutes > 0;
      const heightPct = hasMinutes ? Math.max(6, (d.minutes / maxDay) * 100) : 4;
      return `
        <div class="day" title="${Math.round(d.minutes)} minuten">
          <i class="${hasMinutes ? '' : 'zero'}" style="height:${heightPct}%"></i>
          <small>${dayLabels[d.date.getDay()]}</small>
        </div>`;
    })
    .join('');

  const subjects = minutesPerSubject(store.sessions, now);
  const maxSubject = Math.max(1, subjects[0]?.minutes ?? 1);
  const subjectsHtml = subjects.length
    ? subjects
        .map(
          (s) => `
      <div class="bar">
        <span class="name">${escapeHtml(s.subject)}</span>
        <div class="track"><div class="fill" style="width:${Math.max(3, (s.minutes / maxSubject) * 100)}%"></div></div>
        <span class="num">${Math.round(s.minutes)} min</span>
      </div>`,
        )
        .join('')
    : `<p class="empty">${progressCopy.subjectEmpty}</p>`;

  const excuses = excuseStats(store.events, now);

  const openNotes = store.notes
    .filter((n) => n.doneAt === null)
    .sort((a, b) => b.createdAt - a.createdAt);
  const notesHtml = openNotes.length
    ? openNotes
        .map(
          (n) => `
      <li>
        <p>${escapeHtml(n.text)}</p>
        <button class="x" type="button" data-id="${n.id}" aria-label="Afgehandeld">×</button>
      </li>`,
        )
        .join('')
    : `<li><p class="empty">${progressCopy.parkEmpty}</p></li>`;

  root.innerHTML = `
    <div class="topbar">
      <button class="link" id="btnBack" type="button">${progressCopy.back}</button>
      <span class="brand">${progressCopy.title}</span>
    </div>

    <div class="stats">
      <div class="stat"><b>${streak}</b><small>${progressCopy.streakTileLabel(streak)}</small></div>
      <div class="stat"><b>${startsCount}</b><small>${progressCopy.startsTileLabel}</small></div>
      <div class="stat"><b>${minutesCount}</b><small>${progressCopy.minutesTileLabel}</small></div>
    </div>

    <h2>${progressCopy.weekHeading}</h2>
    <div class="week" aria-label="Minuten per dag">${weekHtml}</div>

    <h2>${progressCopy.subjectHeading}</h2>
    <div class="bars">${subjectsHtml}</div>

    ${
      excuses.chosenLater > 0
        ? `<h2>Excuses opgevangen</h2><p>${progressCopy.excuseText(excuses.chosenLater, excuses.startedAnyway)}</p>`
        : ''
    }

    <h2>${progressCopy.parkHeading}</h2>
    <ul class="notes" id="progressNotes">${notesHtml}</ul>

    <h2>${progressCopy.dataHeading}</h2>
    <p class="hint">${progressCopy.storageWarning}</p>
    <div class="actions">
      <button class="secondary" id="btnExport" type="button">${progressCopy.exportButton}</button>
      <button class="secondary" id="btnImport" type="button">${progressCopy.importButton}</button>
      <input type="file" id="importFile" accept="application/json" class="sr-only" />
      <button class="quiet danger" id="btnReset" type="button">${progressCopy.resetButton}</button>
    </div>
  `;

  qs(root, '#btnBack').addEventListener('click', () => app.navigate('start'));

  root.querySelectorAll<HTMLButtonElement>('#progressNotes .x').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) app.toggleNoteDone(id);
    });
  });

  qs(root, '#btnExport').addEventListener('click', () => app.exportData());

  const importInput = qs<HTMLInputElement>(root, '#importFile');
  qs(root, '#btnImport').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (file) void app.importData(file);
    importInput.value = '';
  });

  qs(root, '#btnReset').addEventListener('click', () => {
    if (window.confirm(progressCopy.resetConfirm)) app.resetAll();
  });
}
