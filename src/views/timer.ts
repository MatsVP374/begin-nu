import { escapeHtml, qs } from '../dom';
import { timerCopy } from '../copy';
import type { ActiveTimer } from '../types';
import type { AppController } from './context';

export function render(
  root: HTMLElement,
  app: AppController,
  timer: ActiveTimer,
  subject: string,
  step: string,
): void {
  const isBreak = timer.kind === 'break';

  root.innerHTML = `
    <div class="timer">
      <p class="what" id="tSubject">${escapeHtml(subject)}</p>
      <p class="step" id="tStep">${isBreak ? timerCopy.breakStepText : escapeHtml(step)}</p>
      <div class="clock" id="clock" role="timer"><span id="clockText">0:00</span></div>
      <p class="label" id="tLabel">${timerCopy.labelFor(timer.kind)}</p>
    </div>
    <div class="actions">
      <button class="secondary" id="btnPark" type="button" ${isBreak ? 'hidden' : ''}>${timerCopy.parkButton}</button>
      <button class="quiet" id="btnStop" type="button">${timerCopy.stopLink}</button>
    </div>
  `;

  qs(root, '#btnPark').addEventListener('click', () => app.openPark());
  qs(root, '#btnStop').addEventListener('click', () => app.stopTimer());
}
