import { qs } from '../dom';
import { brand, startedCopy } from '../copy';
import type { AppController } from './context';

export function render(root: HTMLElement, app: AppController): void {
  root.innerHTML = `
    <div class="topbar"><span class="brand">${brand}</span></div>
    <h1>${startedCopy.title}</h1>
    <p>${startedCopy.text}</p>
    <div class="actions">
      <div class="row2">
        <button class="primary" id="btn10" type="button">${startedCopy.block10}</button>
        <button class="primary" id="btn25" type="button">${startedCopy.block25}</button>
      </div>
      <button class="secondary" id="btnDone" type="button">${startedCopy.doneEarly}</button>
      <p class="hint">${startedCopy.hint}</p>
    </div>
  `;

  qs(root, '#btn10').addEventListener('click', () => app.startBlock(10));
  qs(root, '#btn25').addEventListener('click', () => app.startBlock(25));
  qs(root, '#btnDone').addEventListener('click', () => app.finishSession());
}
