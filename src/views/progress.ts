import { qs } from '../dom';
import { progressCopy } from '../copy';
import type { AppController } from './context';

// Wordt in fase 4 uitgebreid met tegels, weekgrafiek, per vak, excuses en gegevensbeheer.
export function render(root: HTMLElement, app: AppController): void {
  root.innerHTML = `
    <div class="topbar">
      <button class="link" id="btnBack" type="button">${progressCopy.back}</button>
      <span class="brand">${progressCopy.title}</span>
    </div>
  `;

  qs(root, '#btnBack').addEventListener('click', () => app.navigate('start'));
}
