import { escapeHtml, qs } from '../dom';
import { brand, doneCopy, doneText, doneTitle } from '../copy';
import type { Note } from '../types';
import type { AppController } from './context';

export function render(
  root: HTMLElement,
  app: AppController,
  minutes: number,
  subject: string,
  streak: number,
  openNotes: Note[],
): void {
  const notesHtml = openNotes
    .map(
      (n) => `
      <li>
        <p>${escapeHtml(n.text)}</p>
        <button class="x" type="button" data-id="${n.id}" aria-label="Afgehandeld">×</button>
      </li>`,
    )
    .join('');

  root.innerHTML = `
    <div class="topbar"><span class="brand">${brand}</span></div>
    <h1>${doneTitle(minutes)}</h1>
    <p>${doneText(minutes, subject, streak)}</p>
    ${
      openNotes.length
        ? `<div id="doneNotesWrap"><h2>${doneCopy.parkedHeading}</h2><ul class="notes" id="doneNotes">${notesHtml}</ul></div>`
        : ''
    }
    <div class="actions">
      <button class="primary" id="btnToStart" type="button">${doneCopy.toStart}</button>
      <button class="quiet" id="btnProgress" type="button">${doneCopy.toProgress}</button>
    </div>
  `;

  root.querySelectorAll<HTMLButtonElement>('#doneNotes .x').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) app.toggleNoteDone(id);
    });
  });

  qs(root, '#btnToStart').addEventListener('click', () => app.toStart());
  qs(root, '#btnProgress').addEventListener('click', () => app.navigate('progress'));
}
