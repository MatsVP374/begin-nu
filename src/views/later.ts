import { qs } from '../dom';
import { brand, laterCopy } from '../copy';
import type { AppController } from './context';

function nextHalfHour(now: number): string {
  const d = new Date(now);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m < 10 ? '0' : ''}${m}`;
}

export function render(root: HTMLElement, app: AppController): void {
  const hhmm = nextHalfHour(app.now());

  root.innerHTML = `
    <div class="topbar"><span class="brand">${brand}</span></div>
    <h1>${laterCopy.title}</h1>
    <p>${laterCopy.text(hhmm)}</p>
    <div class="card"><p>${laterCopy.card}</p></div>
    <div class="actions">
      <button class="primary" id="btnAccept" type="button">${laterCopy.accept}</button>
      <button class="quiet" id="btnBack" type="button">${laterCopy.back}</button>
    </div>
  `;

  qs(root, '#btnAccept').addEventListener('click', () => app.laterAccept());
  qs(root, '#btnBack').addEventListener('click', () => app.laterBack());
}
