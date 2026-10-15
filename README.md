# Paperplane — PDF & Image Toolkit

A free, static toolkit for everyday PDF and image tasks. Paperplane is built with React, TypeScript, Vite, and `pdf-lib`. File processing happens in your browser; selected files are not uploaded to a server.

## Tools

### PDF

- Merge multiple PDFs in the selected order.
- Split a PDF by page number or range, for example `1-3, 5`.
- Rotate selected PDF pages, or leave the page field blank to rotate every page.
- Reorder pages by listing every page exactly once, for example `3, 1, 2`.
- Convert JPEG, PNG, WebP, GIF, or BMP images to a multi-page PDF.

### Images

- Convert images to JPEG, PNG, or WebP where the browser can encode that format.
- Resize images to a chosen width and height in pixels.
- Compress images by choosing an output format and quality.
- Convert selected images to PDF.

Each file must be under 100 MB. Large files and high-resolution images may take substantial device memory or time, especially on phones and tablets. Animated GIFs are exported as a still image. Browser support for opening and encoding image types varies; unsupported formats produce an error rather than a download. PNG does not use the quality slider. JPEG output uses the browser canvas and may not preserve image transparency.

## Privacy and file handling

PDF processing uses `pdf-lib` in the page. Image processing uses browser image decoding, canvas encoding, and object URLs. The app does not send selected file contents to a server, save them to localStorage, or collect analytics or personal information. Temporary download object URLs are revoked after use. Files occupy browser memory while processing; close the tab after finishing if you want to release that memory promptly.

The app loads its frontend assets from GitHub Pages and uses system fonts. It makes no third-party runtime requests. Once the page and its assets have loaded, file processing can work offline.

## Requirements and local development

- Node.js 24 LTS (npm is included)
- Git

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`. The development server runs on your computer while you use it locally; the published GitHub Pages site is static and does not depend on your Mac.

## Build and preview

```sh
npm run build
npm run preview
```

The production output is written to `dist/`. The build runs the TypeScript project check and Vite bundling. No separate automated test suite is configured.

## GitHub Pages deployment

The repository deploy workflow builds the static site on GitHub-hosted runners and publishes it to GitHub Pages. The Vite base path is `/MarketBrief/` when `GITHUB_PAGES=true`, matching `https://venriquem.github.io/MarketBrief/`. In repository settings, choose **GitHub Actions** as the Pages deployment source. No personal computer or backend serves the published site.

Deployment happens on pushes to `main` or manual workflow dispatch. This project does not use scheduled jobs, news feeds, AI services, analytics, or runtime file uploads.

## Adding tools

The tool directory is defined in `src/data/tools.ts`, IDs and processing option types are in `src/types/tool.ts`, and file operations live in `src/lib/processing.ts`. The responsive shell is in `src/App.tsx`, with its visual system in `src/styles.css`. To add a tool, register its metadata, add its controls to the toolkit UI, and implement the operation in `processFiles`. As the collection grows, tool workspaces can move into `src/components/` or dedicated tool pages. Keep browser memory limits, type validation, clear errors, and on-device processing explicit for every new tool.
