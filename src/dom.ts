/** Zet tekst veilig om zodat die als HTML geïnterpoleerd kan worden. */
export function escapeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/** Zoekt een element en gooit een duidelijke fout als het ontbreekt (helpt bij typefouten in templates). */
export function qs<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element niet gevonden: ${selector}`);
  return el;
}
