import { qs } from '../dom';
import { parkCopy } from '../copy';
import type { AppController } from './context';

export function render(root: HTMLElement, app: AppController): void {
  root.innerHTML = `
    <h1>${parkCopy.title}</h1>
    <p>${parkCopy.text}</p>
    <label for="inNote" class="field-only-label">${parkCopy.fieldLabel}</label>
    <textarea id="inNote" placeholder="${parkCopy.placeholder}"></textarea>
    <div class="actions">
      <button class="primary" id="btnSave" type="button">${parkCopy.save}</button>
      <button class="quiet" id="btnCancel" type="button">${parkCopy.back}</button>
    </div>
  `;

  const textarea = qs<HTMLTextAreaElement>(root, '#inNote');
  textarea.focus();

  qs(root, '#btnSave').addEventListener('click', () => app.savePark(textarea.value));
  qs(root, '#btnCancel').addEventListener('click', () => app.cancelPark());
}
