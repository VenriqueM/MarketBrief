# MarketBrief

A responsive financial news and market intelligence dashboard built with React, TypeScript, Vite, and plain CSS.

## Current data status

- News is fictional demo content and is labelled as such.
- The S&P 500, Nasdaq Composite, S&P/TSX Composite, gold, and crude oil cards use illustrative values labelled **DEMO · NOT LIVE**.
- USD/CAD attempts to load the Bank of Canada Valet daily reference rate in the visitor's browser. A successful response is dated and attributed on its card; on request, validation, or browser CORS failure, the card falls back to clearly labelled demo values.
- The Bank of Canada rate is a daily reference rate, not an intraday trading quote. It is not financial advice.
- See [docs/SOURCES.md](docs/SOURCES.md) for source access and licensing notes.

## Features

- Search, category filtering, and newest-first sorting across six news topics.
- Bookmarks, private notes, and a starter watchlist saved in browser localStorage.
- Typed news and market provider interfaces, source validation, source labels, loading/error states, and demo fallback.
- Responsive layout, keyboard navigation, visible focus indicators, and empty states.

Local preferences stay in the browser profile on the current device. They do not automatically sync to a phone, tablet, or another computer. GitHub Pages serves the static frontend while your Macs are off. Sync, accounts, and private server-side data would require a backend service.

## Requirements and local development

- Node.js 24 LTS (npm is included)
- Git

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Build and preview

```sh
npm run build
npm run preview
```

The production files go to `dist/`. `npm run build` runs TypeScript project checks and Vite bundling. No separate automated test suite is configured.

## Deployment

The `.github/workflows/deploy.yml` workflow builds and publishes the site on GitHub-hosted runners; no personal computer serves the production site. The Vite base path is set for `https://venriquem.github.io/MarketBrief/` during the Pages build. GitHub Pages must use **GitHub Actions** as its deployment source.

The static site contains no private API credentials. Never add a secret to a `VITE_*` variable: Vite embeds frontend environment variables into public browser assets. Providers needing private keys require a server-side design and separate review before adding infrastructure.
