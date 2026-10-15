# Paperplane — PDF & Image Toolkit

A free, static toolkit for everyday PDF and image tasks. Paperplane is built with React, TypeScript, Vite, and `pdf-lib`. File processing happens in your browser; selected files are not uploaded to a server.

## Tools

### PDF

- Merge multiple PDFs in the selected order.
- Split a PDF by page number or range, for example `1-3, 5`.
- Rotate selected PDF pages, or leave the page field blank to rotate every page.
- Reorder pages by listing every page exactly once, for example `3, 1, 2`.
- Add page numbers centered at the bottom of every page, with a chosen starting number.
- Add an angled, translucent text watermark to every page.
- Convert JPEG, PNG, WebP, GIF, or BMP images to a multi-page PDF.

### Images

- Convert images to JPEG, PNG, or WebP where the browser can encode that format.
- Resize images to a chosen width and height in pixels.
- Resize while keeping the original aspect ratio, or set width and height independently.
- Compress and convert images with JPEG/WebP quality controls.
- Crop with original, square, 4:3, 16:9, 3:4, or 9:16 framing and a live crop preview.
- Convert selected images to PDF.

Each file must be under 100 MB. Large files and high-resolution images may take substantial device memory or time, especially on phones and tablets. The app prepares a local result and shows a preview before the user downloads it. PDF preview uses the browser's built-in PDF viewer; if the viewer is unavailable, download is still available. Actual output size is shown after image encoding.

Image inputs are JPEG, PNG, WebP, GIF, and BMP when the browser can decode them. Outputs are JPEG, PNG, and WebP when the browser can encode them. Animated GIFs are exported as a still image. PNG does not use the quality slider. JPEG output uses the browser canvas and may not preserve image transparency. Crop preview is a centered or slider-positioned rectangular crop; it does not provide freehand selection.

PDF tools support merge, page-range split, rotate, reorder, page numbering, and a text watermark. Page numbers and watermarks are drawn into page content. They are not editable PDF comments or annotations. Watermarks use a built-in standard PDF font, so stick to basic Latin characters for reliable results. Watermark image, drawing, highlighting, and note annotations are not currently included. The app does not try to remove passwords or bypass PDF restrictions.

## Privacy and file handling

PDF processing uses `pdf-lib` in the page. Image processing uses browser image decoding, canvas encoding, and object URLs. The app does not send selected file contents to a server, save them to localStorage, or collect analytics or personal information. Temporary source and preview object URLs are revoked when cleared or replaced. Files occupy browser memory while processing and previewing; discard the preview or close the tab when finished to release that memory promptly. Cancellation is checked between files and processing stages; a single large PDF operation or browser canvas encode can temporarily block the page before the next cancellation check.

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
