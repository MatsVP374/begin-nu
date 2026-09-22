# Begin nu

Een installeerbare web-app (PWA) voor studenten die steeds uitstellen. De app doet maar één ding:
de drempel om te beginnen zo klein mogelijk maken.

## Ontwikkelen

```bash
npm install
npm run dev
```

## Tests

```bash
npm test           # unit tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright)
```

## Iconen genereren

```bash
npm run icons
```

## Live

De app draait op `https://matsvp374.github.io/begin-nu/` zodra deze branch naar `main` gemerged
is. `deploy.yml` bouwt en publiceert dan automatisch naar GitHub Pages. Zet in de repository-
instellingen onder **Settings → Pages** de bron op **GitHub Actions** (eenmalig).

## CI

Elke push en pull request draait lint, typecheck, unit- en e2e-tests via `.github/workflows/ci.yml`.
