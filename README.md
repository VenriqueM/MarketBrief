# MarketBrief

A responsive, dark financial news and market intelligence dashboard built with React, TypeScript, Vite, and plain CSS.

> **Demo only:** Market figures are illustrative examples, not live prices. Every initial story is fictional sample content, not real reporting. Story destinations are disabled. Do not use these values for financial decisions.

## Features

- Market overview cards for the S&P 500, Nasdaq Composite, S&P/TSX Composite, USD/CAD, gold, and crude oil.
- Searchable, filterable news feed across six categories, sorted newest first.
- Story bookmarks, research notes, and a starter watchlist.
- Responsive layout, keyboard accessible controls, visible focus indicators, and empty states.
- Browser localStorage for bookmarks, notes, and watchlist.

Local data lives in the current browser profile on the current device. It does not synchronize to your phone, tablet, or another computer. The static GitHub Pages site does not need your Mac to be on and has no backend.

## Requirements

- Node.js 24 LTS (npm is included)
- Git

## Develop

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

The production files are written to `dist/`. The build runs TypeScript checks before bundling. No separate automated test suite is included in this first version.

## Publish on GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds the site on GitHub Actions and publishes the result to GitHub Pages. Deployment runs on GitHub's hosted runners; your personal computers do not serve the production site.

This project is configured for a project site at `https://YOUR-GITHUB-USERNAME.github.io/MarketBrief/`. The repository must be named `MarketBrief` for that base path. If you choose another repository name, update `base` in `vite.config.ts` before publishing.

After pushing the `main` branch, open the repository's **Settings → Pages** and select **GitHub Actions** as the build and deployment source. The workflow needs the repository's standard Pages deployment permissions. No secrets or paid hosting services are needed.

## Data and future integrations

All current stories and quotes are bundled demo data. Real market data and reporting require appropriately licensed sources and API integration. Features currently stored in this browser include bookmarks, notes, and watchlist. Cross-device sync, accounts, shared notes, or private server-side data would need an external service or backend; none is included here.
