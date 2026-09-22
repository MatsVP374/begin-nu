import { expect, test } from '@playwright/test';

test('volledige flow: invullen tot en met voortgang', async ({ page }) => {
  await page.clock.install();
  await page.goto('');

  await page.fill('#inSubject', 'Statistiek');
  await page.fill('#inStep', 'Boek of pdf openen');
  await page.click('#btnStart');
  await expect(page.locator('#clockText')).toHaveText('2:00');

  await page.clock.fastForward(120_000);
  await expect(page.locator('h1')).toHaveText('Je bent begonnen.');

  await page.click('#btn10');
  await expect(page.locator('#clockText')).toHaveText('10:00');

  await page.click('#btnPark');
  await page.fill('#inNote', 'Appje beantwoorden');
  await page.click('#btnSave');

  await page.click('#btnStop');
  await expect(page.locator('h1')).toHaveText('Goed gedaan.');
  await expect(page.locator('#doneNotes li')).toHaveCount(1);
  await expect(page.locator('#doneNotes li p')).toHaveText('Appje beantwoorden');

  await page.click('#btnProgress');
  await expect(page.locator('.stat b').nth(0)).toHaveText('1');
  await expect(page.locator('.stat b').nth(1)).toHaveText('1');
});

test('"Ik begin straks…" met lege velden gaat terug met een toast', async ({ page }) => {
  await page.goto('');
  await page.click('#btnLater');
  await page.click('#btnAccept');
  await expect(page.locator('#toast')).toHaveText('Vul eerst je vak en eerste stap in');
  await expect(page.locator('#inSubject')).toBeFocused();
});

test('herladen tijdens een lopende timer loopt door met de juiste resterende tijd', async ({
  page,
}) => {
  await page.goto('');
  await page.fill('#inSubject', 'Frans');
  await page.fill('#inStep', 'Woordjes');
  await page.click('#btnStart');
  await expect(page.locator('#clockText')).toHaveText('2:00');

  await page.evaluate(() => {
    const raw = localStorage.getItem('begin-nu');
    if (!raw) throw new Error('geen store');
    const store = JSON.parse(raw);
    store.active.endAt = Date.now() + 90_000;
    localStorage.setItem('begin-nu', JSON.stringify(store));
  });

  await page.reload();
  await expect(page.locator('#clockText')).toHaveText('1:30');
});

test('herladen nadat de timer verlopen is toont direct het juiste vervolgscherm', async ({
  page,
}) => {
  await page.goto('');
  await page.fill('#inSubject', 'Wiskunde');
  await page.fill('#inStep', 'Sommen maken');
  await page.click('#btnStart');

  await page.evaluate(() => {
    const raw = localStorage.getItem('begin-nu');
    if (!raw) throw new Error('geen store');
    const store = JSON.parse(raw);
    const duration = store.active.endAt - store.active.startedAt;
    store.active.startedAt = Date.now() - duration - 1000;
    store.active.endAt = Date.now() - 1000;
    localStorage.setItem('begin-nu', JSON.stringify(store));
  });

  await page.reload();
  await expect(page.locator('h1')).toHaveText('Je bent begonnen.');
});

test('export, alles wissen en import herstelt de data', async ({ page }) => {
  await page.goto('');
  await page.fill('#inSubject', 'Scheikunde');
  await page.fill('#inStep', 'Proefwerk oefenen');
  await page.click('#btnStart');
  await page.click('#btnStop');
  await page.click('#btnProgress');

  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btnExport')]);
  const filePath = await download.path();
  expect(filePath).toBeTruthy();

  page.once('dialog', (dialog) => dialog.accept());
  await page.click('#btnReset');
  await expect(page.locator('h1')).toHaveText('Wat ga je doen?');

  await page.click('#toProgress');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('#btnImport'),
  ]);
  await fileChooser.setFiles(filePath ?? '');
  await expect(page.locator('.bars .bar .name')).toHaveText('Scheikunde');
});

test('werkt offline na het eerste bezoek', async ({ page, context }) => {
  await page.goto('');
  await page
    .waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 15_000 })
    .catch(() => undefined);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Wat ga je doen?');
  await context.setOffline(false);
});
