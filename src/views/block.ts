import { qs } from '../dom';
import { blockCopy, blockText, brand, randomBlockTitle } from '../copy';
import type { AppController } from './context';

export function render(
  root: HTMLElement,
  app: AppController,
  minutes: number,
  subject: string,
): void {
  root.innerHTML = `
    <div class="topbar"><span class="brand">${brand}</span></div>
    <h1>${randomBlockTitle()}</h1>
    <p>${blockText(minutes, subject)}</p>
    <div class="actions">
      <button class="primary" id="btnBreak" type="button">${blockCopy.breakButton}</button>
      <div class="row2">
        <button class="secondary" id="btn10" type="button">${blockCopy.block10}</button>
        <button class="secondary" id="btn25" type="button">${blockCopy.block25}</button>
      </div>
      <button class="quiet" id="btnFinish" type="button">${blockCopy.finish}</button>
    </div>
  `;

  qs(root, '#btnBreak').addEventListener('click', () => app.startBreak());
  qs(root, '#btn10').addEventListener('click', () => app.startBlock(10));
  qs(root, '#btn25').addEventListener('click', () => app.startBlock(25));
  qs(root, '#btnFinish').addEventListener('click', () => app.finishSession());
}
