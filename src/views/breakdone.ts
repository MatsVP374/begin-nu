import { qs } from '../dom';
import { brand, breakDoneCopy } from '../copy';
import type { AppController } from './context';

export function render(root: HTMLElement, app: AppController): void {
  root.innerHTML = `
    <div class="topbar"><span class="brand">${brand}</span></div>
    <h1>${breakDoneCopy.title}</h1>
    <p>${breakDoneCopy.text}</p>
    <div class="actions">
      <button class="primary" id="btnAgain" type="button">${breakDoneCopy.again}</button>
      <button class="quiet" id="btnFinish" type="button">${breakDoneCopy.finish}</button>
    </div>
  `;

  qs(root, '#btnAgain').addEventListener('click', () => app.continueStart());
  qs(root, '#btnFinish').addEventListener('click', () => app.finishSession());
}
